-- Fix profile visibility: dev/coach can see all profiles, default public for new users
-- Bug: Jakub's profile showed "doesn't exist" to John because is_public=false and no friend/coach relationship

-- 1. Update RLS policy to allow admin/dev/coach to see ALL profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
USING (
  (auth.uid() = user_id)
  OR (is_public = true)
  OR are_friends(auth.uid(), user_id)
  OR is_admin_or_owner(auth.uid())
);

-- 2. Default new profiles to public (social platform)
ALTER TABLE public.profiles ALTER COLUMN is_public SET DEFAULT true;
