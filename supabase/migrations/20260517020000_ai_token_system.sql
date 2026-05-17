-- ============================================================
-- AI Token/Credit System
-- ============================================================

-- AI subscription tiers
CREATE TABLE IF NOT EXISTS public.ai_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,           -- 'free', 'starter', 'pro', 'elite'
  display_name TEXT NOT NULL,          -- 'Free', 'Starter', 'Pro', 'Elite'
  monthly_tokens INTEGER NOT NULL,     -- tokens granted per month
  price_pence INTEGER NOT NULL DEFAULT 0, -- monthly price in pence (0 = free)
  stripe_product_id TEXT,              -- Stripe product ID (null for free)
  stripe_price_id TEXT,                -- Stripe price ID (null for free)
  features JSONB DEFAULT '[]'::jsonb,  -- feature list for UI display
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default tiers
INSERT INTO public.ai_tiers (name, display_name, monthly_tokens, price_pence, features, sort_order) VALUES
  ('free', 'Free', 5, 0, '["5 AI tokens on signup", "Try any AI feature", "No commitment"]'::jsonb, 0),
  ('starter', 'Starter', 50, 2500, '["50 tokens/month", "AI programme builder", "AI nutrition plans", "Form feedback"]'::jsonb, 1),
  ('pro', 'Pro', 150, 4900, '["150 tokens/month", "Full AI coaching", "All pillars", "Priority responses"]'::jsonb, 2),
  ('elite', 'Elite', 500, 7900, '["500 tokens/month", "Unlimited feel", "All features", "Perfect for PT students"]'::jsonb, 3)
ON CONFLICT (name) DO NOTHING;

-- User token balance
CREATE TABLE IF NOT EXISTS public.token_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,        -- current token balance
  lifetime_earned INTEGER NOT NULL DEFAULT 0, -- total tokens ever received
  lifetime_spent INTEGER NOT NULL DEFAULT 0,  -- total tokens ever used
  current_tier TEXT REFERENCES public.ai_tiers(name) DEFAULT 'free',
  stripe_subscription_id TEXT,                -- active Stripe sub for AI tier
  tier_renews_at TIMESTAMPTZ,                 -- when next monthly tokens arrive
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Token transaction log (every credit/debit)
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,             -- positive = credit, negative = debit
  balance_after INTEGER NOT NULL,      -- balance after this transaction
  type TEXT NOT NULL,                  -- 'signup_bonus', 'monthly_grant', 'ai_usage', 'admin_grant', 'refund', 'purchase'
  description TEXT,                    -- human-readable description
  metadata JSONB DEFAULT '{}'::jsonb,  -- e.g. { "function": "generate-ai-programme", "model": "gemini" }
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_token_transactions_user ON public.token_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_balances_tier ON public.token_balances(current_tier);

-- RLS
ALTER TABLE public.ai_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- ai_tiers: everyone can read
CREATE POLICY "Anyone can read tiers" ON public.ai_tiers FOR SELECT USING (true);
-- Only devs can modify tiers
CREATE POLICY "Devs can manage tiers" ON public.ai_tiers FOR ALL USING (public.has_role(auth.uid(), 'dev'));

-- token_balances: users see their own, devs see all
CREATE POLICY "Users read own balance" ON public.token_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own balance" ON public.token_balances FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System inserts balance" ON public.token_balances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Devs manage all balances" ON public.token_balances FOR ALL USING (public.has_role(auth.uid(), 'dev'));

-- token_transactions: users see their own, devs see all
CREATE POLICY "Users read own transactions" ON public.token_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System inserts transactions" ON public.token_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Devs manage all transactions" ON public.token_transactions FOR ALL USING (public.has_role(auth.uid(), 'dev'));

