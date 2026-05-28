-- ═══════════════════════════════════════════════════════════════
-- Card Integrity Fixes — Duplicate detection + Platinum numbering
-- ═══════════════════════════════════════════════════════════════

-- 1. Unique constraint: prevent duplicate PB cards (same user + exercise + value + unit)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_achievement_card_pb_dedup'
  ) THEN
    -- First, remove any existing dupes (keep earliest)
    DELETE FROM achievement_cards a
    WHERE a.id NOT IN (
      SELECT DISTINCT ON (user_id, exercise_name, record_value, record_unit)
        id
      FROM achievement_cards
      WHERE card_type IN ('pb_personal', 'pb_global')
        AND exercise_name IS NOT NULL
        AND record_value IS NOT NULL
      ORDER BY user_id, exercise_name, record_value, record_unit, earned_at ASC
    )
    AND a.card_type IN ('pb_personal', 'pb_global')
    AND a.exercise_name IS NOT NULL
    AND a.record_value IS NOT NULL;

    CREATE UNIQUE INDEX uq_achievement_card_pb_dedup
    ON achievement_cards (user_id, card_type, exercise_name, record_value, record_unit)
    WHERE card_type IN ('pb_personal', 'pb_global')
      AND exercise_name IS NOT NULL
      AND record_value IS NOT NULL;
  END IF;
END $$;

-- 2. Add edition_number / edition_total for Platinum limited editions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievement_cards' AND column_name = 'edition_number') THEN
    ALTER TABLE achievement_cards ADD COLUMN edition_number integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievement_cards' AND column_name = 'edition_total') THEN
    ALTER TABLE achievement_cards ADD COLUMN edition_total integer DEFAULT 50;
  END IF;
END $$;

-- 3. Platinum global numbering sequence
CREATE SEQUENCE IF NOT EXISTS platinum_card_sequence START WITH 1;

-- 4. Function to auto-assign Platinum card numbers
CREATE OR REPLACE FUNCTION assign_platinum_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rarity = 'platinum' AND NEW.edition_number IS NULL THEN
    NEW.edition_number := nextval('platinum_card_sequence');
    NEW.card_number := '#' || LPAD(NEW.edition_number::text, 3, '0') || ' / ' || COALESCE(NEW.edition_total, 50);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_platinum_number ON achievement_cards;
CREATE TRIGGER trg_platinum_number
  BEFORE INSERT ON achievement_cards
  FOR EACH ROW
  WHEN (NEW.rarity = 'platinum')
  EXECUTE FUNCTION assign_platinum_number();

-- 5. Add 'moment' to card_type check constraint (if it exists)
-- Safely alter the check constraint for card_type
DO $$
BEGIN
  -- Try to drop old constraint
  BEGIN
    ALTER TABLE achievement_cards DROP CONSTRAINT IF EXISTS achievement_cards_card_type_check;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  -- Add new constraint including 'moment'
  BEGIN
    ALTER TABLE achievement_cards ADD CONSTRAINT achievement_cards_card_type_check
    CHECK (card_type IN ('programme_trophy', 'pb_personal', 'pb_global', 'moment'));
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- 6. Card shares tracking table for analytics
CREATE TABLE IF NOT EXISTS card_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES achievement_cards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_destination text NOT NULL CHECK (share_destination IN ('timeline', 'socials', 'download', 'link')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_card_shares_card ON card_shares(card_id);
CREATE INDEX IF NOT EXISTS idx_card_shares_user ON card_shares(user_id);

-- RLS
ALTER TABLE card_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY card_shares_insert ON card_shares FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY card_shares_select ON card_shares FOR SELECT TO authenticated USING (auth.uid() = user_id);
