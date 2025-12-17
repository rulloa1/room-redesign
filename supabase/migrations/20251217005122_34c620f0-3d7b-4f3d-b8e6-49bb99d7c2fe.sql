-- Fix user_roles SELECT policy to prevent enumeration of admin users
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Create new policy: admins see all, regular users see only their own roles
CREATE POLICY "Users view own roles, admins view all"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);