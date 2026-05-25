-- Fix: coaches get unlimited tokens (same as dev)
-- Previously only dev role was bypassed in deduct_token

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
  v_is_coach BOOLEAN;
BEGIN
  -- Devs and coaches get unlimited tokens
  SELECT public.has_role(p_user_id, 'dev') INTO v_is_dev;
  IF v_is_dev THEN RETURN 999999; END IF;

  SELECT public.has_role(p_user_id, 'coach') INTO v_is_coach;
  IF v_is_coach THEN RETURN 999999; END IF;

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
