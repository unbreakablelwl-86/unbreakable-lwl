-- ═══════════════════════════════════════════════════════════════
-- Un-Tunes: Brand Cards, Lyric Cards & Trading / Auction House
-- Run AFTER 20260527_untunes_store.sql
-- ═══════════════════════════════════════════════════════════════

-- ══════════ 1. BRAND & LYRIC CARDS ══════════

-- Card type column on user_cards — standard track/album cards + brand + lyric
ALTER TABLE un_tunes_user_cards 
  ADD COLUMN IF NOT EXISTS card_type text NOT NULL DEFAULT 'track'
    CHECK (card_type IN ('track', 'album', 'brand', 'lyric'));

-- Brand cards catalog — the 3 ultra-exclusive cards
CREATE TABLE IF NOT EXISTS un_tunes_brand_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,          -- 'unbreakable', 'live-without-limits', 'keep-showing-up'
  title text NOT NULL,
  description text,
  artwork_url text,
  max_standard integer NOT NULL DEFAULT 500,
  max_gold integer NOT NULL DEFAULT 50,
  max_diamond integer NOT NULL DEFAULT 10,
  drop_rate_standard numeric NOT NULL DEFAULT 0.02,   -- 2% per pack
  drop_rate_gold numeric NOT NULL DEFAULT 0.003,       -- 0.3%
  drop_rate_diamond numeric NOT NULL DEFAULT 0.0005,   -- 0.05%
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed the 3 brand cards
INSERT INTO un_tunes_brand_cards (slug, title, description) VALUES
  ('unbreakable', 'UNBREAKABLE', 'The flagship brand card. You are unbreakable.'),
  ('live-without-limits', 'LIVE WITHOUT LIMITS', 'The mantra. No ceiling, no boundaries.'),
  ('keep-showing-up', 'KEEP SHOWING UP', 'The mindset. Consistency beats everything.')
ON CONFLICT (slug) DO NOTHING;

-- Add brand_card_id to user_cards
ALTER TABLE un_tunes_user_cards 
  ADD COLUMN IF NOT EXISTS brand_card_id uuid REFERENCES un_tunes_brand_cards(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_cards_brand ON un_tunes_user_cards(brand_card_id, rarity);

-- Lyric cards catalog — one iconic lyric per track
CREATE TABLE IF NOT EXISTS un_tunes_lyric_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES un_tunes_tracks(id) ON DELETE CASCADE,
  lyric_text text NOT NULL,            -- The standout lyric line
  artwork_url text,                    -- Neon script artwork
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(track_id)
);

