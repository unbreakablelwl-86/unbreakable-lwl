-- ═══════════════════════════════════════════════════════════════════
-- PB CARDS REBUILD: Wilks/IPF GL + Strength Standards + Per-Type Stats
-- 28 May 2026
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Add bodyweight to profiles ──
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bodyweight_kg NUMERIC(5,1);

-- Backfill from coaching_check_ins or coaching_profiles
UPDATE profiles p SET bodyweight_kg = COALESCE(
  (SELECT ci.weight_kg FROM coaching_check_ins ci WHERE ci.athlete_id = p.user_id AND ci.weight_kg > 0 ORDER BY ci.created_at DESC LIMIT 1),
  (SELECT cp.weight_kg FROM coaching_profiles cp WHERE cp.user_id = p.user_id AND cp.weight_kg > 0 LIMIT 1)
) WHERE p.bodyweight_kg IS NULL;

-- ── 2. IPF GL Coefficients function ──
CREATE OR REPLACE FUNCTION ipf_gl_score(
  p_total_kg NUMERIC,
  p_bodyweight_kg NUMERIC,
  p_sex TEXT DEFAULT 'male'
)
RETURNS NUMERIC
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  v_a NUMERIC; v_b NUMERIC; v_c NUMERIC;
  v_denominator NUMERIC;
BEGIN
  IF p_bodyweight_kg IS NULL OR p_bodyweight_kg <= 0 OR p_total_kg <= 0 THEN
    RETURN 0;
  END IF;

  -- IPF GL coefficients (2020 revision)
  IF p_sex = 'female' THEN
    v_a := 610.32796; v_b := 1045.59282; v_c := 0.03048;
  ELSE
    v_a := 1199.72839; v_b := 1025.18162; v_c := 0.00921;
  END IF;

  v_denominator := v_a - v_b * exp(-v_c * p_bodyweight_kg);
  IF v_denominator <= 0 THEN RETURN 0; END IF;

  RETURN ROUND((p_total_kg * 100 / v_denominator)::numeric, 2);
END;
$$;

-- ── 3. IPF Age Coefficient function ──
CREATE OR REPLACE FUNCTION ipf_age_coefficient(p_age INTEGER)
RETURNS NUMERIC
LANGUAGE plpgsql IMMUTABLE
AS $$
BEGIN
  -- IPF age coefficients (approximate lookup)
  IF p_age IS NULL OR p_age < 14 THEN RETURN 1.0; END IF;
  RETURN CASE
    WHEN p_age BETWEEN 14 AND 18 THEN -- Sub-Junior
      CASE p_age
        WHEN 14 THEN 1.23 WHEN 15 THEN 1.18 WHEN 16 THEN 1.13
        WHEN 17 THEN 1.08 WHEN 18 THEN 1.04
      END
    WHEN p_age BETWEEN 19 AND 23 THEN -- Junior
      CASE p_age
        WHEN 19 THEN 1.02 WHEN 20 THEN 1.01
        ELSE 1.0 -- 21-23 = Open
      END
    WHEN p_age BETWEEN 24 AND 39 THEN 1.0 -- Open
    WHEN p_age BETWEEN 40 AND 49 THEN -- Masters 1
      1.0 + (p_age - 39) * 0.005
    WHEN p_age BETWEEN 50 AND 59 THEN -- Masters 2
      1.05 + (p_age - 49) * 0.008
    WHEN p_age BETWEEN 60 AND 69 THEN -- Masters 3
      1.13 + (p_age - 59) * 0.012
    WHEN p_age >= 70 THEN -- Masters 4
      1.25 + (p_age - 69) * 0.015
    ELSE 1.0
  END;
END;
$$;

