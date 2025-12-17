-- Add explicit DELETE policy for user_credits table
-- Only admins can delete credit records to protect credit history integrity
CREATE POLICY "Only admins can delete credit records"
ON public.user_credits
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));