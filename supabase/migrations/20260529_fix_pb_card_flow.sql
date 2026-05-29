-- Fix: Every exercise log = at least a bronze card
-- Rarity determined by actual performance data / global percentile
-- NOT by PB rank position

CREATE OR REPLACE FUNCTION award_pb_card(
  p_user_id UUID,
  p_activity_category TEXT,
  p_exercise_name TEXT,
  p_value NUMERIC,
  p_unit TEXT,
  p_rank INTEGER DEFAULT 1,
  p_distance_type TEXT DEFAULT NULL,
  p_source_run_id UUID DEFAULT NULL,
  p_source_session_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rarity TEXT := 'bronze';
  v_card_id UUID;
  v_existing UUID;
  v_old_value NUMERIC;
  v_percentile NUMERIC;
  v_total_users INTEGER;
  v_user_rank INTEGER;
BEGIN
  -- Check if card already exists for this exercise (one card per exercise per user)
  SELECT id, pb_value INTO v_existing, v_old_value
  FROM achievement_cards
  WHERE user_id = p_user_id
    AND card_type = 'pb_personal'
    AND exercise_name = p_exercise_name
    AND activity_category = p_activity_category
  LIMIT 1;

  -- For lifts: higher value = better. For cardio (seconds): lower = better.
  -- Only update if new value is actually better
  IF v_existing IS NOT NULL THEN
    IF p_unit = 'seconds' THEN
      -- Cardio: lower is better
      IF p_value >= v_old_value THEN
        RETURN v_existing; -- Not a PB, skip
      END IF;
    ELSE
      -- Lifts: higher is better
      IF p_value <= v_old_value THEN
        RETURN v_existing; -- Not a PB, skip
      END IF;
    END IF;
  END IF;

  -- Calculate global percentile for this exercise
  -- Count total users who have a PB for this exercise
  SELECT COUNT(DISTINCT user_id) INTO v_total_users
  FROM achievement_cards
  WHERE card_type = 'pb_personal'
    AND exercise_name = p_exercise_name
    AND activity_category = p_activity_category;

  IF v_total_users >= 5 THEN
    -- Enough data to rank
    IF p_unit = 'seconds' THEN
      -- Cardio: lower = better rank
      SELECT COUNT(DISTINCT user_id) + 1 INTO v_user_rank
      FROM achievement_cards
      WHERE card_type = 'pb_personal'
        AND exercise_name = p_exercise_name
        AND activity_category = p_activity_category
        AND pb_value < p_value
        AND user_id != p_user_id;
    ELSE
      -- Lifts: higher = better rank
      SELECT COUNT(DISTINCT user_id) + 1 INTO v_user_rank
      FROM achievement_cards
      WHERE card_type = 'pb_personal'
        AND exercise_name = p_exercise_name
        AND activity_category = p_activity_category
        AND pb_value > p_value
        AND user_id != p_user_id;
    END IF;

    v_percentile := (v_user_rank::NUMERIC / (v_total_users + 1)::NUMERIC) * 100;

    -- Rarity based on global percentile
    v_rarity := CASE
      WHEN v_percentile <= 1 THEN 'platinum'   -- Top 1%
      WHEN v_percentile <= 5 THEN 'diamond'    -- Top 5%
      WHEN v_percentile <= 20 THEN 'gold'      -- Top 20%
      WHEN v_percentile <= 40 THEN 'silver'    -- Top 40%
      ELSE 'bronze'
    END;
  ELSE
    -- Not enough global data yet — default bronze, gold if it's a very strong lift
    v_rarity := 'bronze';
  END IF;

  IF v_existing IS NOT NULL THEN
    -- Update existing card with new PB value + recalculated rarity
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

  -- Insert new card (first time this exercise is logged)
  INSERT INTO achievement_cards (
    user_id, card_type, rarity, activity_category, exercise_name,
    pb_value, pb_unit, pb_rank, distance_type,
    source_run_id, source_session_id, earned_at
  ) VALUES (
    p_user_id, 'pb_personal', v_rarity, p_activity_category,
    p_exercise_name, p_value, p_unit, 1, p_distance_type,
    p_source_run_id, p_source_session_id, now()
  )
  RETURNING id INTO v_card_id;

  RETURN v_card_id;
END;
$$;
