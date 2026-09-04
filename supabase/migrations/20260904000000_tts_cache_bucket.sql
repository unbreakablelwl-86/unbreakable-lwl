
-- Create tts-cache storage bucket (public read) — caches generated ElevenLabs
-- coach-voice audio by a hash of its exact text, so the same phrase (cardio
-- cues, breathing cues, and any other repeated coach line) is only ever
-- billed to ElevenLabs once, no matter how many users or sessions play it.
-- Only the breathing-tts edge function (service role) ever writes to it.
INSERT INTO storage.buckets (id, name, public)
VALUES ('tts-cache', 'tts-cache', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the cached audio files
CREATE POLICY "Public read access for tts cache"
ON storage.objects FOR SELECT
USING (bucket_id = 'tts-cache');
