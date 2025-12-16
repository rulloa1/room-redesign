-- Add INSERT policy for user_credits table
CREATE POLICY "Users can create their own credits" 
ON public.user_credits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);