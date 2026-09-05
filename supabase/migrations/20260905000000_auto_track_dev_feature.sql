-- Dev-only "auto track" feature for Power (strength) and Movement (cardio)
-- programmes: when enabled on an active programme, a scheduled job auto-
-- completes today's session with realistic logged data if the user hasn't
-- logged it themselves, so the programme progresses on its own for
-- demo/content purposes. Restricted to accounts with the 'dev' role
-- (enforced both by the edge function and by RLS-adjacent app logic).
--
-- Every row this feature creates is tagged is_auto_tracked / is_auto so it
-- can never be silently confused with a real, manually-logged effort:
--   - auto-completed sessions/logs/planner rows carry is_auto_tracked = true
--   - PB/achievement cards created from them carry is_auto = true and are
--     excluded from the global percentile pool (award_pb_card) and from the
--     public pb_leaderboard view, so they never inflate rankings against
--     real users or misrepresent a real personal best.

ALTER TABLE public.training_programs
  ADD COLUMN IF NOT EXISTS auto_track_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.cardio_programs
  ADD COLUMN IF NOT EXISTS auto_track_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.workout_sessions
  ADD COLUMN IF NOT EXISTS is_auto_tracked BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.exercise_logs
  ADD COLUMN IF NOT EXISTS is_auto_tracked BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.cardio_session_planners
  ADD COLUMN IF NOT EXISTS is_auto_tracked BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.achievement_cards
  ADD COLUMN IF NOT EXISTS is_auto BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.training_programs.auto_track_enabled IS 'Dev-only: when true, auto-track-progression edge function may auto-complete missed sessions for this programme.';
COMMENT ON COLUMN public.cardio_programs.auto_track_enabled IS 'Dev-only: when true, auto-track-progression edge function may auto-complete missed sessions for this programme.';
COMMENT ON COLUMN public.workout_sessions.is_auto_tracked IS 'True if this session was auto-completed by the dev-only auto-track feature rather than logged live by the user.';
COMMENT ON COLUMN public.exercise_logs.is_auto_tracked IS 'True if this set was auto-completed by the dev-only auto-track feature rather than logged live by the user.';
COMMENT ON COLUMN public.cardio_session_planners.is_auto_tracked IS 'True if this session was auto-completed by the dev-only auto-track feature rather than logged live by the user.';
COMMENT ON COLUMN public.achievement_cards.is_auto IS 'True if this PB/achievement card came from an auto-tracked session. Excluded from the global percentile pool and public leaderboards.';

-- Re-point the public PB leaderboard to exclude auto-tracked sets entirely,
-- so an auto-tracked lift can never appear as a real ranked PB against
-- other users.
CREATE OR REPLACE VIEW public.pb_leaderboard AS
WITH user_max_lifts AS (
  SELECT
    el.user_id,
    el.exercise_name,
    max(el.weight_kg) AS estimated_1rm,
    max(el.created_at) AS achieved_at
  FROM exercise_logs el
  WHERE el.weight_kg > 0::numeric
    AND COALESCE(el.is_auto_tracked, false) = false
  GROUP BY el.user_id, el.exercise_name
), ranked AS (
  SELECT
    uml.user_id,
    uml.exercise_name,
    uml.estimated_1rm,
    uml.achieved_at,
    p.display_name,
    p.avatar_url,
    p.date_of_birth,
    p.sex,
    CASE
      WHEN p.date_of_birth IS NULL THEN 'unknown'::text
      WHEN EXTRACT(year FROM age(now(), p.date_of_birth::timestamp with time zone)) BETWEEN 18 AND 24 THEN '18-24'::text
      WHEN EXTRACT(year FROM age(now(), p.date_of_birth::timestamp with time zone)) BETWEEN 25 AND 34 THEN '25-34'::text
      WHEN EXTRACT(year FROM age(now(), p.date_of_birth::timestamp with time zone)) BETWEEN 35 AND 44 THEN '35-44'::text
      WHEN EXTRACT(year FROM age(now(), p.date_of_birth::timestamp with time zone)) BETWEEN 45 AND 54 THEN '45-54'::text
      ELSE '55+'::text
    END AS age_category,
    count(*) OVER (PARTITION BY uml.exercise_name) AS total_in_category,
    rank() OVER (PARTITION BY uml.exercise_name ORDER BY uml.estimated_1rm DESC) AS rank_in_category,
    percent_rank() OVER (PARTITION BY uml.exercise_name ORDER BY uml.estimated_1rm) * 100::double precision AS percentile
  FROM user_max_lifts uml
  JOIN profiles p ON p.user_id = uml.user_id
)
SELECT user_id, exercise_name, estimated_1rm, achieved_at, display_name, avatar_url,
       date_of_birth, sex, age_category, total_in_category, rank_in_category, percentile
FROM ranked;

