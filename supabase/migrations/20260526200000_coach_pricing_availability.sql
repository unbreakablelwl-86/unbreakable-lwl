-- Coach Profile: 1-to-1 pricing structure + availability calendar
-- Adds session pricing, block packages, and availability slots

-- ─── Extend coach_public_profiles with pricing fields ───
ALTER TABLE coach_public_profiles
  ADD COLUMN IF NOT EXISTS session_rate_30min NUMERIC(7,2),
  ADD COLUMN IF NOT EXISTS session_rate_60min NUMERIC(7,2),
  ADD COLUMN IF NOT EXISTS online_monthly_rate NUMERIC(7,2),
  ADD COLUMN IF NOT EXISTS block_4_price NUMERIC(7,2),
  ADD COLUMN IF NOT EXISTS block_8_price NUMERIC(7,2),
  ADD COLUMN IF NOT EXISTS block_12_price NUMERIC(7,2),
  ADD COLUMN IF NOT EXISTS block_session_length TEXT DEFAULT '60min' CHECK (block_session_length IN ('30min', '60min')),
  ADD COLUMN IF NOT EXISTS free_consultation BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS consultation_length TEXT DEFAULT '15min' CHECK (consultation_length IN ('15min', '30min'));

-- ─── Availability slots table ───
CREATE TABLE IF NOT EXISTS coach_availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 6=Sat
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_length TEXT NOT NULL DEFAULT '60min' CHECK (session_length IN ('30min', '60min')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Prevent duplicate slots for same coach/day/time
  UNIQUE (user_id, day_of_week, start_time, session_length)
);

-- ─── Blocked dates (holidays, unavailable days) ───
CREATE TABLE IF NOT EXISTS coach_blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE (user_id, blocked_date)
);

-- ─── RLS for availability slots ───
ALTER TABLE coach_availability_slots ENABLE ROW LEVEL SECURITY;

-- Anyone can view active slots (for booking view)
CREATE POLICY "Anyone can view active availability slots"
  ON coach_availability_slots FOR SELECT
  USING (is_active = true);

-- Coach manages own slots
CREATE POLICY "Coaches manage own availability"
  ON coach_availability_slots FOR ALL
  USING (user_id = auth.uid());

-- Admin full access
CREATE POLICY "Admin full access availability"
  ON coach_availability_slots FOR ALL
  USING (is_admin_or_owner(auth.uid()));

-- ─── RLS for blocked dates ───
ALTER TABLE coach_blocked_dates ENABLE ROW LEVEL SECURITY;

-- Anyone can see blocked dates (for booking view)
CREATE POLICY "Anyone can view blocked dates"
  ON coach_blocked_dates FOR SELECT
  USING (true);

-- Coach manages own blocked dates
CREATE POLICY "Coaches manage own blocked dates"
  ON coach_blocked_dates FOR ALL
  USING (user_id = auth.uid());

-- Admin full access
CREATE POLICY "Admin full access blocked dates"
  ON coach_blocked_dates FOR ALL
  USING (is_admin_or_owner(auth.uid()));

-- ─── Updated at trigger for coach_public_profiles ───
-- (already exists from original migration, just ensure it covers new columns)
