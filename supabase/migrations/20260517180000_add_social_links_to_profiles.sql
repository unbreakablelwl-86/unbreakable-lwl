-- Add social media handle columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS social_instagram text,
  ADD COLUMN IF NOT EXISTS social_tiktok    text,
  ADD COLUMN IF NOT EXISTS social_twitter   text,
  ADD COLUMN IF NOT EXISTS social_facebook  text,
  ADD COLUMN IF NOT EXISTS social_youtube   text,
  ADD COLUMN IF NOT EXISTS social_snapchat  text;

-- Allow null (optional), no constraints beyond text type
COMMENT ON COLUMN profiles.social_instagram IS 'Instagram handle (without @)';
COMMENT ON COLUMN profiles.social_tiktok    IS 'TikTok handle (without @)';
COMMENT ON COLUMN profiles.social_twitter   IS 'X/Twitter handle (without @)';
COMMENT ON COLUMN profiles.social_facebook  IS 'Facebook profile URL or username';
COMMENT ON COLUMN profiles.social_youtube   IS 'YouTube channel handle or URL';
COMMENT ON COLUMN profiles.social_snapchat  IS 'Snapchat username';