-- ============================================================
-- Function: Initialize token balance for new user (signup bonus)
-- ============================================================
CREATE OR REPLACE FUNCTION public.initialize_token_balance(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_free_tokens INTEGER;
BEGIN
  -- Get free tier tokens
  SELECT monthly_tokens INTO v_free_tokens FROM public.ai_tiers WHERE name = 'free';
  IF v_free_tokens IS NULL THEN v_free_tokens := 5; END IF;

  -- Insert balance (skip if exists)
  INSERT INTO public.token_balances (user_id, balance, lifetime_earned, current_tier)
  VALUES (p_user_id, v_free_tokens, v_free_tokens, 'free')
  ON CONFLICT (user_id) DO NOTHING;

  -- Log the signup bonus
  INSERT INTO public.token_transactions (user_id, amount, balance_after, type, description)
  VALUES (p_user_id, v_free_tokens, v_free_tokens, 'signup_bonus', 'Welcome bonus — try the AI coach!')
  ON CONFLICT DO NOTHING;
END;
$$;

-- ============================================================
-- Function: Deduct a token (called by edge functions)
-- Returns remaining balance or -1 if insufficient
-- ============================================================
CREATE OR REPLACE FUNCTION public.deduct_token(
  p_user_id UUID,
  p_amount INTEGER DEFAULT 1,
  p_function_name TEXT DEFAULT 'unknown',
  p_description TEXT DEFAULT 'AI usage'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_is_dev BOOLEAN;
BEGIN
  -- Devs get unlimited tokens
  SELECT public.has_role(p_user_id, 'dev') INTO v_is_dev;
  IF v_is_dev THEN RETURN 999999; END IF;

  -- Lock the row and get current balance
  SELECT balance INTO v_current_balance
  FROM public.token_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- No balance record? Initialize first
  IF v_current_balance IS NULL THEN
    PERFORM public.initialize_token_balance(p_user_id);
    SELECT balance INTO v_current_balance FROM public.token_balances WHERE user_id = p_user_id;
  END IF;

  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RETURN -1;
  END IF;

  -- Deduct
  v_new_balance := v_current_balance - p_amount;
  UPDATE public.token_balances
  SET balance = v_new_balance,
      lifetime_spent = lifetime_spent + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO public.token_transactions (user_id, amount, balance_after, type, description, metadata)
  VALUES (p_user_id, -p_amount, v_new_balance, 'ai_usage', p_description,
          jsonb_build_object('function', p_function_name));

  RETURN v_new_balance;
END;
$$;

-- ============================================================
-- Function: Grant monthly tokens (called by cron/webhook)
-- ============================================================
CREATE OR REPLACE FUNCTION public.grant_monthly_tokens(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tier_name TEXT;
  v_monthly_tokens INTEGER;
  v_new_balance INTEGER;
BEGIN
  SELECT tb.current_tier INTO v_tier_name
  FROM public.token_balances tb WHERE tb.user_id = p_user_id;

  IF v_tier_name IS NULL OR v_tier_name = 'free' THEN
    RETURN 0; -- Free tier doesn't get monthly grants
  END IF;

  SELECT monthly_tokens INTO v_monthly_tokens
  FROM public.ai_tiers WHERE name = v_tier_name;

  -- Add tokens (they stack)
  UPDATE public.token_balances
  SET balance = balance + v_monthly_tokens,
      lifetime_earned = lifetime_earned + v_monthly_tokens,
      tier_renews_at = now() + INTERVAL '1 month',
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;

  -- Log
  INSERT INTO public.token_transactions (user_id, amount, balance_after, type, description)
  VALUES (p_user_id, v_monthly_tokens, v_new_balance, 'monthly_grant',
          'Monthly ' || v_tier_name || ' token grant');

  RETURN v_monthly_tokens;
END;
$$;

-- ============================================================
-- Trigger: Auto-initialize balance on first sign-in
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_tokens()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.initialize_token_balance(NEW.id);
  RETURN NEW;
END;
$$;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_tokens') THEN
    CREATE TRIGGER on_auth_user_created_tokens
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user_tokens();
  END IF;
END;
$$;