-- ── 4. Relative strength rating (40-99 scale) ──
CREATE OR REPLACE FUNCTION relative_strength_rating(
  p_weight_lifted NUMERIC,
  p_bodyweight NUMERIC,
  p_sex TEXT,
  p_exercise TEXT,
  p_age INTEGER DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  v_ratio NUMERIC;
  v_standards NUMERIC[];
  v_base_rating INTEGER;
  v_age_coeff NUMERIC := 1.0;
  v_ex TEXT;
BEGIN
  IF p_bodyweight IS NULL OR p_bodyweight <= 0 THEN
    -- Fallback: use absolute weight tiers
    RETURN LEAST(99, GREATEST(40, (40 + LEAST(59, (p_weight_lifted / 4)::integer))));
  END IF;

  v_ratio := p_weight_lifted / p_bodyweight;
  v_ex := lower(p_exercise);

  -- Strength standards: {beginner, novice, intermediate, advanced, elite} as BW multipliers
  IF p_sex = 'female' THEN
    v_standards := CASE
      WHEN v_ex LIKE '%squat%' THEN ARRAY[0.5, 0.75, 1.0, 1.5, 2.0]
      WHEN v_ex LIKE '%bench%' OR v_ex LIKE '%chest press%' THEN ARRAY[0.35, 0.5, 0.65, 1.0, 1.35]
      WHEN v_ex LIKE '%deadlift%' OR v_ex LIKE '%rdl%' THEN ARRAY[0.75, 1.0, 1.5, 2.0, 2.5]
      WHEN v_ex LIKE '%ohp%' OR v_ex LIKE '%overhead%' OR v_ex LIKE '%shoulder press%' OR v_ex LIKE '%military%' THEN ARRAY[0.2, 0.35, 0.5, 0.75, 1.0]
      WHEN v_ex LIKE '%row%' THEN ARRAY[0.35, 0.5, 0.65, 0.9, 1.2]
      ELSE ARRAY[0.3, 0.5, 0.7, 1.0, 1.4] -- generic female
    END;
  ELSE
    v_standards := CASE
      WHEN v_ex LIKE '%squat%' THEN ARRAY[0.75, 1.25, 1.5, 2.0, 2.5]
      WHEN v_ex LIKE '%bench%' OR v_ex LIKE '%chest press%' THEN ARRAY[0.5, 0.75, 1.0, 1.5, 2.0]
      WHEN v_ex LIKE '%deadlift%' OR v_ex LIKE '%rdl%' THEN ARRAY[1.0, 1.5, 2.0, 2.5, 3.0]
      WHEN v_ex LIKE '%ohp%' OR v_ex LIKE '%overhead%' OR v_ex LIKE '%shoulder press%' OR v_ex LIKE '%military%' THEN ARRAY[0.35, 0.55, 0.75, 1.0, 1.35]
      WHEN v_ex LIKE '%row%' THEN ARRAY[0.5, 0.65, 0.85, 1.15, 1.5]
      ELSE ARRAY[0.4, 0.65, 0.9, 1.3, 1.8] -- generic male
    END;
  END IF;

  -- Map ratio to 40-99 scale using standards
  -- Beginner (0) = 40, Novice (1) = 52, Intermediate (2) = 64, Advanced (3) = 78, Elite (4) = 92+
  IF v_ratio >= v_standards[5] THEN
    v_base_rating := 92 + LEAST(7, ((v_ratio - v_standards[5]) / v_standards[5] * 20)::integer);
  ELSIF v_ratio >= v_standards[4] THEN
    v_base_rating := 78 + ((v_ratio - v_standards[4]) / (v_standards[5] - v_standards[4]) * 14)::integer;
  ELSIF v_ratio >= v_standards[3] THEN
    v_base_rating := 64 + ((v_ratio - v_standards[3]) / (v_standards[4] - v_standards[3]) * 14)::integer;
  ELSIF v_ratio >= v_standards[2] THEN
    v_base_rating := 52 + ((v_ratio - v_standards[2]) / (v_standards[3] - v_standards[2]) * 12)::integer;
  ELSIF v_ratio >= v_standards[1] THEN
    v_base_rating := 40 + ((v_ratio - v_standards[1]) / (v_standards[2] - v_standards[1]) * 12)::integer;
  ELSE
    v_base_rating := 40;
  END IF;

  -- Apply age coefficient (bonus for younger/older)
  IF p_age IS NOT NULL THEN
    v_age_coeff := ipf_age_coefficient(p_age);
    v_base_rating := (v_base_rating * v_age_coeff)::integer;
  END IF;

  RETURN LEAST(99, GREATEST(40, v_base_rating));
END;
$$;

-- ── 5. Updated calculate_pb_card_stats with per-type stats ──
CREATE OR REPLACE FUNCTION calculate_pb_card_stats(
  p_user_id UUID,
  p_activity_category TEXT DEFAULT 'lift',
  p_exercise_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSONB;
  v_bodyweight NUMERIC;
  v_sex TEXT;
  v_age INTEGER;
  v_overall INTEGER := 40;
  -- Shared
  v_con INTEGER := 0; -- Consistency
  -- Strength-specific
  v_str INTEGER := 0;
  v_pwr INTEGER := 0;
  v_pgs INTEGER := 0; -- Progression
  v_exp INTEGER := 0; -- Experience
  v_rnk INTEGER := 0; -- Global rank percentile
  -- Cardio-specific
  v_spd INTEGER := 0;
  v_endr INTEGER := 0;
  v_dst INTEGER := 0; -- Distance
  v_elv INTEGER := 0; -- Elevation
  -- Raw values
  v_max_e1rm NUMERIC := 0;
  v_total_volume NUMERIC := 0;
  v_total_sessions INTEGER := 0;
  v_exercise_count INTEGER := 0;
  v_first_session TIMESTAMPTZ;
  v_last_session TIMESTAMPTZ;
  v_weeks_active NUMERIC := 0;
  v_sessions_per_week NUMERIC := 0;
  v_improvement_pct NUMERIC := 0;
  v_total_run_km NUMERIC := 0;
  v_best_pace NUMERIC := 0;
  v_longest_run NUMERIC := 0;
  v_gl_score NUMERIC := 0;
BEGIN
  -- Get user profile data
  SELECT p.bodyweight_kg, COALESCE(p.sex, 'male'),
    CASE WHEN p.date_of_birth IS NOT NULL
      THEN EXTRACT(YEAR FROM age(now(), p.date_of_birth))::integer
      ELSE NULL
    END
  INTO v_bodyweight, v_sex, v_age
  FROM profiles p WHERE p.user_id = p_user_id;

  -- Fallback bodyweight from coaching
  IF v_bodyweight IS NULL THEN
    SELECT ci.weight_kg INTO v_bodyweight
    FROM coaching_check_ins ci WHERE ci.athlete_id = p_user_id AND ci.weight_kg > 0
    ORDER BY ci.created_at DESC LIMIT 1;
  END IF;

  -- ═══ SHARED STATS ═══

  -- Session count + date range
  SELECT COUNT(*), MIN(started_at), MAX(started_at)
  INTO v_total_sessions, v_first_session, v_last_session
  FROM workout_sessions
  WHERE user_id = p_user_id AND status = 'completed';

  -- Weeks active
  IF v_first_session IS NOT NULL AND v_last_session IS NOT NULL THEN
    v_weeks_active := GREATEST(1, EXTRACT(EPOCH FROM (v_last_session - v_first_session)) / 604800);
  END IF;

  -- Sessions per week (consistency)
  IF v_weeks_active > 0 THEN
    v_sessions_per_week := v_total_sessions / v_weeks_active;
  END IF;

  -- CONSISTENCY (CON): sessions per week → 0-99
  v_con := LEAST(99, GREATEST(0, CASE
    WHEN v_sessions_per_week >= 6 THEN 92 + LEAST(7, ((v_sessions_per_week - 6) * 3)::integer)
    WHEN v_sessions_per_week >= 4 THEN 75 + ((v_sessions_per_week - 4) / 2 * 17)::integer
    WHEN v_sessions_per_week >= 3 THEN 60 + ((v_sessions_per_week - 3) * 15)::integer
    WHEN v_sessions_per_week >= 2 THEN 45 + ((v_sessions_per_week - 2) * 15)::integer
    WHEN v_sessions_per_week >= 1 THEN 25 + ((v_sessions_per_week - 1) * 20)::integer
    WHEN v_sessions_per_week > 0 THEN (v_sessions_per_week * 25)::integer
    ELSE 0
  END));

  IF p_activity_category IN ('lift') THEN
    -- ═══ STRENGTH-SPECIFIC STATS ═══

    -- Total volume + max e1RM
    SELECT COALESCE(SUM(weight_kg * COALESCE(actual_reps, 1)), 0),
           COALESCE(MAX(CASE
             WHEN actual_reps = 1 THEN weight_kg
             WHEN actual_reps > 1 AND weight_kg > 0 THEN
               ROUND((weight_kg * (1 + actual_reps::numeric / 30))::numeric, 1)
             ELSE weight_kg
           END), 0)
    INTO v_total_volume, v_max_e1rm
    FROM exercise_logs
    WHERE user_id = p_user_id AND completed = true AND weight_kg > 0;

    -- STR: Relative strength via standards (if bodyweight available) or absolute
    IF v_bodyweight IS NOT NULL AND v_bodyweight > 0 AND p_exercise_name IS NOT NULL THEN
      v_str := relative_strength_rating(v_max_e1rm, v_bodyweight, v_sex, p_exercise_name, v_age);
    ELSE
      v_str := LEAST(99, GREATEST(0, CASE
        WHEN v_total_volume >= 500000 THEN 90 WHEN v_total_volume >= 200000 THEN 75
        WHEN v_total_volume >= 50000 THEN 60 WHEN v_total_volume >= 10000 THEN 45
        WHEN v_total_volume > 0 THEN 30 ELSE 0
      END));
    END IF;

    -- PWR: IPF GL score normalized to 0-99
    IF v_bodyweight IS NOT NULL AND v_bodyweight > 0 THEN
      v_gl_score := ipf_gl_score(v_max_e1rm, v_bodyweight, v_sex);
      v_pwr := LEAST(99, GREATEST(0, CASE
        WHEN v_gl_score >= 120 THEN 95  -- international elite
        WHEN v_gl_score >= 100 THEN 82 + ((v_gl_score - 100) / 20 * 13)::integer
        WHEN v_gl_score >= 80 THEN 65 + ((v_gl_score - 80) / 20 * 17)::integer
        WHEN v_gl_score >= 60 THEN 48 + ((v_gl_score - 60) / 20 * 17)::integer
        WHEN v_gl_score >= 40 THEN 30 + ((v_gl_score - 40) / 20 * 18)::integer
        WHEN v_gl_score > 0 THEN (v_gl_score / 40 * 30)::integer
        ELSE 0
      END));
    ELSE
      v_pwr := LEAST(99, GREATEST(0, CASE
        WHEN v_max_e1rm >= 250 THEN 90 WHEN v_max_e1rm >= 180 THEN 75
        WHEN v_max_e1rm >= 120 THEN 60 WHEN v_max_e1rm >= 60 THEN 40
        WHEN v_max_e1rm > 0 THEN 25 ELSE 0
      END));
    END IF;

    -- PGS (Progression): improvement in max weight over last 90 days
    SELECT CASE
      WHEN COUNT(*) >= 2 THEN
        ROUND(((MAX(CASE WHEN el.created_at >= now() - interval '30 days' THEN el.weight_kg END) -
                MAX(CASE WHEN el.created_at < now() - interval '60 days' THEN el.weight_kg END)) /
                NULLIF(MAX(CASE WHEN el.created_at < now() - interval '60 days' THEN el.weight_kg END), 0) * 100)::numeric, 1)
      ELSE 0
    END INTO v_improvement_pct
    FROM exercise_logs el
    WHERE el.user_id = p_user_id AND el.completed = true AND el.weight_kg > 0;

    v_pgs := LEAST(99, GREATEST(0, CASE
      WHEN v_improvement_pct >= 20 THEN 90
      WHEN v_improvement_pct >= 10 THEN 70 + ((v_improvement_pct - 10) / 10 * 20)::integer
      WHEN v_improvement_pct >= 5 THEN 55 + ((v_improvement_pct - 5) / 5 * 15)::integer
      WHEN v_improvement_pct > 0 THEN 35 + (v_improvement_pct / 5 * 20)::integer
      WHEN v_improvement_pct = 0 AND v_total_sessions > 10 THEN 30
      ELSE 15
    END));

    -- EXP (Experience): total sessions + training age
    v_exp := LEAST(99, GREATEST(0, CASE
      WHEN v_total_sessions >= 500 THEN 92 + LEAST(7, ((v_total_sessions - 500) / 100))
      WHEN v_total_sessions >= 200 THEN 75 + ((v_total_sessions - 200)::numeric / 300 * 17)::integer
      WHEN v_total_sessions >= 100 THEN 60 + ((v_total_sessions - 100)::numeric / 100 * 15)::integer
      WHEN v_total_sessions >= 50 THEN 42 + ((v_total_sessions - 50)::numeric / 50 * 18)::integer
      WHEN v_total_sessions >= 10 THEN 20 + ((v_total_sessions - 10)::numeric / 40 * 22)::integer
      WHEN v_total_sessions > 0 THEN (v_total_sessions * 2)
      ELSE 0
    END));

    -- RNK (Global rank): live percentile in age/sex bracket
    BEGIN
      SELECT COALESCE(lb.percentile, 0)::integer INTO v_rnk
      FROM pb_leaderboard lb
      WHERE lb.user_id = p_user_id
        AND lb.exercise_name = p_exercise_name
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      v_rnk := 0;
    END;

    -- Overall: Wilks/IPF-weighted
    IF v_bodyweight IS NOT NULL AND v_bodyweight > 0 AND p_exercise_name IS NOT NULL THEN
      v_overall := relative_strength_rating(v_max_e1rm, v_bodyweight, v_sex, p_exercise_name, v_age);
    ELSE
      v_overall := LEAST(99, GREATEST(40, ((v_str * 30 + v_pwr * 25 + v_con * 15 + v_pgs * 10 + v_exp * 10 + v_rnk * 10) / 100)));
    END IF;

    v_stats := jsonb_build_object(
      'str', v_str, 'pwr', v_pwr, 'con', v_con, 'pgs', v_pgs, 'exp', v_exp, 'rnk', v_rnk,
      'overall', v_overall,
      'total_volume_kg', v_total_volume, 'max_e1rm', v_max_e1rm,
      'gl_score', v_gl_score, 'bodyweight', v_bodyweight
    );

  ELSE
    -- ═══ CARDIO-SPECIFIC STATS ═══

    -- Run data
    SELECT COALESCE(SUM(distance_km), 0),
           COALESCE(MIN(NULLIF(pace_per_km_seconds, 0)), 0),
           COALESCE(MAX(distance_km), 0)
    INTO v_total_run_km, v_best_pace, v_longest_run
    FROM runs WHERE user_id = p_user_id;

    -- SPD: pace-based (lower pace = faster)
    v_spd := LEAST(99, GREATEST(0, CASE
      WHEN v_best_pace > 0 AND v_best_pace <= 180 THEN 95  -- sub-3:00/km
      WHEN v_best_pace > 0 AND v_best_pace <= 240 THEN 80 + ((240 - v_best_pace)::numeric / 60 * 15)::integer
      WHEN v_best_pace > 0 AND v_best_pace <= 330 THEN 60 + ((330 - v_best_pace)::numeric / 90 * 20)::integer
      WHEN v_best_pace > 0 AND v_best_pace <= 420 THEN 40 + ((420 - v_best_pace)::numeric / 90 * 20)::integer
      WHEN v_best_pace > 0 AND v_best_pace <= 600 THEN 20 + ((600 - v_best_pace)::numeric / 180 * 20)::integer
      WHEN v_best_pace > 0 THEN 15
      WHEN v_total_run_km > 0 THEN 25
      ELSE 0
    END));

    -- END: endurance (total distance + longest run)
    v_endr := LEAST(99, GREATEST(0, CASE
      WHEN v_total_run_km >= 1000 THEN 90 + LEAST(9, ((v_total_run_km - 1000) / 500)::integer)
      WHEN v_total_run_km >= 500 THEN 75 + ((v_total_run_km - 500) / 500 * 15)::integer
      WHEN v_total_run_km >= 200 THEN 55 + ((v_total_run_km - 200) / 300 * 20)::integer
      WHEN v_total_run_km >= 50 THEN 30 + ((v_total_run_km - 50) / 150 * 25)::integer
      WHEN v_total_run_km > 0 THEN (v_total_run_km / 50 * 30)::integer
      ELSE 0
    END));

    -- DST: total distance stat (0-99)
    v_dst := LEAST(99, GREATEST(0, CASE
      WHEN v_total_run_km >= 2000 THEN 95
      WHEN v_total_run_km >= 1000 THEN 80 + ((v_total_run_km - 1000) / 1000 * 15)::integer
      WHEN v_total_run_km >= 500 THEN 65 + ((v_total_run_km - 500) / 500 * 15)::integer
      WHEN v_total_run_km >= 100 THEN 40 + ((v_total_run_km - 100) / 400 * 25)::integer
      WHEN v_total_run_km > 0 THEN (v_total_run_km / 100 * 40)::integer
      ELSE 0
    END));

    -- ELV: elevation (placeholder — no elevation data yet, use longest run as proxy)
    v_elv := LEAST(99, GREATEST(0, CASE
      WHEN v_longest_run >= 42 THEN 90
      WHEN v_longest_run >= 21 THEN 70 + ((v_longest_run - 21) / 21 * 20)::integer
      WHEN v_longest_run >= 10 THEN 50 + ((v_longest_run - 10) / 11 * 20)::integer
      WHEN v_longest_run >= 5 THEN 30 + ((v_longest_run - 5) / 5 * 20)::integer
      WHEN v_longest_run > 0 THEN (v_longest_run / 5 * 30)::integer
      ELSE 0
    END));

    -- RNK: global percentile
    BEGIN
      SELECT COALESCE(lb.percentile, 0)::integer INTO v_rnk
      FROM run_pb_leaderboard lb
      WHERE lb.user_id = p_user_id
      ORDER BY lb.percentile DESC
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      v_rnk := 0;
    END;

    -- Overall for cardio
    v_overall := LEAST(99, GREATEST(40, ((v_spd * 30 + v_endr * 25 + v_con * 15 + v_dst * 10 + v_elv * 10 + v_rnk * 10) / 100)));

    v_stats := jsonb_build_object(
      'spd', v_spd, 'end', v_endr, 'con', v_con, 'dst', v_dst, 'elv', v_elv, 'rnk', v_rnk,
      'overall', v_overall,
      'total_run_km', v_total_run_km, 'best_pace', v_best_pace,
      'longest_run_km', v_longest_run, 'bodyweight', v_bodyweight
    );

  END IF;

  RETURN v_stats;
END;
$$;

-- ── 6. Updated stamp trigger — uses per-type stats ──
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
  v_activity TEXT;
BEGIN
  -- Determine activity type
  v_activity := COALESCE(NEW.activity_category, 'lift');

  -- Calculate per-type stats
  v_stats := calculate_pb_card_stats(NEW.user_id, v_activity, NEW.exercise_name);
  v_overall := GREATEST(40, COALESCE((v_stats->>'overall')::integer, 40));

  -- Generate card number
  SELECT COUNT(*) + 1 INTO v_count
  FROM achievement_cards
  WHERE user_id = NEW.user_id AND id != NEW.id;

  v_card_num := '#' || LPAD(v_count::text, 4, '0');

  -- Category label
  v_category := CASE
    WHEN NEW.card_type = 'programme_trophy' THEN UPPER(COALESCE(NEW.programme_type, 'PROGRAMME'))
    WHEN v_activity IN ('run', 'cycle', 'row', 'swim') THEN 'CARDIO'
    ELSE 'STRENGTH'
  END;

  -- Stamp
  NEW.overall_rating := v_overall;
  NEW.athlete_stats := CASE
    WHEN v_activity IN ('run', 'cycle', 'row', 'swim') THEN
      jsonb_build_object(
        'spd', COALESCE((v_stats->>'spd')::integer, 0),
        'end', COALESCE((v_stats->>'end')::integer, 0),
        'con', COALESCE((v_stats->>'con')::integer, 0),
        'dst', COALESCE((v_stats->>'dst')::integer, 0),
        'elv', COALESCE((v_stats->>'elv')::integer, 0),
        'rnk', COALESCE((v_stats->>'rnk')::integer, 0)
      )
    ELSE
      jsonb_build_object(
        'str', COALESCE((v_stats->>'str')::integer, 0),
        'pwr', COALESCE((v_stats->>'pwr')::integer, 0),
        'con', COALESCE((v_stats->>'con')::integer, 0),
        'pgs', COALESCE((v_stats->>'pgs')::integer, 0),
        'exp', COALESCE((v_stats->>'exp')::integer, 0),
        'rnk', COALESCE((v_stats->>'rnk')::integer, 0)
      )
    END;
  NEW.card_number := v_card_num;
  NEW.category_label := v_category;

  RETURN NEW;
END;
$$;

-- Re-create trigger
DROP TRIGGER IF EXISTS trg_stamp_card_stats ON achievement_cards;
CREATE TRIGGER trg_stamp_card_stats
  BEFORE INSERT ON achievement_cards
  FOR EACH ROW
  EXECUTE FUNCTION stamp_card_stats();

-- ── 7. Updated get_athlete_stats wrapper ──
CREATE OR REPLACE FUNCTION get_athlete_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return strength stats by default (backward compat)
  RETURN calculate_pb_card_stats(p_user_id, 'lift', NULL);
END;
$$;