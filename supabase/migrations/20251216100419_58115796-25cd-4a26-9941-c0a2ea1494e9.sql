-- Create enum for subscription tiers
CREATE TYPE public.subscription_tier AS ENUM ('free', 'basic', 'pro');

-- Create user_credits table to track credits and subscription
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  credits_remaining INTEGER NOT NULL DEFAULT 3,
  credits_monthly_limit INTEGER NOT NULL DEFAULT 3,
  total_redesigns INTEGER NOT NULL DEFAULT 0,
  subscription_started_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  last_credit_reset TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own credits"
ON public.user_credits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
ON public.user_credits FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_credits_updated_at
BEFORE UPDATE ON public.user_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to initialize credits for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, tier, credits_remaining, credits_monthly_limit)
  VALUES (NEW.id, 'free', 3, 3);
  RETURN NEW;
END;
$$;

-- Trigger to create credits on user signup
CREATE TRIGGER on_auth_user_created_credits
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Function to use a credit (called from edge function)
CREATE OR REPLACE FUNCTION public.use_credit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_credits INTEGER;
  v_tier subscription_tier;
BEGIN
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