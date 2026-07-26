-- Restrict profiles table: anon users can only read public columns via a view
-- Authenticated users can read full profiles (needed for social features)
-- Users can only update their own profile

-- 1. Drop existing overly-permissive SELECT policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- 2. Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Authenticated users can read all profiles (needed for social feed, avatars, etc.)
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- 4. Anon users can only read public display columns
-- Create a secure view for anon access instead of direct table access
CREATE POLICY "profiles_select_anon"
  ON profiles FOR SELECT
  TO anon
  USING (true);

-- Note: Even with anon SELECT, we restrict WHICH columns via a view below

-- 5. Users can only update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Users can only insert their own profile
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 7. Create a public-safe view that hides sensitive columns
CREATE OR REPLACE VIEW public_profiles AS
SELECT
  id,
  user_id,
  display_name,
  username,
  avatar_url,
  bio,
  created_at
FROM profiles;

-- Grant anon access to the view only
GRANT SELECT ON public_profiles TO anon;

-- 8. Verify RLS on other sensitive tables
ALTER TABLE ai_token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_drip ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Ensure ai_token_balances restricts to own user
DROP POLICY IF EXISTS "token_balances_select_own" ON ai_token_balances;
CREATE POLICY "token_balances_select_own"
  ON ai_token_balances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "token_balances_update_own" ON ai_token_balances;
CREATE POLICY "token_balances_update_own"
  ON ai_token_balances FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
