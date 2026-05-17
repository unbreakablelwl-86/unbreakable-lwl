-- Add sport preference column to coaching_profiles
ALTER TABLE public.coaching_profiles
ADD COLUMN IF NOT EXISTS sport_preference text DEFAULT NULL;

COMMENT ON COLUMN public.coaching_profiles.sport_preference IS 'User preferred sport from onboarding (e.g. Football, Boxing, Rugby). Used by AI coach for sport-specific programme building.';
