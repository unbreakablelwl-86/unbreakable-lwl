-- ============================================================
-- Missing RPCs: called by frontend but never created in DB
-- Created by Viktor – 2026-06-18
-- ============================================================

-- 1. deduct_tokens (wrapper around deduct_token with simpler signature)
DROP FUNCTION IF EXISTS public.deduct_tokens CASCADE;
CREATE OR REPLACE FUNCTION public.deduct_tokens(
  _amount NUMERIC DEFAULT 1,
  p_user_id UUID DEFAULT NULL,
  p_amount NUMERIC DEFAULT NULL,
  p_reason TEXT DEFAULT 'Token deduction'
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_uid UUID; v_amt NUMERIC; v_result NUMERIC;
BEGIN
  v_uid := COALESCE(p_user_id, auth.uid());
  v_amt := COALESCE(p_amount, _amount, 1);
  IF v_uid IS NULL THEN RETURN jsonb_build_object('error', 'Not authenticated'); END IF;
  v_result := public.deduct_token(v_uid, v_amt, 'deduct_tokens', p_reason);
  IF v_result = -1 THEN RETURN jsonb_build_object('error', 'Not enough tokens'); END IF;
  RETURN jsonb_build_object('success', true, 'new_balance', v_result);
END; $$;

-- 2. get_token_balance
CREATE OR REPLACE FUNCTION public.get_token_balance() RETURNS NUMERIC
LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE v_balance NUMERIC;
BEGIN
  SELECT balance INTO v_balance FROM public.token_balances WHERE user_id = auth.uid();
  RETURN COALESCE(v_balance, 0);
END; $$;

-- 3. get_my_cards
DROP FUNCTION IF EXISTS public.get_my_cards CASCADE;
CREATE FUNCTION public.get_my_cards(_uid UUID DEFAULT NULL)
RETURNS SETOF un_tunes_user_cards LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN QUERY SELECT * FROM un_tunes_user_cards WHERE user_id = COALESCE(_uid, auth.uid()) ORDER BY created_at DESC;
END; $$;

-- 4. get_my_owned_track_ids
DROP FUNCTION IF EXISTS public.get_my_owned_track_ids CASCADE;
CREATE FUNCTION public.get_my_owned_track_ids()
RETURNS TABLE(track_id UUID) LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN QUERY SELECT DISTINCT uc.track_id FROM un_tunes_user_cards uc WHERE uc.user_id = auth.uid() AND uc.track_id IS NOT NULL;
END; $$;

-- 5. increment_track_plays
DROP FUNCTION IF EXISTS public.increment_track_plays CASCADE;
CREATE FUNCTION public.increment_track_plays(p_track_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE un_tunes_tracks SET play_count = COALESCE(play_count, 0) + 1 WHERE id = p_track_id;
END; $$;

-- 6. purchase_untunes
DROP FUNCTION IF EXISTS public.purchase_untunes CASCADE;
CREATE FUNCTION public.purchase_untunes(
  _type TEXT,
  _track_id UUID DEFAULT NULL,
  _album_id UUID DEFAULT NULL,
  _gold_tier BOOLEAN DEFAULT FALSE
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_cost NUMERIC;
  v_balance NUMERIC;
  v_new_balance NUMERIC;
  v_purchase_id UUID;
  v_rarity TEXT;
  v_card_count INT;
  i INT;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('error', 'Not authenticated'); END IF;

  CASE _type
    WHEN 'single' THEN v_cost := CASE WHEN _gold_tier THEN 3 ELSE 1 END;
    WHEN 'album'  THEN v_cost := CASE WHEN _gold_tier THEN 15 ELSE 5 END;
    WHEN 'pack'   THEN v_cost := CASE WHEN _gold_tier THEN 8 ELSE 3 END;
    ELSE RETURN jsonb_build_object('error', 'Invalid purchase type');
  END CASE;

  v_rarity := CASE WHEN _gold_tier THEN 'gold' ELSE 'standard' END;

  SELECT balance INTO v_balance FROM token_balances WHERE user_id = v_uid FOR UPDATE;
  v_balance := COALESCE(v_balance, 0);

  IF v_balance < v_cost THEN
    RETURN jsonb_build_object('error', 'Not enough tokens', 'required', v_cost, 'balance', v_balance);
  END IF;

  v_new_balance := public.deduct_token(v_uid, v_cost, 'purchase_untunes', _type || ' purchase');
  IF v_new_balance = -1 THEN
    RETURN jsonb_build_object('error', 'Not enough tokens');
  END IF;

  INSERT INTO un_tunes_purchases (user_id, track_id, album_id, tokens_spent, purchase_type)
  VALUES (v_uid, _track_id, _album_id, v_cost, _type)
  RETURNING id INTO v_purchase_id;

  v_card_count := CASE _type WHEN 'pack' THEN 3 ELSE 1 END;

  FOR i IN 1..v_card_count LOOP
    INSERT INTO un_tunes_user_cards (user_id, track_id, album_id, rarity, purchase_id, is_opened)
    VALUES (v_uid, _track_id, _album_id, v_rarity, v_purchase_id, FALSE);
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'purchase_id', v_purchase_id,
    'cards_created', v_card_count,
    'tokens_spent', v_cost,
    'new_balance', v_new_balance
  );
END; $$;

-- 7. get_feed_posts
DROP FUNCTION IF EXISTS public.get_feed_posts CASCADE;
CREATE FUNCTION public.get_feed_posts(
  p_user_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
) RETURNS JSONB[] LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE v_uid UUID := COALESCE(p_user_id, auth.uid());
BEGIN
  RETURN ARRAY(
    SELECT jsonb_build_object(
      'id', p.id,
      'user_id', p.user_id,
      'content', p.content,
      'image_url', p.image_url,
      'visibility', p.visibility,
      'comments_enabled', p.comments_enabled,
      'created_at', p.created_at,
      'updated_at', p.updated_at,
      'profiles', jsonb_build_object(
        'user_id', pr.user_id,
        'username', pr.username,
        'display_name', pr.display_name,
        'avatar_url', pr.avatar_url
      ),
      'kudos_count', COALESCE(k.cnt, 0),
      'comments_count', COALESCE(c.cnt, 0),
      'has_kudos', EXISTS (
        SELECT 1 FROM post_kudos pk WHERE pk.post_id = p.id AND pk.user_id = v_uid
      ),
      'media_items', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', pm.id,
          'media_type', pm.media_type,
          'media_url', pm.media_url,
          'thumbnail_url', pm.thumbnail_url,
          'sort_order', pm.sort_order
        ) ORDER BY pm.sort_order)
        FROM post_media pm WHERE pm.post_id = p.id
      ), '[]'::jsonb)
    )
    FROM posts p
    LEFT JOIN profiles pr ON pr.user_id = p.user_id
    LEFT JOIN LATERAL (SELECT COUNT(*) AS cnt FROM post_kudos pk WHERE pk.post_id = p.id) k ON TRUE
    LEFT JOIN LATERAL (SELECT COUNT(*) AS cnt FROM post_comments pc WHERE pc.post_id = p.id) c ON TRUE
    WHERE p.visibility = 'public'
       OR p.user_id = v_uid
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET p_offset
  );
