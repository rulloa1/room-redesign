-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles (only admins can manage roles)
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update use_credit function to allow admins free usage
CREATE OR REPLACE FUNCTION public.use_credit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_credits INTEGER;
  v_tier subscription_tier;
  v_is_admin BOOLEAN;
BEGIN
  -- Verify caller is operating on their own credits
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot modify another user''s credits';
  END IF;
  
  -- Check if user is admin (admins get unlimited free usage)
  SELECT public.has_role(p_user_id, 'admin') INTO v_is_admin;
  
  IF v_is_admin THEN
    UPDATE public.user_credits
    SET total_redesigns = total_redesigns + 1
    WHERE user_id = p_user_id;
    RETURN TRUE;
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