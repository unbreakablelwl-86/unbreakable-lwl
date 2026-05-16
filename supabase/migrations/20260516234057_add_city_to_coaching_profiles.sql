-- Add city column for regional AI tone personalisation
ALTER TABLE public.coaching_profiles
  ADD COLUMN IF NOT EXISTS city TEXT;