END; $$;

-- 8. auto_fill_daily_habits
DROP FUNCTION IF EXISTS public.auto_fill_daily_habits CASCADE;
CREATE FUNCTION public.auto_fill_daily_habits(_user_id UUID DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid UUID := COALESCE(_user_id, auth.uid());
  v_today DATE := CURRENT_DATE;
  v_trained BOOLEAN;
  v_row daily_habits;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'reason', 'Not authenticated'); END IF;

  SELECT EXISTS (
    SELECT 1 FROM workout_sessions WHERE user_id = v_uid AND created_at::date = v_today
  ) INTO v_trained;

  INSERT INTO daily_habits (user_id, habit_date, train)
  VALUES (v_uid, v_today, v_trained)
  ON CONFLICT (user_id, habit_date)
  DO UPDATE SET train = GREATEST(daily_habits.train, v_trained), updated_at = now()
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'success', true,
    'date', v_today,
    'train', v_row.train,
    'learn_daily', v_row.learn_daily,
    'water', v_row.water,
    'do_the_hard_thing', v_row.do_the_hard_thing,
    'hit_your_numbers', v_row.hit_your_numbers
  );
END; $$;

-- 9. create_coaching_booking
DROP FUNCTION IF EXISTS public.create_coaching_booking CASCADE;
CREATE FUNCTION public.create_coaching_booking(
  p_coach_id UUID,
  p_service_type TEXT,
  p_block_type TEXT DEFAULT 'single',
  p_session_date DATE DEFAULT NULL,
  p_session_time TIME DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_booking_id UUID;
  v_price NUMERIC;
  v_sessions INT;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('error', 'Not authenticated'); END IF;

  SELECT CASE p_service_type
    WHEN '30min' THEN COALESCE(cpp.price_30min, 25)
    WHEN '60min' THEN COALESCE(cpp.price_60min, 45)
    WHEN 'hybrid' THEN COALESCE(cpp.price_hybrid, 35)
    WHEN 'consultation' THEN 0
    ELSE 0
  END INTO v_price
  FROM coach_public_profiles cpp WHERE cpp.user_id = p_coach_id;

  v_price := COALESCE(v_price, 0);

  v_sessions := CASE p_block_type
    WHEN 'block4' THEN 4 WHEN 'block8' THEN 8 WHEN 'block12' THEN 12 ELSE 1
  END;

  IF v_sessions > 1 THEN v_price := v_price * v_sessions * 0.9; END IF;

  INSERT INTO coaching_bookings (
    user_id, coach_id, service_type, block_type,
    session_date, session_time, price_gbp, sessions_remaining,
    status, payment_status
  ) VALUES (
    v_uid, p_coach_id, p_service_type, p_block_type,
    p_session_date, p_session_time, v_price, v_sessions,
    CASE WHEN v_price = 0 THEN 'confirmed' ELSE 'pending_payment' END,
    CASE WHEN v_price = 0 THEN 'free' ELSE 'pending' END
  ) RETURNING id INTO v_booking_id;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'price_gbp', v_price,
    'sessions', v_sessions,
    'status', CASE WHEN v_price = 0 THEN 'confirmed' ELSE 'pending_payment' END
  );
