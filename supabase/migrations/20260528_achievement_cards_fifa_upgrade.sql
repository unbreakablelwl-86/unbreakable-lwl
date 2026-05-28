-- ═══════════════════════════════════════════════════════════════════
-- ACHIEVEMENT CARDS: FIFA Ultimate Team Standard Upgrade
-- Adds: overall rating, 6-stat system, AI bio, card numbering,
-- exercise artwork cache, athlete stats
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Add FIFA-standard fields to achievement_cards ──
ALTER TABLE achievement_cards 
  ADD COLUMN IF NOT EXISTS overall_rating INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS athlete_stats JSONB DEFAULT '{"str":0,"pwr":0,"spd":0,"end":0,"agi":0,"rec":0}',
  ADD COLUMN IF NOT EXISTS bio_line TEXT,
  ADD COLUMN IF NOT EXISTS card_number TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS category_label TEXT;

-- ── 2. Exercise Artwork Cache table ──
CREATE TABLE IF NOT EXISTS exercise_artwork_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_name TEXT NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  image_url TEXT NOT NULL,
  prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(exercise_name, sex)
);

ALTER TABLE exercise_artwork_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercise artwork"
  ON exercise_artwork_cache FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage artwork"
  ON exercise_artwork_cache FOR ALL
  USING (auth.role() = 'service_role');

-- ── 3. Calculate athlete stats from training data ──
CREATE OR REPLACE FUNCTION calculate_athlete_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSONB;
  v_total_volume NUMERIC := 0;
  v_max_e1rm NUMERIC := 0;
  v_total_sessions INTEGER := 0;
  v_avg_session_duration NUMERIC := 0;
  v_total_run_distance NUMERIC := 0;
  v_best_pace NUMERIC := 0;
  v_exercise_variety INTEGER := 0;
  v_consistency_pct NUMERIC := 0;
  -- Stat values (0-99 scale)
  v_str INTEGER := 0;
  v_pwr INTEGER := 0;
  v_spd INTEGER := 0;
  v_end INTEGER := 0;
  v_agi INTEGER := 0;
  v_rec INTEGER := 0;
  v_overall INTEGER := 0;
