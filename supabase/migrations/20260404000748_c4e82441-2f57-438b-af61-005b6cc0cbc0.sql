
-- Add engagement tracking columns to social_posts
ALTER TABLE public.social_posts 
  ADD COLUMN IF NOT EXISTS likes integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS saves integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shares integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reach integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS impressions integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engagement_rate numeric(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS coach_name text,
  ADD COLUMN IF NOT EXISTS custom_image_url text,
  ADD COLUMN IF NOT EXISTS custom_video_url text,
  ADD COLUMN IF NOT EXISTS script text;

-- Create a storage bucket for social media assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('social-media', 'social-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for social media bucket
CREATE POLICY "Social media assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'social-media');

CREATE POLICY "Authenticated users can upload social media assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'social-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own social media assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'social-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own social media assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'social-media' AND auth.uid()::text = (storage.foldername(name))[1]);
