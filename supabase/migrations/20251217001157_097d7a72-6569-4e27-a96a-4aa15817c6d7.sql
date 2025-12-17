-- Add authorization check to use_credit function to prevent direct RPC abuse
CREATE OR REPLACE FUNCTION public.use_credit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_credits INTEGER;
  v_tier subscription_tier;
BEGIN
  -- Verify caller is operating on their own credits
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot modify another user''s credits';
  END IF;
  
  SELECT credits_remaining, tier INTO v_credits, v_tier
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Pro tier has unlimited credits
  IF v_tier = 'pro' THEN
    UPDATE public.user_credits
    SET total_redesigns = total_redesigns + 1
    WHERE user_id = p_user_id;
    RETURN TRUE;
  END IF;
  
  -- Check if user has credits
  IF v_credits <= 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct credit
  UPDATE public.user_credits
  SET credits_remaining = credits_remaining - 1,
      total_redesigns = total_redesigns + 1
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$;