BEGIN
  -- STRENGTH (STR): Based on total volume lifted + max e1RM
  SELECT 
    COALESCE(SUM(weight_kg * COALESCE(actual_reps, 1)), 0),
    COALESCE(MAX(CASE 
      WHEN actual_reps = 1 THEN weight_kg
      WHEN actual_reps > 1 AND weight_kg > 0 THEN 
        ROUND((weight_kg * (1 + actual_reps::numeric / 30))::numeric, 1)
      ELSE weight_kg 
    END), 0)
  INTO v_total_volume, v_max_e1rm
  FROM exercise_logs
  WHERE user_id = p_user_id AND completed = true AND weight_kg > 0;

  -- Scale STR: 0-99 based on volume tiers
  v_str := LEAST(99, GREATEST(0,
    CASE
      WHEN v_total_volume >= 500000 THEN 90 + LEAST(9, (v_total_volume - 500000)::integer / 100000)
      WHEN v_total_volume >= 200000 THEN 75 + ((v_total_volume - 200000) / 300000 * 15)::integer
      WHEN v_total_volume >= 50000 THEN 55 + ((v_total_volume - 50000) / 150000 * 20)::integer
      WHEN v_total_volume >= 10000 THEN 35 + ((v_total_volume - 10000) / 40000 * 20)::integer
      WHEN v_total_volume >= 1000 THEN 15 + ((v_total_volume - 1000) / 9000 * 20)::integer
      WHEN v_total_volume > 0 THEN (v_total_volume / 1000 * 15)::integer
      ELSE 0
    END
  ));

  -- POWER (PWR): Based on max e1RM relative to bodyweight benchmarks
  v_pwr := LEAST(99, GREATEST(0,
    CASE
      WHEN v_max_e1rm >= 250 THEN 90 + LEAST(9, ((v_max_e1rm - 250) / 50 * 9)::integer)
      WHEN v_max_e1rm >= 180 THEN 75 + ((v_max_e1rm - 180) / 70 * 15)::integer
      WHEN v_max_e1rm >= 120 THEN 55 + ((v_max_e1rm - 120) / 60 * 20)::integer
      WHEN v_max_e1rm >= 60 THEN 30 + ((v_max_e1rm - 60) / 60 * 25)::integer
      WHEN v_max_e1rm > 0 THEN (v_max_e1rm / 60 * 30)::integer
      ELSE 0
    END
  ));

  -- Session counts + avg duration
  SELECT 
    COUNT(*),
    COALESCE(AVG(duration_seconds), 0)
  INTO v_total_sessions, v_avg_session_duration
  FROM workout_sessions
  WHERE user_id = p_user_id AND status = 'completed';

  -- SPEED (SPD): Based on best pace from runs
  SELECT 
    COALESCE(SUM(distance_km), 0),
    COALESCE(MIN(NULLIF(pace_per_km_seconds, 0)), 0)
  INTO v_total_run_distance, v_best_pace
  FROM runs
  WHERE user_id = p_user_id;

  v_spd := LEAST(99, GREATEST(0,
    CASE
      WHEN v_best_pace > 0 AND v_best_pace <= 180 THEN 95  -- sub-3:00/km elite
      WHEN v_best_pace > 0 AND v_best_pace <= 240 THEN 80 + ((240 - v_best_pace)::numeric / 60 * 15)::integer
      WHEN v_best_pace > 0 AND v_best_pace <= 330 THEN 60 + ((330 - v_best_pace)::numeric / 90 * 20)::integer
      WHEN v_best_pace > 0 AND v_best_pace <= 420 THEN 40 + ((420 - v_best_pace)::numeric / 90 * 20)::integer
      WHEN v_best_pace > 0 AND v_best_pace <= 600 THEN 15 + ((600 - v_best_pace)::numeric / 180 * 25)::integer
      WHEN v_best_pace > 0 THEN 10
      WHEN v_total_run_distance > 0 THEN 20  -- has runs but no pace data
      ELSE 0
    END
  ));

  -- ENDURANCE (END): Based on total run distance + session count
  v_end := LEAST(99, GREATEST(0,
    CASE
      WHEN v_total_run_distance >= 1000 THEN 90 + LEAST(9, ((v_total_run_distance - 1000) / 500)::integer)
      WHEN v_total_run_distance >= 500 THEN 75 + ((v_total_run_distance - 500) / 500 * 15)::integer
      WHEN v_total_run_distance >= 200 THEN 55 + ((v_total_run_distance - 200) / 300 * 20)::integer
      WHEN v_total_run_distance >= 50 THEN 30 + ((v_total_run_distance - 50) / 150 * 25)::integer
      WHEN v_total_run_distance > 0 THEN (v_total_run_distance / 50 * 30)::integer
      ELSE 0
    END
    + LEAST(15, v_total_sessions / 4)  -- bonus from workout sessions
  ));

  -- AGILITY (AGI): Based on exercise variety (unique exercises performed)
  SELECT COUNT(DISTINCT exercise_name)
  INTO v_exercise_variety
  FROM exercise_logs
  WHERE user_id = p_user_id AND completed = true;

  v_agi := LEAST(99, GREATEST(0,
    CASE
      WHEN v_exercise_variety >= 50 THEN 85 + LEAST(14, (v_exercise_variety - 50) / 5)
      WHEN v_exercise_variety >= 30 THEN 65 + ((v_exercise_variety - 30)::numeric / 20 * 20)::integer
      WHEN v_exercise_variety >= 15 THEN 45 + ((v_exercise_variety - 15)::numeric / 15 * 20)::integer
      WHEN v_exercise_variety >= 5 THEN 20 + ((v_exercise_variety - 5)::numeric / 10 * 25)::integer
      WHEN v_exercise_variety > 0 THEN v_exercise_variety * 4
      ELSE 0
    END
  ));

  -- RECOVERY (REC): Based on session consistency (sessions per week over last 12 weeks)
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN
        ROUND(COUNT(*)::numeric / GREATEST(1, 
          EXTRACT(EPOCH FROM (now() - MIN(started_at))) / 604800
        ), 1)
      ELSE 0
    END
  INTO v_consistency_pct
  FROM workout_sessions
  WHERE user_id = p_user_id 
    AND status = 'completed'
    AND started_at >= now() - interval '12 weeks';

  v_rec := LEAST(99, GREATEST(0,
    CASE
      WHEN v_consistency_pct >= 6 THEN 90 + LEAST(9, ((v_consistency_pct - 6) * 3)::integer)
      WHEN v_consistency_pct >= 4 THEN 70 + ((v_consistency_pct - 4) / 2 * 20)::integer
      WHEN v_consistency_pct >= 3 THEN 55 + ((v_consistency_pct - 3) * 15)::integer
      WHEN v_consistency_pct >= 2 THEN 35 + ((v_consistency_pct - 2) * 20)::integer
      WHEN v_consistency_pct >= 1 THEN 15 + ((v_consistency_pct - 1) * 20)::integer
      WHEN v_consistency_pct > 0 THEN (v_consistency_pct * 15)::integer
      ELSE 0
    END
  ));

  -- OVERALL RATING: Weighted average (strength-biased for a lifting platform)
  v_overall := LEAST(99, GREATEST(0, (
    v_str * 25 +  -- 25% weight
    v_pwr * 25 +  -- 25% weight
    v_spd * 12 +  -- 12% weight
    v_end * 15 +  -- 15% weight
    v_agi * 10 +  -- 10% weight
    v_rec * 13    -- 13% weight
  ) / 100));

  v_stats := jsonb_build_object(
    'str', v_str,
    'pwr', v_pwr,
    'spd', v_spd,
    'end', v_end,
    'agi', v_agi,
    'rec', v_rec,
    'overall', v_overall,
    'total_volume_kg', v_total_volume,
    'max_e1rm', v_max_e1rm,
    'total_sessions', v_total_sessions,
    'total_run_km', v_total_run_distance,
    'exercise_variety', v_exercise_variety
  );

  RETURN v_stats;