END; $$;

-- 10. get_coach_calendar
DROP FUNCTION IF EXISTS public.get_coach_calendar CASCADE;
CREATE FUNCTION public.get_coach_calendar(
  _coach_id UUID,
  _start TEXT,
  _end TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE v_bookings JSONB; v_habits JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', b.id, 'user_id', b.user_id,
    'service_type', b.service_type, 'session_date', b.session_date,
    'session_time', b.session_time, 'status', b.status,
    'display_name', pr.display_name, 'avatar_url', pr.avatar_url
  ) ORDER BY b.session_date, b.session_time), '[]'::jsonb) INTO v_bookings
  FROM coaching_bookings b
  LEFT JOIN profiles pr ON pr.user_id = b.user_id
  WHERE b.coach_id = _coach_id
    AND b.session_date BETWEEN _start::date AND _end::date
    AND b.status NOT IN ('cancelled');

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'habit_date', h.habit_date, 'train', h.train,
    'learn_daily', h.learn_daily, 'water', h.water,
    'do_the_hard_thing', h.do_the_hard_thing,
    'hit_your_numbers', h.hit_your_numbers
  ) ORDER BY h.habit_date), '[]'::jsonb) INTO v_habits
  FROM daily_habits h
  WHERE h.user_id = _coach_id
    AND h.habit_date BETWEEN _start::date AND _end::date;

  RETURN jsonb_build_object('bookings', v_bookings, 'habits', v_habits);
END; $$;

-- ═══ Grant execute to authenticated users ═══
GRANT EXECUTE ON FUNCTION public.deduct_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_token_balance TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_cards TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_owned_track_ids TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_track_plays TO authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_untunes TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_feed_posts TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.auto_fill_daily_habits TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_coaching_booking TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_coach_calendar TO authenticated;
