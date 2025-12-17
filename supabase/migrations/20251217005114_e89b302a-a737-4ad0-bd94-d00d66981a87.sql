-- Fix critical security issues with user_credits table

-- 1. Drop the existing INSERT policy - credits should only be created by the trigger
DROP POLICY IF EXISTS "Users can create their own credits" ON public.user_credits;

-- 2. Drop the existing UPDATE policy - too permissive
DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;

-- 3. Create a more restrictive UPDATE policy
-- Users should NOT be able to update credit-related fields directly
-- Only allow updates through the use_credit() function which has proper validation
-- This policy blocks all direct user updates - credits managed via RPC only
CREATE POLICY "Credits updated via secure RPC only"
ON public.user_credits
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Note: The handle_new_user_credits trigger creates records on signup
-- The use_credit() function manages credit deduction securely