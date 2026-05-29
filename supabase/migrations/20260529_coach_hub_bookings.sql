-- ══════════════════════════════════════════════════════════════
-- Coach Hub: Stripe Connect + Booking System + Discord Integration
-- ══════════════════════════════════════════════════════════════

-- 1. Add Stripe Connect fields to coaching_profiles
ALTER TABLE coaching_profiles 
  ADD COLUMN IF NOT EXISTS stripe_connect_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_onboarded BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS discord_thread_id TEXT,
  ADD COLUMN IF NOT EXISTS discord_role_id TEXT;

-- 2. Coach public profiles: add Stripe Connect fields
ALTER TABLE coach_public_profiles
  ADD COLUMN IF NOT EXISTS stripe_connect_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_onboarded BOOLEAN DEFAULT false;

-- 3. Coaching Bookings table
CREATE TABLE IF NOT EXISTS coaching_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('30min', '60min', 'hybrid', 'consultation')),
  block_type TEXT NOT NULL DEFAULT 'single' CHECK (block_type IN ('single', 'block4', 'block8', 'block12')),
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  price_gbp NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'confirmed', 'completed', 'cancelled', 'no_show')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'free', 'refunded', 'awaiting_coach_stripe')),
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  sessions_remaining INTEGER DEFAULT 1,
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for booking queries
CREATE INDEX IF NOT EXISTS idx_bookings_coach ON coaching_bookings(coach_id, session_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON coaching_bookings(user_id, session_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON coaching_bookings(status);

-- RLS for coaching_bookings
ALTER TABLE coaching_bookings ENABLE ROW LEVEL SECURITY;

-- Users can see their own bookings
CREATE POLICY "users_own_bookings" ON coaching_bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Coaches can see bookings with them
CREATE POLICY "coaches_see_their_bookings" ON coaching_bookings
  FOR SELECT USING (auth.uid() = coach_id);

-- Users can create bookings
CREATE POLICY "users_create_bookings" ON coaching_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can cancel their own bookings
CREATE POLICY "users_cancel_own" ON coaching_bookings
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (status = 'cancelled');

-- Coaches can update booking status
CREATE POLICY "coaches_update_bookings" ON coaching_bookings
  FOR UPDATE USING (auth.uid() = coach_id);

-- 4. Coach unlock tracking (token gate)
CREATE TABLE IF NOT EXISTS coach_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tokens_spent INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, coach_id)
);

ALTER TABLE coach_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_see_own_unlocks" ON coach_unlocks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_create_unlocks" ON coach_unlocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Discord community setup table
CREATE TABLE IF NOT EXISTS discord_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_name TEXT NOT NULL,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('public', 'coach_clients', 'coach_only', 'admin', 'programme')),
  discord_channel_id TEXT,
  description TEXT,
  auto_assign_on TEXT, -- e.g. 'signup', 'purchase:power', 'coach:john'
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. User Discord role assignments
CREATE TABLE IF NOT EXISTS discord_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discord_user_id TEXT,
  role_name TEXT NOT NULL,
  channel_id UUID REFERENCES discord_channels(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role_name)
);

-- 7. Seed default Discord channels
INSERT INTO discord_channels (channel_name, channel_type, description, auto_assign_on, is_locked) VALUES
  ('welcome', 'public', 'Onboarding flow, auto-assign role based on plan tier', 'signup', false),
  ('power', 'public', 'Strength training Q&A', null, false),
  ('movement', 'public', 'Cardio, mobility, movement Q&A', null, false),
  ('fuel', 'public', 'Nutrition chat, recipe shares', null, false),
  ('mindset', 'public', 'Mental health, meditation, mindset tips', null, false),
  ('uni-qa', 'public', 'University course discussion', null, false),
  ('un-tunes', 'public', 'Music chat, track recommendations', null, false),
  ('help', 'public', 'Support tickets, AI auto-responds first', null, false),
  ('sales', 'public', 'Announcements, drops, promo codes', null, false),
  ('drops', 'public', 'New releases, limited editions', null, false),
  ('coach-hub', 'coach_only', 'All coaches internal chat', null, true),
  ('athlete-flags', 'coach_only', 'AI-flagged athletes needing attention', null, true),
  ('session-notes', 'coach_only', 'Auto-posted session summaries', null, true),
  ('admin', 'admin', 'Platform management, John only', null, true)
ON CONFLICT DO NOTHING;

-- 8. Function to check booking limits
CREATE OR REPLACE FUNCTION check_booking_limit(p_user_id UUID, p_coach_id UUID, p_date DATE)
RETURNS BOOLEAN AS $$
DECLARE
  week_start DATE;
  week_end DATE;
  booking_count INTEGER;
BEGIN
  week_start := p_date - EXTRACT(DOW FROM p_date)::INTEGER + 1; -- Monday
  week_end := week_start + 7;
  
  SELECT COUNT(*) INTO booking_count
  FROM coaching_bookings
  WHERE user_id = p_user_id
    AND coach_id = p_coach_id
    AND session_date >= week_start
    AND session_date < week_end
    AND status != 'cancelled';
  
  RETURN booking_count < 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
