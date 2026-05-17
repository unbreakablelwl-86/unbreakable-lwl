-- Fractional token support: change INTEGER → NUMERIC(10,1) for 0.2-per-chat pricing
-- Token costs: 0.2 for chat/motivation/suggestions, 1.0 for builds/analysis

-- 1. Alter token_balances columns
ALTER TABLE public.token_balances
  ALTER COLUMN balance TYPE NUMERIC(10,1) USING balance::NUMERIC(10,1),
  ALTER COLUMN lifetime_earned TYPE NUMERIC(10,1) USING lifetime_earned::NUMERIC(10,1),
  ALTER COLUMN lifetime_spent TYPE NUMERIC(10,1) USING lifetime_spent::NUMERIC(10,1);

ALTER TABLE public.token_balances
  ALTER COLUMN balance SET DEFAULT 0,
  ALTER COLUMN lifetime_earned SET DEFAULT 0,
  ALTER COLUMN lifetime_spent SET DEFAULT 0;

-- 2. Alter token_transactions columns
ALTER TABLE public.token_transactions
  ALTER COLUMN amount TYPE NUMERIC(10,1) USING amount::NUMERIC(10,1),
  ALTER COLUMN balance_after TYPE NUMERIC(10,1) USING balance_after::NUMERIC(10,1);

-- 3. Recreate deduct_token with NUMERIC types
CREATE OR REPLACE FUNCTION public.deduct_token(
  p_user_id UUID,
  p_amount NUMERIC DEFAULT 1,
  p_function_name TEXT DEFAULT 'unknown',
  p_description TEXT DEFAULT 'AI usage'
) RETURNS NUMERIC
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
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
