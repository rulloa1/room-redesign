-- Create trigger on auth.users to create credits on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Add credits for existing user who is missing them
INSERT INTO public.user_credits (user_id, tier, credits_remaining, credits_monthly_limit)
SELECT 'd196a4f0-75e1-44e2-bdc1-12ba2eea24b4', 'free', 3, 3
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_credits WHERE user_id = 'd196a4f0-75e1-44e2-bdc1-12ba2eea24b4'
);