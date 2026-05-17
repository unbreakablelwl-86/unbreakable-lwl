-- Set default is_public to false for new profiles
ALTER TABLE profiles ALTER COLUMN is_public SET DEFAULT false;

-- Set John's (founder) profile to private
UPDATE profiles SET is_public = false WHERE user_id = 'c219f448-c05a-4fe3-ae11-793222b7dced';

-- Add unique constraint to follows table for upsert support
ALTER TABLE follows ADD CONSTRAINT follows_follower_following_unique UNIQUE (follower_id, following_id);

-- Add unique constraint to post_kudos for upsert support
DO $$ BEGIN
  ALTER TABLE post_kudos ADD CONSTRAINT post_kudos_post_user_unique UNIQUE (post_id, user_id);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
