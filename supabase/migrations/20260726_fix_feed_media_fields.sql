-- Fix get_feed_posts to include width, height, duration_seconds in media_items
-- (needed for audio clip bounds and video dimensions)
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
          'sort_order', pm.sort_order,
          'width', pm.width,
          'height', pm.height,
          'duration_seconds', pm.duration_seconds
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

GRANT EXECUTE ON FUNCTION public.get_feed_posts TO authenticated, anon;
