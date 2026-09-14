-- 1. CRITICAL: users could set their own token balance/tier to anything via direct
--    REST update (USING but no WITH CHECK). No legitimate client write path needs this —
--    deduct_token/spend_tokens (SECURITY DEFINER) and the Stripe webhook (service role)
--    both bypass RLS already.
DROP POLICY IF EXISTS "Users update own balance" ON public.token_balances;

-- 2. HIGH: any authenticated user could update ANY UnTunes auction listing (qual = true,
--    no ownership check), bypassing place_bid/buy_now_card entirely. The properly scoped
--    "Sellers can update own listings" policy remains.
DROP POLICY IF EXISTS "Bidders can update listings" ON public.un_tunes_card_listings;

-- 3. HIGH: purchase_untunes() is an orphaned SQL RPC still directly callable by any
--    authenticated user — it deducts tokens but never grants the item paid for, and
--    duplicates logic that now lives in the purchase-untunes edge function.
REVOKE EXECUTE ON FUNCTION public.purchase_untunes(text, uuid, uuid, boolean) FROM PUBLIC, authenticated;

-- 4. New generic atomic token-spend RPC for purchase edge functions (cards, un-tunes,
--    course purchases). Mirrors deduct_token's row-lock pattern (SELECT ... FOR UPDATE)
--    so purchase-card / purchase-untunes / purchase-untunes-card / purchase-course-with-coins
--    can stop doing read-then-write balance updates in JS (a double-spend race condition).
--    Kept separate from deduct_token (used by AI-generation functions) so its transaction
--    type label is accurate and existing AI-usage logging is untouched.
CREATE OR REPLACE FUNCTION public.spend_tokens(
  p_user_id uuid,
  p_amount numeric,
  p_type text DEFAULT 'purchase',
  p_description text DEFAULT 'Purchase'
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  SELECT balance INTO v_current_balance
  FROM public.token_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    PERFORM public.initialize_token_balance(p_user_id);
    SELECT balance INTO v_current_balance FROM public.token_balances WHERE user_id = p_user_id;
  END IF;

  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RETURN -1;
  END IF;

  v_new_balance := v_current_balance - p_amount;

  UPDATE public.token_balances
  SET balance = v_new_balance,
      lifetime_spent = COALESCE(lifetime_spent, 0) + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO public.token_transactions (user_id, amount, balance_after, type, description)
  VALUES (p_user_id, -p_amount, v_new_balance, p_type, p_description);

  RETURN v_new_balance;
END;
$function$;

REVOKE ALL ON FUNCTION public.spend_tokens(uuid, numeric, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.spend_tokens(uuid, numeric, text, text) TO service_role;

-- 5. Refund counterpart, same locking discipline, for the existing compensating-refund
--    paths in the purchase edge functions.
CREATE OR REPLACE FUNCTION public.refund_tokens(
  p_user_id uuid,
  p_amount numeric,
  p_description text DEFAULT 'Refund'
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  SELECT balance INTO v_current_balance
  FROM public.token_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  v_current_balance := COALESCE(v_current_balance, 0);
  v_new_balance := v_current_balance + p_amount;

  UPDATE public.token_balances
  SET balance = v_new_balance,
      lifetime_spent = GREATEST(COALESCE(lifetime_spent, 0) - p_amount, 0),
      updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO public.token_transactions (user_id, amount, balance_after, type, description)
  VALUES (p_user_id, p_amount, v_new_balance, 'refund', p_description);

  RETURN v_new_balance;
END;
$function$;

REVOKE ALL ON FUNCTION public.refund_tokens(uuid, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refund_tokens(uuid, numeric, text) TO service_role;

-- 6. CRITICAL: Stripe webhook retries can double-credit tokens/re-grant subscriptions
--    because no event is ever recorded as processed. Idempotency ledger:
CREATE TABLE IF NOT EXISTS public.processed_stripe_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.processed_stripe_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.processed_stripe_events FROM PUBLIC, authenticated, anon;
GRANT ALL ON public.processed_stripe_events TO service_role;