END;
$$;

-- ── 4. Stamp stats on card when awarding ──
CREATE OR REPLACE FUNCTION stamp_card_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSONB;
  v_overall INTEGER;
  v_card_num TEXT;
  v_count INTEGER;
  v_category TEXT;
BEGIN
  -- Calculate fresh stats
  v_stats := calculate_athlete_stats(NEW.user_id);
  v_overall := (v_stats->>'overall')::integer;

  -- Generate card number: count of user's cards + 1
  SELECT COUNT(*) + 1 INTO v_count
  FROM achievement_cards
  WHERE user_id = NEW.user_id AND id != NEW.id;
  
  v_card_num := '#' || LPAD(v_count::text, 4, '0');

  -- Determine category label
  v_category := CASE
    WHEN NEW.card_type = 'programme_trophy' THEN UPPER(COALESCE(NEW.programme_type, 'PROGRAMME'))
    WHEN NEW.activity_category IN ('run', 'cycle', 'row', 'swim') THEN 'CARDIO'
    ELSE 'STRENGTH'
  END;

  -- Stamp onto card
  NEW.overall_rating := v_overall;
  NEW.athlete_stats := jsonb_build_object(
    'str', (v_stats->>'str')::integer,
    'pwr', (v_stats->>'pwr')::integer,
    'spd', (v_stats->>'spd')::integer,
    'end', (v_stats->>'end')::integer,
    'agi', (v_stats->>'agi')::integer,
    'rec', (v_stats->>'rec')::integer
  );
  NEW.card_number := v_card_num;
  NEW.category_label := v_category;

  RETURN NEW;
END;
$$;

-- Trigger: auto-stamp stats on insert
DROP TRIGGER IF EXISTS trg_stamp_card_stats ON achievement_cards;
CREATE TRIGGER trg_stamp_card_stats
  BEFORE INSERT ON achievement_cards
  FOR EACH ROW
  EXECUTE FUNCTION stamp_card_stats();

-- ── 5. RPC to get athlete stats on demand (for profile card) ──
CREATE OR REPLACE FUNCTION get_athlete_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN calculate_athlete_stats(p_user_id);
END;
$$;
