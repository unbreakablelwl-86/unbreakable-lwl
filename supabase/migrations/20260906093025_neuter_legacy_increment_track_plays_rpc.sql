-- play_count is now incremented atomically by trg_bump_track_play_count
-- (AFTER INSERT trigger on un_tunes_plays). The client still calls this RPC
-- explicitly after inserting a play row in a couple of places; until that
-- client code is updated to drop the now-redundant call, turn this into a
-- no-op so plays aren't double-counted (insert trigger + this RPC both
-- firing on the same play).
CREATE OR REPLACE FUNCTION public.increment_track_plays(p_track_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- No-op: superseded by trg_bump_track_play_count on un_tunes_plays.
  -- Kept as a function (rather than dropped) so any in-flight client
  -- calls don't error while the frontend is updated to stop calling it.
  NULL;
END;
$$;
