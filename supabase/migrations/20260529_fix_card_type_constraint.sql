-- ═══════════════════════════════════════════════════════════════
-- Fix un_tunes_user_cards card_type constraint
-- Unifies 'brand' and 'artist' → keeps 'brand' for brand_card_id cards
-- Adds all needed types: track, album, brand, lyric, artist, moment
-- ═══════════════════════════════════════════════════════════════

-- 1. Drop conflicting constraints
ALTER TABLE un_tunes_user_cards DROP CONSTRAINT IF EXISTS un_tunes_user_cards_card_type_check;

-- 2. Normalise any 'artist' back to 'brand' for brand_card_id cards
UPDATE un_tunes_user_cards SET card_type = 'brand' WHERE card_type = 'artist' AND brand_card_id IS NOT NULL;

-- 3. Add a unified constraint that accepts all known types
ALTER TABLE un_tunes_user_cards ADD CONSTRAINT un_tunes_user_cards_card_type_check
  CHECK (card_type IN ('track', 'album', 'brand', 'lyric', 'artist', 'moment'));

-- 4. Fix the auto-stamp trigger to use 'brand' not 'artist'
CREATE OR REPLACE FUNCTION stamp_untunes_card()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Generate card number
  SELECT COUNT(*) + 1 INTO v_count
  FROM un_tunes_user_cards
  WHERE user_id = NEW.user_id AND id != NEW.id;

  NEW.card_number := '#' || LPAD(v_count::text, 4, '0');
  NEW.acquired_at := COALESCE(NEW.acquired_at, now());

  -- Derive card_type from FK if not set
  IF NEW.card_type IS NULL OR NEW.card_type = 'track' THEN
    NEW.card_type := CASE
      WHEN NEW.brand_card_id IS NOT NULL THEN 'brand'
      WHEN NEW.lyric_card_id IS NOT NULL THEN 'lyric'
      WHEN NEW.album_id IS NOT NULL AND NEW.track_id IS NULL THEN 'album'
      ELSE 'track'
    END;
  END IF;

  RETURN NEW;
END;
$$;
