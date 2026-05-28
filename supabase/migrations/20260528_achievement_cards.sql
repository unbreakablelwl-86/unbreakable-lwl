-- ═══════════════════════════════════════════════════════════════════
-- ACHIEVEMENT CARDS: Programme Trophies & PB Unlock Cards
-- Same card standard as UN-TUNES collectible system
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Achievement Cards table (equivalent to un_tunes_user_cards) ──
CREATE TABLE IF NOT EXISTS achievement_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL CHECK (card_type IN ('programme_trophy', 'pb_personal', 'pb_global')),
  rarity TEXT NOT NULL CHECK (rarity IN ('bronze', 'silver', 'gold', 'diamond', 'platinum')),
  
  -- Programme trophy fields
  programme_type TEXT CHECK (programme_type IN ('power', 'cardio', 'mindset', 'fuel', 'u86')),
  programme_name TEXT,
  programme_id UUID,
  completion_date TIMESTAMPTZ,
  programme_stats JSONB DEFAULT '{}',
  
  -- PB fields (personal & global)
  activity_category TEXT CHECK (activity_category IN ('lift', 'run', 'cycle', 'row', 'swim')),
  exercise_name TEXT,
  pb_value NUMERIC(10,2),
  pb_unit TEXT CHECK (pb_unit IN ('kg', 'seconds', 'pace_per_km')),
  pb_rank INTEGER CHECK (pb_rank BETWEEN 1 AND 3),
  distance_type TEXT,
  
  -- Global ranking fields
  age_category TEXT CHECK (age_category IN ('18-24', '25-34', '35-44', '45-54', '55+')),
  global_percentile NUMERIC(5,2),
  global_rank INTEGER,
  total_in_category INTEGER,
  
  -- Card metadata
  edition_number INTEGER DEFAULT 0,
  is_opened BOOLEAN DEFAULT TRUE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Reference to source record
  source_record_id UUID,
  source_run_id UUID REFERENCES runs(id) ON DELETE SET NULL,
  source_session_id UUID REFERENCES workout_sessions(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_achievement_cards_user ON achievement_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_cards_type ON achievement_cards(card_type);
CREATE INDEX IF NOT EXISTS idx_achievement_cards_rarity ON achievement_cards(rarity);
CREATE INDEX IF NOT EXISTS idx_achievement_cards_exercise ON achievement_cards(exercise_name, user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_cards_global ON achievement_cards(card_type, activity_category, exercise_name, age_category);

-- RLS
ALTER TABLE achievement_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievement cards"
  ON achievement_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view global achievement cards"
  ON achievement_cards FOR SELECT
  USING (card_type = 'pb_global');

CREATE POLICY "Service role can manage all"
  ON achievement_cards FOR ALL
  USING (auth.role() = 'service_role');

-- ── 2. Global PB Leaderboard view ──
CREATE OR REPLACE VIEW pb_leaderboard AS
WITH user_best AS (
  SELECT DISTINCT ON (el.user_id, el.exercise_name)
    el.user_id,
    el.exercise_name,
    el.weight_kg,
    el.actual_reps,
    el.created_at,
    el.session_id,
    p.date_of_birth,
    p.display_name,
    p.avatar_url,
    CASE
      WHEN EXTRACT(YEAR FROM age(el.created_at, p.date_of_birth)) BETWEEN 18 AND 24 THEN '18-24'
      WHEN EXTRACT(YEAR FROM age(el.created_at, p.date_of_birth)) BETWEEN 25 AND 34 THEN '25-34'
      WHEN EXTRACT(YEAR FROM age(el.created_at, p.date_of_birth)) BETWEEN 35 AND 44 THEN '35-44'
      WHEN EXTRACT(YEAR FROM age(el.created_at, p.date_of_birth)) BETWEEN 45 AND 54 THEN '45-54'
      WHEN EXTRACT(YEAR FROM age(el.created_at, p.date_of_birth)) >= 55 THEN '55+'
      ELSE NULL
    END AS age_category,
    -- Epley formula for estimated 1RM
    CASE
      WHEN el.actual_reps = 1 THEN el.weight_kg
      WHEN el.actual_reps > 1 AND el.weight_kg > 0 THEN
        ROUND((el.weight_kg * (1 + el.actual_reps::numeric / 30))::numeric, 1)
      ELSE el.weight_kg
    END AS estimated_1rm
  FROM exercise_logs el
  JOIN profiles p ON p.user_id = el.user_id
  WHERE el.weight_kg > 0 AND el.completed = true
  ORDER BY el.user_id, el.exercise_name, 
    CASE WHEN el.actual_reps = 1 THEN el.weight_kg
         ELSE ROUND((el.weight_kg * (1 + el.actual_reps::numeric / 30))::numeric, 1)
    END DESC
)
SELECT 
  user_id,
  exercise_name,
  weight_kg,
  actual_reps,
  estimated_1rm,
  age_category,
  display_name,
  avatar_url,
  session_id,
  created_at,
  RANK() OVER (
    PARTITION BY exercise_name, age_category
    ORDER BY estimated_1rm DESC
  ) AS rank_in_category,
  COUNT(*) OVER (
    PARTITION BY exercise_name, age_category
  ) AS total_in_category,
  ROUND(
    (1.0 - (RANK() OVER (PARTITION BY exercise_name, age_category ORDER BY estimated_1rm DESC) - 1)::numeric 
    / NULLIF(COUNT(*) OVER (PARTITION BY exercise_name, age_category), 0)) * 100, 
    1
  ) AS percentile
FROM user_best
WHERE age_category IS NOT NULL;

-- Run PB leaderboard (using personal_records + runs)
CREATE OR REPLACE VIEW run_pb_leaderboard AS
WITH best_runs AS (
  SELECT DISTINCT ON (pr.user_id, pr.distance_type)
    pr.user_id,
    pr.distance_type,
    pr.distance_km,
    pr.time_seconds,
    pr.pace_per_km_seconds,
    pr.run_id,
    pr.achieved_at,
    pr.activity_type,
    p.date_of_birth,
    p.display_name,
    p.avatar_url,
    CASE
      WHEN EXTRACT(YEAR FROM age(pr.achieved_at::timestamptz, p.date_of_birth::timestamptz)) BETWEEN 18 AND 24 THEN '18-24'
      WHEN EXTRACT(YEAR FROM age(pr.achieved_at::timestamptz, p.date_of_birth::timestamptz)) BETWEEN 25 AND 34 THEN '25-34'
      WHEN EXTRACT(YEAR FROM age(pr.achieved_at::timestamptz, p.date_of_birth::timestamptz)) BETWEEN 35 AND 44 THEN '35-44'
      WHEN EXTRACT(YEAR FROM age(pr.achieved_at::timestamptz, p.date_of_birth::timestamptz)) BETWEEN 45 AND 54 THEN '45-54'
      WHEN EXTRACT(YEAR FROM age(pr.achieved_at::timestamptz, p.date_of_birth::timestamptz)) >= 55 THEN '55+'
      ELSE NULL
    END AS age_category
  FROM personal_records pr
  JOIN profiles p ON p.user_id = pr.user_id
  WHERE pr.time_seconds IS NOT NULL
  ORDER BY pr.user_id, pr.distance_type, pr.time_seconds ASC
)
SELECT
  user_id,
  distance_type,
  distance_km,
  time_seconds,
  pace_per_km_seconds,
  activity_type,
  age_category,
  display_name,
  avatar_url,
  run_id,
  achieved_at,
  RANK() OVER (
    PARTITION BY distance_type, age_category, activity_type
    ORDER BY time_seconds ASC
  ) AS rank_in_category,
  COUNT(*) OVER (
    PARTITION BY distance_type, age_category, activity_type
  ) AS total_in_category,
  ROUND(
    (1.0 - (RANK() OVER (PARTITION BY distance_type, age_category, activity_type ORDER BY time_seconds ASC) - 1)::numeric
    / NULLIF(COUNT(*) OVER (PARTITION BY distance_type, age_category, activity_type), 0)) * 100,
    1
  ) AS percentile
FROM best_runs
WHERE age_category IS NOT NULL;

-- ── 3. RPCs ──

-- Award programme trophy card
CREATE OR REPLACE FUNCTION award_programme_trophy(
  p_user_id UUID,
  p_programme_type TEXT,
  p_programme_name TEXT,
  p_programme_id UUID,
  p_stats JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
  v_rarity TEXT;
  v_card_id UUID;
BEGIN
  -- Count existing programme completions for rarity
  SELECT COUNT(*) INTO v_count
  FROM achievement_cards
  WHERE user_id = p_user_id
    AND card_type = 'programme_trophy';
  
  -- Rarity based on total programmes completed
  v_rarity := CASE
    WHEN v_count >= 20 THEN 'platinum'  -- 20+ programmes = platinum trophy
    WHEN v_count >= 10 THEN 'diamond'   -- 10+ = diamond
    WHEN v_count >= 5  THEN 'gold'      -- 5+ = gold
    WHEN v_count >= 2  THEN 'silver'    -- 2+ = silver
    ELSE 'bronze'                        -- First completion = bronze
  END;
  
  INSERT INTO achievement_cards (
    user_id, card_type, rarity, programme_type, programme_name,
    programme_id, completion_date, programme_stats, earned_at
  ) VALUES (
    p_user_id, 'programme_trophy', v_rarity, p_programme_type,
    p_programme_name, p_programme_id, now(), p_stats, now()
  )
  RETURNING id INTO v_card_id;
  
  RETURN v_card_id;
END;
$$;

-- Award PB card (personal top 3)
CREATE OR REPLACE FUNCTION award_pb_card(
  p_user_id UUID,
  p_activity_category TEXT,
  p_exercise_name TEXT,
  p_value NUMERIC,
  p_unit TEXT,
  p_rank INTEGER,
  p_distance_type TEXT DEFAULT NULL,
  p_source_run_id UUID DEFAULT NULL,
  p_source_session_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rarity TEXT;
  v_card_id UUID;
  v_existing UUID;
BEGIN
  -- Rarity = rank position
  v_rarity := CASE p_rank
    WHEN 1 THEN 'gold'
    WHEN 2 THEN 'silver'
    WHEN 3 THEN 'bronze'
    ELSE 'bronze'
  END;
  
  -- Check if card already exists for this exercise + rank
  SELECT id INTO v_existing
  FROM achievement_cards
  WHERE user_id = p_user_id
    AND card_type = 'pb_personal'
    AND exercise_name = p_exercise_name
    AND pb_rank = p_rank
    AND activity_category = p_activity_category;
  
  IF v_existing IS NOT NULL THEN
    -- Update existing card with new PB value
    UPDATE achievement_cards SET
      pb_value = p_value,
      rarity = v_rarity,
      source_run_id = COALESCE(p_source_run_id, source_run_id),
      source_session_id = COALESCE(p_source_session_id, source_session_id),
      earned_at = now(),
      updated_at = now()
    WHERE id = v_existing;
    RETURN v_existing;
  END IF;
  
  INSERT INTO achievement_cards (
    user_id, card_type, rarity, activity_category, exercise_name,
    pb_value, pb_unit, pb_rank, distance_type,
    source_run_id, source_session_id, earned_at
  ) VALUES (
    p_user_id, 'pb_personal', v_rarity, p_activity_category,
    p_exercise_name, p_value, p_unit, p_rank, p_distance_type,
    p_source_run_id, p_source_session_id, now()
  )
  RETURNING id INTO v_card_id;
  
  RETURN v_card_id;
END;
$$;

-- Check & award global ranking cards (diamond/platinum)
CREATE OR REPLACE FUNCTION check_global_pb_ranking(
  p_user_id UUID,
  p_activity_category TEXT,
  p_exercise_name TEXT,
  p_distance_type TEXT DEFAULT NULL
)
RETURNS TABLE(card_id UUID, rarity TEXT, percentile NUMERIC, rank_position INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_percentile NUMERIC;
  v_rank INTEGER;
  v_total INTEGER;
  v_age_cat TEXT;
  v_rarity TEXT;
  v_card_id UUID;
  v_existing UUID;
BEGIN
  -- Get user age category
  SELECT 
    CASE
      WHEN EXTRACT(YEAR FROM age(now(), p.date_of_birth::timestamptz)) BETWEEN 18 AND 24 THEN '18-24'
      WHEN EXTRACT(YEAR FROM age(now(), p.date_of_birth::timestamptz)) BETWEEN 25 AND 34 THEN '25-34'
      WHEN EXTRACT(YEAR FROM age(now(), p.date_of_birth::timestamptz)) BETWEEN 35 AND 44 THEN '35-44'
      WHEN EXTRACT(YEAR FROM age(now(), p.date_of_birth::timestamptz)) BETWEEN 45 AND 54 THEN '45-54'
      WHEN EXTRACT(YEAR FROM age(now(), p.date_of_birth::timestamptz)) >= 55 THEN '55+'
    END INTO v_age_cat
  FROM profiles p
  WHERE p.user_id = p_user_id AND p.date_of_birth IS NOT NULL;
  
  IF v_age_cat IS NULL THEN
    RETURN;
  END IF;
  
  -- Get ranking based on activity type
  IF p_activity_category = 'lift' THEN
    SELECT lb.rank_in_category, lb.total_in_category, lb.percentile
    INTO v_rank, v_total, v_percentile
    FROM pb_leaderboard lb
    WHERE lb.user_id = p_user_id
      AND lb.exercise_name = p_exercise_name
      AND lb.age_category = v_age_cat;
  ELSE
    SELECT lb.rank_in_category, lb.total_in_category, lb.percentile
    INTO v_rank, v_total, v_percentile
    FROM run_pb_leaderboard lb
    WHERE lb.user_id = p_user_id
      AND lb.distance_type = p_distance_type
      AND lb.age_category = v_age_cat
      AND lb.activity_type = p_activity_category;
  END IF;
  
  IF v_percentile IS NULL THEN
    RETURN;
  END IF;
  
  -- Determine rarity from percentile
  -- Top 1% = Platinum, Top 5% = Diamond
  IF v_percentile >= 99 THEN
    v_rarity := 'platinum';
  ELSIF v_percentile >= 95 THEN
    v_rarity := 'diamond';
  ELSE
    RETURN; -- Not elite enough for global card
  END IF;
  
  -- Check existing global card
  SELECT id INTO v_existing
  FROM achievement_cards
  WHERE user_id = p_user_id
    AND card_type = 'pb_global'
    AND exercise_name = COALESCE(p_exercise_name, p_distance_type)
    AND age_category = v_age_cat;
  
  IF v_existing IS NOT NULL THEN
    -- Update if rarity improved
    UPDATE achievement_cards SET
      rarity = v_rarity,
      global_percentile = v_percentile,
      global_rank = v_rank,
      total_in_category = v_total,
      updated_at = now()
    WHERE id = v_existing
      AND (rarity != v_rarity OR global_percentile != v_percentile);
    v_card_id := v_existing;
  ELSE
    INSERT INTO achievement_cards (
      user_id, card_type, rarity, activity_category,
      exercise_name, age_category, global_percentile,
      global_rank, total_in_category, earned_at
    ) VALUES (
      p_user_id, 'pb_global', v_rarity, p_activity_category,
      COALESCE(p_exercise_name, p_distance_type), v_age_cat,
      v_percentile, v_rank, v_total, now()
    )
    RETURNING id INTO v_card_id;
  END IF;
  
  RETURN QUERY SELECT v_card_id, v_rarity, v_percentile, v_rank;
END;
$$;

-- Get user's achievement card collection
CREATE OR REPLACE FUNCTION get_achievement_collection(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  card_type TEXT,
  rarity TEXT,
  programme_type TEXT,
  programme_name TEXT,
  activity_category TEXT,
  exercise_name TEXT,
  pb_value NUMERIC,
  pb_unit TEXT,
  pb_rank INTEGER,
  distance_type TEXT,
  age_category TEXT,
  global_percentile NUMERIC,
  global_rank INTEGER,
  total_in_category INTEGER,
  programme_stats JSONB,
  earned_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id, card_type, rarity, programme_type, programme_name,
    activity_category, exercise_name, pb_value, pb_unit, pb_rank,
    distance_type, age_category, global_percentile, global_rank,
    total_in_category, programme_stats, earned_at
  FROM achievement_cards
  WHERE user_id = p_user_id
  ORDER BY earned_at DESC;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- DONE — Tables, views, RPCs all created
-- ═══════════════════════════════════════════════════════════════════
