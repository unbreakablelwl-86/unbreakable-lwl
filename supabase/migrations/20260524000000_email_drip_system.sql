-- ═══════════════════════════════════════════════════════════════════
-- Email Drip System — onboarding emails over 7 days
-- ═══════════════════════════════════════════════════════════════════

-- 1. Create the email_drip table
CREATE TABLE IF NOT EXISTS public.email_drip (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number >= 0 AND day_number <= 7),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for the send-drip-emails function queries
CREATE INDEX IF NOT EXISTS idx_email_drip_pending
  ON public.email_drip (status, scheduled_for)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_email_drip_user
  ON public.email_drip (user_id);

-- Prevent duplicate drip emails (one per user per day)
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_drip_unique_day
  ON public.email_drip (user_id, day_number);

-- RLS: users can only read their own drip records
ALTER TABLE public.email_drip ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own drip emails"
  ON public.email_drip FOR SELECT
  USING (auth.uid() = user_id);

-- Service role (edge functions) can do everything via service_role key

-- 2. Function to schedule drip emails on signup
CREATE OR REPLACE FUNCTION public.schedule_onboarding_emails()
RETURNS TRIGGER AS $$
BEGIN
  -- Schedule 8 emails: Day 0 (immediate) through Day 7
  INSERT INTO public.email_drip (user_id, email, day_number, scheduled_for)
  VALUES
    (NEW.id, NEW.email, 0, now()),                          -- Welcome (immediate)
    (NEW.id, NEW.email, 1, now() + interval '1 day'),       -- Install the app
    (NEW.id, NEW.email, 2, now() + interval '2 days'),      -- Your toolkit
    (NEW.id, NEW.email, 3, now() + interval '3 days'),      -- Community
    (NEW.id, NEW.email, 4, now() + interval '4 days'),      -- University
    (NEW.id, NEW.email, 5, now() + interval '5 days'),      -- AI Coach
    (NEW.id, NEW.email, 6, now() + interval '6 days'),      -- Tracking & Tools
    (NEW.id, NEW.email, 7, now() + interval '7 days')       -- The close
  ON CONFLICT (user_id, day_number) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger: fire on new user creation in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_schedule_emails ON auth.users;
CREATE TRIGGER on_auth_user_created_schedule_emails
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.schedule_onboarding_emails();
