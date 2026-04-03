
-- Table for coach-level Meta credentials
CREATE TABLE public.coach_meta_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_access_token TEXT NOT NULL,
  facebook_page_id TEXT NOT NULL,
  instagram_account_id TEXT,
  page_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.coach_meta_credentials ENABLE ROW LEVEL SECURITY;

-- Only the owner can manage their own credentials
CREATE POLICY "Users can manage own meta credentials"
  ON public.coach_meta_credentials
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add meta tracking columns to social_posts
ALTER TABLE public.social_posts
  ADD COLUMN IF NOT EXISTS meta_post_id TEXT,
  ADD COLUMN IF NOT EXISTS meta_status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS publish_error TEXT;

-- Trigger for updated_at
CREATE TRIGGER update_coach_meta_credentials_updated_at
  BEFORE UPDATE ON public.coach_meta_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
