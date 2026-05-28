-- ═══════════════════════════════════════════════════════════════════
-- UN-TUNES CARDS: 5-Tier Rarity Upgrade + Card Anatomy Columns
-- 28 May 2026
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Expand rarity CHECK to include bronze, silver, platinum ──
-- Drop existing constraint and recreate with all 5 tiers
ALTER TABLE un_tunes_user_cards DROP CONSTRAINT IF EXISTS un_tunes_user_cards_rarity_check;
ALTER TABLE un_tunes_user_cards ADD CONSTRAINT un_tunes_user_cards_rarity_check
  CHECK (rarity IN ('standard', 'bronze', 'silver', 'gold', 'diamond', 'platinum'));

-- Migrate existing 'standard' cards → 'bronze' (entry level)
UPDATE un_tunes_user_cards SET rarity = 'bronze' WHERE rarity = 'standard';

-- ── 2. Add card anatomy columns ──
ALTER TABLE un_tunes_user_cards ADD COLUMN IF NOT EXISTS bio_line TEXT;
ALTER TABLE un_tunes_user_cards ADD COLUMN IF NOT EXISTS card_number TEXT;
ALTER TABLE un_tunes_user_cards ADD COLUMN IF NOT EXISTS category_tag TEXT DEFAULT 'Workout'
  CHECK (category_tag IN ('Workout', 'Warm Up', 'Recovery', 'Focus', 'Hype'));
ALTER TABLE un_tunes_user_cards ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0;
ALTER TABLE un_tunes_user_cards ADD COLUMN IF NOT EXISTS acquired_at TIMESTAMPTZ DEFAULT now();

-- ── 3. Add card_type column for Track/Album/Artist/Moment ──
ALTER TABLE un_tunes_user_cards ADD COLUMN IF NOT EXISTS card_type TEXT DEFAULT 'track'
  CHECK (card_type IN ('track', 'album', 'artist', 'moment'));

-- Set card_type based on existing FK references
UPDATE un_tunes_user_cards SET card_type = 'track' WHERE track_id IS NOT NULL AND card_type IS NULL;
UPDATE un_tunes_user_cards SET card_type = 'album' WHERE album_id IS NOT NULL AND track_id IS NULL AND card_type IS NULL;
UPDATE un_tunes_user_cards SET card_type = 'artist' WHERE brand_card_id IS NOT NULL AND track_id IS NULL AND album_id IS NULL AND card_type IS NULL;

-- ── 4. Stamp card numbers on existing cards ──
WITH numbered AS (
  SELECT id, '#' || LPAD(ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at)::text, 4, '0') AS num
  FROM un_tunes_user_cards
  WHERE card_number IS NULL
)
UPDATE un_tunes_user_cards c SET card_number = n.num
FROM numbered n WHERE c.id = n.id;

-- ── 5. Stamp trigger for new Un-Tunes cards ──
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
  IF NEW.card_type IS NULL THEN
    NEW.card_type := CASE
      WHEN NEW.brand_card_id IS NOT NULL THEN 'artist'
      WHEN NEW.album_id IS NOT NULL AND NEW.track_id IS NULL THEN 'album'
      ELSE 'track'
    END;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stamp_untunes_card ON un_tunes_user_cards;
CREATE TRIGGER trg_stamp_untunes_card
  BEFORE INSERT ON un_tunes_user_cards
  FOR EACH ROW
  EXECUTE FUNCTION stamp_untunes_card();

-- ── 6. Update brand_cards rarity constraint too ──
ALTER TABLE un_tunes_brand_cards DROP CONSTRAINT IF EXISTS un_tunes_brand_cards_rarity_check;
-- brand_cards don't have a rarity column (they define max_* counts), but ensure card_listings work
ALTER TABLE un_tunes_card_listings DROP CONSTRAINT IF EXISTS un_tunes_card_listings_status_check;

-- ── 7. Indexes for new columns ──
CREATE INDEX IF NOT EXISTS idx_user_cards_card_type ON un_tunes_user_cards(card_type);
CREATE INDEX IF NOT EXISTS idx_user_cards_category ON un_tunes_user_cards(category_tag);
CREATE INDEX IF NOT EXISTS idx_user_cards_bio ON un_tunes_user_cards(bio_line) WHERE bio_line IS NOT NULL;

-- ── 8. Play count tracking — increment on stream ──
CREATE OR REPLACE FUNCTION increment_untunes_play_count(
  p_user_id UUID,
  p_track_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE un_tunes_user_cards
  SET play_count = COALESCE(play_count, 0) + 1
  WHERE user_id = p_user_id
    AND track_id = p_track_id;
END;
$$;