-- Add lyric_card_id to user_cards
ALTER TABLE un_tunes_user_cards 
  ADD COLUMN IF NOT EXISTS lyric_card_id uuid REFERENCES un_tunes_lyric_cards(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_cards_lyric ON un_tunes_user_cards(lyric_card_id, rarity);

-- Brand card edition counter (like diamond but per-rarity capped)
CREATE OR REPLACE FUNCTION claim_brand_edition(
  p_brand_card_id uuid,
  p_rarity text
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  current_count integer;
  max_count integer;
BEGIN
  -- Get the max for this rarity
  IF p_rarity = 'standard' THEN
    SELECT max_standard INTO max_count FROM un_tunes_brand_cards WHERE id = p_brand_card_id;
  ELSIF p_rarity = 'gold' THEN
    SELECT max_gold INTO max_count FROM un_tunes_brand_cards WHERE id = p_brand_card_id;
  ELSIF p_rarity = 'diamond' THEN
    SELECT max_diamond INTO max_count FROM un_tunes_brand_cards WHERE id = p_brand_card_id;
  ELSE
    RETURN -1;
  END IF;

  -- Count existing
  SELECT COUNT(*) INTO current_count
  FROM un_tunes_user_cards
  WHERE brand_card_id = p_brand_card_id AND rarity = p_rarity
  FOR UPDATE;

  IF current_count >= max_count THEN
    RETURN -1; -- Sold out
  END IF;

  RETURN current_count + 1;
END;
$$;


-- ══════════ 2. TRADING / AUCTION HOUSE ══════════

-- Card listings (for sale / auction)
CREATE TABLE IF NOT EXISTS un_tunes_card_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id uuid NOT NULL REFERENCES un_tunes_user_cards(id) ON DELETE CASCADE,
  listing_type text NOT NULL DEFAULT 'auction' CHECK (listing_type IN ('auction', 'fixed')),
  starting_price integer NOT NULL DEFAULT 1,      -- tokens
  buy_now_price integer,                           -- optional instant buy price
  current_bid integer NOT NULL DEFAULT 0,
  current_bidder_id uuid REFERENCES auth.users(id),
  ends_at timestamptz NOT NULL,                    -- auction end time
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listings_status ON un_tunes_card_listings(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_listings_seller ON un_tunes_card_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_ends ON un_tunes_card_listings(ends_at) WHERE status = 'active';

-- Bid history
CREATE TABLE IF NOT EXISTS un_tunes_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES un_tunes_card_listings(id) ON DELETE CASCADE,
  bidder_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bids_listing ON un_tunes_bids(listing_id, amount DESC);

-- Direct trades (card-for-card swaps)
CREATE TABLE IF NOT EXISTS un_tunes_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposer_card_id uuid NOT NULL REFERENCES un_tunes_user_cards(id),
  receiver_card_id uuid NOT NULL REFERENCES un_tunes_user_cards(id),
  tokens_offered integer NOT NULL DEFAULT 0,       -- extra tokens on top
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_trades_receiver ON un_tunes_trades(receiver_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_trades_proposer ON un_tunes_trades(proposer_id);

-- Trade / auction history for price tracking
CREATE TABLE IF NOT EXISTS un_tunes_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_type text NOT NULL,             -- 'track', 'album', 'brand', 'lyric'
  reference_id uuid,                   -- track_id, album_id, brand_card_id, or lyric_card_id
  rarity text NOT NULL,
  sale_price integer NOT NULL,         -- tokens
  sale_type text NOT NULL,             -- 'auction', 'fixed', 'trade'
  sold_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_history ON un_tunes_price_history(card_type, reference_id, sold_at DESC);

-- ══════════ 3. RLS POLICIES ══════════

ALTER TABLE un_tunes_brand_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE un_tunes_lyric_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE un_tunes_card_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE un_tunes_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE un_tunes_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE un_tunes_price_history ENABLE ROW LEVEL SECURITY;

-- Brand cards: everyone can read
CREATE POLICY "Anyone can view brand cards" ON un_tunes_brand_cards FOR SELECT USING (true);

-- Lyric cards: everyone can read
CREATE POLICY "Anyone can view lyric cards" ON un_tunes_lyric_cards FOR SELECT USING (true);

-- Listings: everyone can view active, sellers can manage own
CREATE POLICY "Anyone can view active listings" ON un_tunes_card_listings
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid());
CREATE POLICY "Users can create listings" ON un_tunes_card_listings
  FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own listings" ON un_tunes_card_listings
  FOR UPDATE USING (auth.uid() = seller_id);

-- Bids: anyone can view, users can place
CREATE POLICY "Anyone can view bids" ON un_tunes_bids FOR SELECT USING (true);
CREATE POLICY "Users can place bids" ON un_tunes_bids
  FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- Trades: involved parties can view
CREATE POLICY "Trade parties can view" ON un_tunes_trades
  FOR SELECT USING (auth.uid() = proposer_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can propose trades" ON un_tunes_trades
  FOR INSERT WITH CHECK (auth.uid() = proposer_id);
CREATE POLICY "Receiver can update trade" ON un_tunes_trades
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Price history: everyone can read
CREATE POLICY "Anyone can view price history" ON un_tunes_price_history FOR SELECT USING (true);

-- Done! 🔥 Brand cards + Lyric cards + Trading + Auction House
