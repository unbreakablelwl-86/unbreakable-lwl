-- Coaching Check-in System (PT Distinction style)
-- Coaches schedule periodic check-ins, athletes submit them

CREATE TABLE IF NOT EXISTS coaching_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES coaching_assignments(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id),
  athlete_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Check-in metadata
  check_in_number INT DEFAULT 1,
  due_date DATE,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'reviewed', 'skipped')),
  
  -- Body measurements
  weight_kg NUMERIC(5,1),
  body_fat_pct NUMERIC(4,1),
  waist_cm NUMERIC(5,1),
  chest_cm NUMERIC(5,1),
  hips_cm NUMERIC(5,1),
  arm_cm NUMERIC(5,1),
  thigh_cm NUMERIC(5,1),
  
  -- Wellness
  energy_level INT CHECK (energy_level BETWEEN 1 AND 10),
  sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 10),
  stress_level INT CHECK (stress_level BETWEEN 1 AND 10),
  mood INT CHECK (mood BETWEEN 1 AND 10),
  soreness INT CHECK (soreness BETWEEN 1 AND 10),
  
  -- Compliance
  training_compliance INT CHECK (training_compliance BETWEEN 0 AND 100),
  nutrition_compliance INT CHECK (nutrition_compliance BETWEEN 0 AND 100),
  steps_avg INT,
  water_litres NUMERIC(3,1),
  
  -- Text fields
  wins TEXT,
  challenges TEXT,
  athlete_notes TEXT,
  coach_response TEXT,
  
  -- Progress photos (stored as Supabase Storage URLs)
  photo_front TEXT,
  photo_side TEXT,
  photo_back TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_check_ins_assignment ON coaching_check_ins(assignment_id);
CREATE INDEX idx_check_ins_athlete ON coaching_check_ins(athlete_id);
CREATE INDEX idx_check_ins_coach ON coaching_check_ins(coach_id);
CREATE INDEX idx_check_ins_status ON coaching_check_ins(status);

-- RLS
ALTER TABLE coaching_check_ins ENABLE ROW LEVEL SECURITY;

-- Athletes can see and update their own check-ins
CREATE POLICY "Athletes can view own check-ins"
  ON coaching_check_ins FOR SELECT
  USING (athlete_id = auth.uid());

CREATE POLICY "Athletes can update own check-ins"
  ON coaching_check_ins FOR UPDATE
  USING (athlete_id = auth.uid());

-- Coaches can manage check-ins for their athletes
CREATE POLICY "Coaches can view assigned check-ins"
  ON coaching_check_ins FOR SELECT
  USING (coach_id = auth.uid());

CREATE POLICY "Coaches can insert check-ins"
  ON coaching_check_ins FOR INSERT
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coaches can update assigned check-ins"
  ON coaching_check_ins FOR UPDATE
  USING (coach_id = auth.uid());

CREATE POLICY "Coaches can delete assigned check-ins"
  ON coaching_check_ins FOR DELETE
  USING (coach_id = auth.uid());

-- Dev/admin can do everything
CREATE POLICY "Admins full access check-ins"
  ON coaching_check_ins FOR ALL
  USING (is_admin_or_owner(auth.uid()));


-- Coach profiles table (public-facing coach info)
CREATE TABLE IF NOT EXISTS coach_public_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Bio
  headline TEXT,
  bio TEXT,
  specializations TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  years_experience INT,
  
  -- Coaching details
  coaching_style TEXT,
  ideal_client TEXT,
  check_in_frequency TEXT DEFAULT 'weekly' CHECK (check_in_frequency IN ('weekly', 'biweekly', 'monthly')),
  max_clients INT DEFAULT 20,
  accepting_clients BOOLEAN DEFAULT true,
  
  -- Pricing
  monthly_price_gbp NUMERIC(7,2),
  currency TEXT DEFAULT 'GBP',
  
  -- Social/contact
  instagram_handle TEXT,
  website_url TEXT,
  
  -- Visibility
  is_published BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE coach_public_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view published profiles
CREATE POLICY "Anyone can view published coach profiles"
  ON coach_public_profiles FOR SELECT
  USING (is_published = true);

-- Coach can manage their own profile
CREATE POLICY "Coaches can manage own profile"
  ON coach_public_profiles FOR ALL
  USING (user_id = auth.uid());

-- Admin full access
CREATE POLICY "Admin full access coach profiles"
  ON coach_public_profiles FOR ALL
  USING (is_admin_or_owner(auth.uid()));
