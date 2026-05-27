-- ═══════════════════════════════════════════════════════════════
-- Un-Tunes Store: Collectible Cards & Token Purchases
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════

-- 1. Add columns to un_tunes_purchases
ALTER TABLE un_tunes_purchases 
  ADD COLUMN IF NOT EXISTS tokens_spent numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS purchase_type text DEFAULT 'single';

-- 2. Create user cards / collectibles table
CREATE TABLE IF NOT EXISTS un_tunes_user_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id uuid REFERENCES un_tunes_tracks(id) ON DELETE SET NULL,
  album_id uuid REFERENCES un_tunes_albums(id) ON DELETE SET NULL,
  rarity text NOT NULL DEFAULT 'standard' CHECK (rarity IN ('standard', 'gold', 'diamond')),
  edition_number integer NOT NULL DEFAULT 0,
  purchase_id uuid REFERENCES un_tunes_purchases(id) ON DELETE SET NULL,
  is_opened boolean NOT NULL DEFAULT false,
  opened_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_user_cards_user ON un_tunes_user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_purchase ON un_tunes_user_cards(purchase_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_rarity ON un_tunes_user_cards(rarity) WHERE rarity = 'diamond';
CREATE INDEX IF NOT EXISTS idx_user_cards_track ON un_tunes_user_cards(track_id, rarity);
CREATE INDEX IF NOT EXISTS idx_user_cards_album ON un_tunes_user_cards(album_id, rarity);

-- 4. Diamond edition counter (atomic, race-safe)
CREATE OR REPLACE FUNCTION claim_diamond_edition(
  p_track_id uuid DEFAULT NULL,
  p_album_id uuid DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  current_count integer;
BEGIN
  -- Lock the relevant rows to prevent race conditions
  IF p_track_id IS NOT NULL THEN
    SELECT COUNT(*) INTO current_count
    FROM un_tunes_user_cards
    WHERE track_id = p_track_id AND rarity = 'diamond'
    FOR UPDATE;
  ELSIF p_album_id IS NOT NULL THEN
    SELECT COUNT(*) INTO current_count
    FROM un_tunes_user_cards
    WHERE album_id = p_album_id AND rarity = 'diamond'
    FOR UPDATE;
  ELSE
    RETURN -1;
  END IF;
  
  IF current_count >= 100 THEN
    RETURN -1; -- No more diamond editions available
  END IF;
  
  RETURN current_count + 1;
END;
$$;

-- 5. RLS policies
ALTER TABLE un_tunes_user_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own cards" ON un_tunes_user_cards;
CREATE POLICY "Users can view own cards" ON un_tunes_user_cards
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can insert cards" ON un_tunes_user_cards;
CREATE POLICY "Service can insert cards" ON un_tunes_user_cards
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own cards" ON un_tunes_user_cards;
CREATE POLICY "Users can update own cards" ON un_tunes_user_cards
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Set token prices
-- Songs: 3 tokens ≈ £1 | Albums: 30 tokens ≈ £10 | Bundle: 50 tokens ≈ price of 2
UPDATE un_tunes_tracks SET price_gbp = 3 WHERE price_gbp IS NULL OR price_gbp = 0;
UPDATE un_tunes_albums SET price_gbp = 30 WHERE price_gbp IS NULL OR price_gbp = 0;

-- Done! 🔥