-- Extend award_pb_card with an is_auto flag. Auto-tracked cards are still
-- recorded (so the dev account's own history/timeline stays accurate about
-- what was auto vs real) but are excluded from the percentile pool used to
-- compute rarity/rank for everyone (including the auto-tracking account
-- itself), so they never inflate global rankings.
CREATE OR REPLACE FUNCTION public.award_pb_card(
  p_user_id uuid,
  p_activity_category text DEFAULT 'lift'::text,
  p_exercise_name text DEFAULT ''::text,
  p_value numeric DEFAULT 0,
  p_unit text DEFAULT 'kg'::text,
  p_rank integer DEFAULT 1,
  p_distance_type text DEFAULT NULL::text,
  p_source_run_id uuid DEFAULT NULL::uuid,
  p_source_session_id uuid DEFAULT NULL::uuid,
  p_is_auto boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_rarity TEXT := 'bronze';
  v_card_id UUID;
  v_existing UUID;
  v_old_value NUMERIC;
  v_percentile NUMERIC;
  v_total_users INTEGER;
  v_user_rank INTEGER;
BEGIN
  IF p_exercise_name IS NULL OR p_exercise_name = '' THEN
    RAISE EXCEPTION 'exercise_name is required';
  END IF;

  -- Auto-tracked and manually-logged PBs are tracked as fully separate
  -- rows per exercise (never the same row), so an auto-tracked session can
  -- never overwrite, upgrade, or downgrade a real manually-earned PB, and
  -- vice versa.
  SELECT id, pb_value INTO v_existing, v_old_value
  FROM achievement_cards
  WHERE user_id = p_user_id
    AND card_type = 'pb_personal'
    AND exercise_name = p_exercise_name
    AND COALESCE(is_auto, false) = p_is_auto
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    IF p_unit = 'seconds' OR p_unit = 'pace_per_km' THEN
      IF p_value >= v_old_value THEN
        RETURN v_existing;
      END IF;
    ELSE
      IF p_value <= v_old_value THEN
        RETURN v_existing;
      END IF;
    END IF;
  END IF;

  -- Percentile pool excludes auto-tracked cards from anyone's count, so an
  -- auto-tracked entry (this call or a past one) never shifts real users'
  -- rarity/rank, and vice versa.
  SELECT COUNT(DISTINCT user_id) INTO v_total_users
  FROM achievement_cards
  WHERE card_type = 'pb_personal'
    AND exercise_name = p_exercise_name
    AND COALESCE(is_auto, false) = false;

  IF NOT p_is_auto AND v_total_users >= 5 THEN
    IF p_unit = 'seconds' OR p_unit = 'pace_per_km' THEN
      SELECT COUNT(DISTINCT user_id) + 1 INTO v_user_rank
      FROM achievement_cards
      WHERE card_type = 'pb_personal'
        AND exercise_name = p_exercise_name
        AND pb_value < p_value
        AND user_id != p_user_id
        AND COALESCE(is_auto, false) = false;
    ELSE
      SELECT COUNT(DISTINCT user_id) + 1 INTO v_user_rank
      FROM achievement_cards
      WHERE card_type = 'pb_personal'
        AND exercise_name = p_exercise_name
        AND pb_value > p_value
        AND user_id != p_user_id
        AND COALESCE(is_auto, false) = false;
    END IF;

    v_percentile := (v_user_rank::NUMERIC / (v_total_users + 1)::NUMERIC) * 100;

    v_rarity := CASE
      WHEN v_percentile <= 1 THEN 'platinum'
      WHEN v_percentile <= 5 THEN 'diamond'
      WHEN v_percentile <= 20 THEN 'gold'
      WHEN v_percentile <= 40 THEN 'silver'
      ELSE 'bronze'
    END;
  ELSE
    -- Auto-tracked cards (or too small a real pool) always land at bronze,
    -- the lowest/most conservative tier, rather than competing for rank.
    v_rarity := 'bronze';
  END IF;

  IF v_existing IS NOT NULL THEN
    UPDATE achievement_cards SET
      pb_value = p_value,
      pb_unit = p_unit,
      record_value = p_value,
      record_unit = p_unit,
      rarity = v_rarity,
      activity_category = p_activity_category,
      source_run_id = COALESCE(p_source_run_id, source_run_id),
      source_session_id = COALESCE(p_source_session_id, source_session_id),
      title = p_exercise_name || ' PB',
      subtitle = p_value || ' ' || p_unit,
      is_auto = p_is_auto,
      earned_at = now(),
      updated_at = now()
    WHERE id = v_existing;
    RETURN v_existing;
  END IF;

  INSERT INTO achievement_cards (
    user_id, card_type, rarity, activity_category, exercise_name,
    pb_value, pb_unit, pb_rank, record_value, record_unit,
    distance_type, title, subtitle,
    source_run_id, source_session_id, is_auto, earned_at, updated_at
  ) VALUES (
    p_user_id, 'pb_personal', v_rarity, p_activity_category,
    p_exercise_name, p_value, p_unit, 1, p_value, p_unit,
    p_distance_type,
    p_exercise_name || ' PB',
    p_value || ' ' || p_unit,
    p_source_run_id, p_source_session_id, p_is_auto, now(), now()
  )
  RETURNING id INTO v_card_id;

  RETURN v_card_id;
END;
$function$;
