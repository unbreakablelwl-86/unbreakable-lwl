-- Fix cardio stats calculation to also use exercise_logs when runs table is empty
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
  v_con INTEGER := 0;
  v_str INTEGER := 0;
  v_pwr INTEGER := 0;
  v_pgs INTEGER := 0;
  v_exp INTEGER := 0;
  v_rnk INTEGER := 0;
  v_spd INTEGER := 0;
  v_endr INTEGER := 0;
  v_dst INTEGER := 0;
  v_elv INTEGER := 0;
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
  v_best_time_seconds NUMERIC := 0;
  v_cardio_session_count INTEGER := 0;
BEGIN
  SELECT p.bodyweight_kg, COALESCE(p.sex, 'male'),
    CASE WHEN p.date_of_birth IS NOT NULL
      THEN EXTRACT(YEAR FROM age(now(), p.date_of_birth))::integer
      ELSE NULL
    END
  INTO v_bodyweight, v_sex, v_age
  FROM profiles p WHERE p.user_id = p_user_id;

  IF v_bodyweight IS NULL THEN
    SELECT ci.weight_kg INTO v_bodyweight
    FROM coaching_check_ins ci WHERE ci.athlete_id = p_user_id AND ci.weight_kg > 0
    ORDER BY ci.created_at DESC LIMIT 1;
  END IF;

  -- Session count + date range
  SELECT COUNT(*), MIN(started_at), MAX(started_at)
  INTO v_total_sessions, v_first_session, v_last_session
  FROM workout_sessions
  WHERE user_id = p_user_id AND status = 'completed';

  IF v_first_session IS NOT NULL AND v_last_session IS NOT NULL THEN
    v_weeks_active := GREATEST(1, EXTRACT(EPOCH FROM (v_last_session - v_first_session)) / 604800);
  END IF;

  IF v_weeks_active > 0 THEN
    v_sessions_per_week := v_total_sessions / v_weeks_active;
  END IF;

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
    -- ═══ STRENGTH STATS (unchanged) ═══
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

    IF v_bodyweight IS NOT NULL AND v_bodyweight > 0 AND p_exercise_name IS NOT NULL THEN
      v_str := relative_strength_rating(v_max_e1rm, v_bodyweight, v_sex, p_exercise_name, v_age);
    ELSE
      v_str := LEAST(99, GREATEST(0, CASE
        WHEN v_total_volume >= 500000 THEN 90 WHEN v_total_volume >= 200000 THEN 75
        WHEN v_total_volume >= 50000 THEN 60 WHEN v_total_volume >= 10000 THEN 45
        WHEN v_total_volume > 0 THEN 30 ELSE 0
      END));
    END IF;

    IF v_bodyweight IS NOT NULL AND v_bodyweight > 0 THEN
      v_gl_score := ipf_gl_score(v_max_e1rm, v_bodyweight, v_sex);
      v_pwr := LEAST(99, GREATEST(0, CASE
        WHEN v_gl_score >= 120 THEN 95
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

    v_exp := LEAST(99, GREATEST(0, CASE
      WHEN v_total_sessions >= 500 THEN 92 + LEAST(7, ((v_total_sessions - 500) / 100))
      WHEN v_total_sessions >= 200 THEN 75 + ((v_total_sessions - 200)::numeric / 300 * 17)::integer
      WHEN v_total_sessions >= 100 THEN 60 + ((v_total_sessions - 100)::numeric / 100 * 15)::integer
      WHEN v_total_sessions >= 50 THEN 42 + ((v_total_sessions - 50)::numeric / 50 * 18)::integer
      WHEN v_total_sessions >= 10 THEN 20 + ((v_total_sessions - 10)::numeric / 40 * 22)::integer
      WHEN v_total_sessions > 0 THEN (v_total_sessions * 2)
      ELSE 0
    END));

    BEGIN
      SELECT COALESCE(lb.percentile, 0)::integer INTO v_rnk
      FROM pb_leaderboard lb
      WHERE lb.user_id = p_user_id
        AND lb.exercise_name = p_exercise_name
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      v_rnk := 0;
    END;

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
    -- ═══ CARDIO STATS — reads from BOTH runs table AND exercise_logs ═══

    -- Try runs table first
    SELECT COALESCE(SUM(distance_km), 0),
           COALESCE(MIN(NULLIF(pace_per_km_seconds, 0)), 0),
           COALESCE(MAX(distance_km), 0)
    INTO v_total_run_km, v_best_pace, v_longest_run
    FROM runs WHERE user_id = p_user_id;

    -- Count cardio sessions from exercise_logs as fallback/supplement
    SELECT COUNT(DISTINCT session_id)
    INTO v_cardio_session_count
    FROM exercise_logs
    WHERE user_id = p_user_id AND completed = true
      AND (exercise_name ILIKE '%run%' OR exercise_name ILIKE '%sprint%'
           OR exercise_name ILIKE '%jog%' OR exercise_name ILIKE '%walk%'
           OR exercise_name ILIKE '%cycle%' OR exercise_name ILIKE '%row%'
           OR exercise_name ILIKE '%swim%' OR exercise_name ILIKE '%cardio%'
           OR exercise_name ILIKE '%5k%' OR exercise_name ILIKE '%10k%');

    -- Get best time from exercise_logs for this specific exercise (duration_seconds or pb_value)
    IF p_exercise_name IS NOT NULL THEN
      SELECT COALESCE(MIN(NULLIF(duration_seconds, 0)), 0)
      INTO v_best_time_seconds
      FROM exercise_logs
      WHERE user_id = p_user_id AND completed = true
        AND exercise_name = p_exercise_name
        AND duration_seconds > 0;

      -- Also check if pb_value stored as time for cardio cards
      IF v_best_time_seconds = 0 THEN
        SELECT COALESCE(MIN(NULLIF(el.weight_kg, 0)), 0)
        INTO v_best_time_seconds
        FROM exercise_logs el
        WHERE el.user_id = p_user_id AND el.completed = true
          AND el.exercise_name = p_exercise_name;
      END IF;
    END IF;

    -- If no runs data but we have exercise_logs cardio sessions, estimate
    IF v_total_run_km = 0 AND v_cardio_session_count > 0 THEN
      -- Use session count to estimate reasonable cardio stats
      v_total_run_km := v_cardio_session_count * 3.5; -- ~3.5km avg per cardio session estimate
      v_longest_run := LEAST(v_cardio_session_count * 0.5, 42); -- rough estimate

      -- If we have a time for a 5K, estimate pace
      IF v_best_time_seconds > 0 AND p_exercise_name ILIKE '%5k%' THEN
        v_best_pace := v_best_time_seconds / 5.0; -- pace per km
      ELSIF v_best_time_seconds > 0 AND p_exercise_name ILIKE '%10k%' THEN
        v_best_pace := v_best_time_seconds / 10.0;
      END IF;
    END IF;

    -- Use cardio session count for consistency if higher
    IF v_cardio_session_count > v_total_sessions THEN
      v_total_sessions := v_cardio_session_count;
      -- Recalculate consistency
      IF v_weeks_active > 0 THEN
        v_sessions_per_week := v_total_sessions / v_weeks_active;
      ELSE
        v_sessions_per_week := v_total_sessions;
      END IF;
      v_con := LEAST(99, GREATEST(0, CASE
        WHEN v_sessions_per_week >= 6 THEN 92
        WHEN v_sessions_per_week >= 4 THEN 75
        WHEN v_sessions_per_week >= 3 THEN 60
        WHEN v_sessions_per_week >= 2 THEN 45
        WHEN v_sessions_per_week >= 1 THEN 25
        WHEN v_sessions_per_week > 0 THEN (v_sessions_per_week * 25)::integer
        ELSE 0
      END));
    END IF;

    -- SPD: pace-based
    v_spd := LEAST(99, GREATEST(0, CASE
      WHEN v_best_pace > 0 AND v_best_pace <= 180 THEN 95
      WHEN v_best_pace > 0 AND v_best_pace <= 240 THEN 80 + ((240 - v_best_pace)::numeric / 60 * 15)::integer
      WHEN v_best_pace > 0 AND v_best_pace <= 330 THEN 60 + ((330 - v_best_pace)::numeric / 90 * 20)::integer
      WHEN v_best_pace > 0 AND v_best_pace <= 420 THEN 40 + ((420 - v_best_pace)::numeric / 90 * 20)::integer
      WHEN v_best_pace > 0 AND v_best_pace <= 600 THEN 20 + ((600 - v_best_pace)::numeric / 180 * 20)::integer
      WHEN v_best_pace > 0 THEN 15
      WHEN v_total_run_km > 0 THEN 25
      WHEN v_cardio_session_count > 0 THEN 20
      ELSE 0
    END));

    -- END: endurance
    v_endr := LEAST(99, GREATEST(0, CASE
      WHEN v_total_run_km >= 1000 THEN 90
      WHEN v_total_run_km >= 500 THEN 75 + ((v_total_run_km - 500) / 500 * 15)::integer
      WHEN v_total_run_km >= 200 THEN 55 + ((v_total_run_km - 200) / 300 * 20)::integer
      WHEN v_total_run_km >= 50 THEN 30 + ((v_total_run_km - 50) / 150 * 25)::integer
      WHEN v_total_run_km > 0 THEN GREATEST(10, (v_total_run_km / 50 * 30)::integer)
      WHEN v_cardio_session_count > 0 THEN LEAST(50, v_cardio_session_count * 5)
      ELSE 0
    END));

    -- DST: total distance
    v_dst := LEAST(99, GREATEST(0, CASE
      WHEN v_total_run_km >= 2000 THEN 95
      WHEN v_total_run_km >= 1000 THEN 80
      WHEN v_total_run_km >= 500 THEN 65
      WHEN v_total_run_km >= 100 THEN 40 + ((v_total_run_km - 100) / 400 * 25)::integer
      WHEN v_total_run_km > 0 THEN GREATEST(10, (v_total_run_km / 100 * 40)::integer)
      WHEN v_cardio_session_count > 0 THEN LEAST(40, v_cardio_session_count * 4)
      ELSE 0
    END));

    -- ELV: elevation proxy
    v_elv := LEAST(99, GREATEST(0, CASE
      WHEN v_longest_run >= 42 THEN 90
      WHEN v_longest_run >= 21 THEN 70
      WHEN v_longest_run >= 10 THEN 50
      WHEN v_longest_run >= 5 THEN 30
      WHEN v_longest_run > 0 THEN GREATEST(10, (v_longest_run / 5 * 30)::integer)
      WHEN v_cardio_session_count > 0 THEN LEAST(30, v_cardio_session_count * 3)
      ELSE 0
    END));

    -- RNK
    BEGIN
      SELECT COALESCE(lb.percentile, 0)::integer INTO v_rnk
      FROM run_pb_leaderboard lb
      WHERE lb.user_id = p_user_id
      ORDER BY lb.percentile DESC
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      v_rnk := 0;
    END;

    -- If no rank from leaderboard but user has cardio data, give baseline
    IF v_rnk = 0 AND (v_total_run_km > 0 OR v_cardio_session_count > 0) THEN
      v_rnk := LEAST(50, GREATEST(10, v_cardio_session_count * 5));
    END IF;

    v_overall := LEAST(99, GREATEST(40, ((v_spd * 30 + v_endr * 25 + v_con * 15 + v_dst * 10 + v_elv * 10 + v_rnk * 10) / 100)));

    v_stats := jsonb_build_object(
      'spd', v_spd, 'end', v_endr, 'con', v_con, 'dst', v_dst, 'elv', v_elv, 'rnk', v_rnk,
      'overall', v_overall,
      'total_run_km', v_total_run_km, 'best_pace', v_best_pace,
      'longest_run_km', v_longest_run, 'bodyweight', v_bodyweight,
      'cardio_sessions', v_cardio_session_count
    );

  END IF;

  RETURN v_stats;
END;
$$;

-- Now re-stamp all cardio cards with updated stats
DO $$
DECLARE
  v_card RECORD;
  v_stats JSONB;
BEGIN
  FOR v_card IN
    SELECT id, user_id, activity_category, exercise_name
    FROM achievement_cards
    WHERE activity_category IN ('run', 'cycle', 'row', 'swim')
  LOOP
    v_stats := calculate_pb_card_stats(v_card.user_id, v_card.activity_category, v_card.exercise_name);
    UPDATE achievement_cards SET
      athlete_stats = jsonb_build_object(
        'spd', COALESCE((v_stats->>'spd')::integer, 0),
        'end', COALESCE((v_stats->>'end')::integer, 0),
        'con', COALESCE((v_stats->>'con')::integer, 0),
        'dst', COALESCE((v_stats->>'dst')::integer, 0),
        'elv', COALESCE((v_stats->>'elv')::integer, 0),
        'rnk', COALESCE((v_stats->>'rnk')::integer, 0)
      ),
      overall_rating = GREATEST(40, COALESCE((v_stats->>'overall')::integer, 40))
    WHERE id = v_card.id;
  END LOOP;
END;
$$;
