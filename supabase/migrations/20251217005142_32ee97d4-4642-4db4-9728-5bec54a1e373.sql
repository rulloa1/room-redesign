-- Fix remaining security issues

-- 1. Block all direct INSERT on user_credits (created via trigger only)
CREATE POLICY "Credits created by system trigger only"
ON public.user_credits
FOR INSERT
TO authenticated
WITH CHECK (false);

-- 2. Add UPDATE policy for user_roles - only admins can update
CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));