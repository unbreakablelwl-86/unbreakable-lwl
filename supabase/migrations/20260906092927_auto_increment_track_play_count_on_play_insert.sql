-- The client used to record a play in two separate network round trips:
--   1) INSERT into un_tunes_plays
--   2) RPC call to increment_track_plays(track_id)
-- Step 2 was fire-and-forget with no error handling, so whenever it didn't
-- complete (mobile tab backgrounded, network hiccup, app navigation, etc.)
-- the play was logged but play_count silently fell behind. Audit showed
-- stored play_count trailing actual un_tunes_plays rows by 10-25% on
-- popular tracks.
--
-- Fix: move the increment into a DB trigger on un_tunes_plays so it's
-- atomic with the insert itself — one network call, no dropped increments.

CREATE OR REPLACE FUNCTION public.bump_track_play_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  UPDATE un_tunes_tracks
  SET play_count = COALESCE(play_count, 0) + 1
  WHERE id = NEW.track_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bump_track_play_count ON un_tunes_plays;
CREATE TRIGGER trg_bump_track_play_count
AFTER INSERT ON un_tunes_plays
FOR EACH ROW
EXECUTE FUNCTION public.bump_track_play_count();

-- True up existing counts that already drifted behind actual play rows.
UPDATE un_tunes_tracks t
SET play_count = sub.actual
FROM (
  SELECT track_id, COUNT(*) AS actual
  FROM un_tunes_plays
  GROUP BY track_id
) sub
WHERE t.id = sub.track_id
  AND COALESCE(t.play_count, 0) <> sub.actual;
