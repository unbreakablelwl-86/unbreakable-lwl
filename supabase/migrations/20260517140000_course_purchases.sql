-- ============================================================
-- Course purchases — tracks which university courses users own
-- ============================================================

CREATE TABLE IF NOT EXISTS course_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_key TEXT NOT NULL,                     -- e.g. 'gym_l2', 'sport_football'
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_key)
);

-- Index for fast lookup
CREATE INDEX idx_course_purchases_user ON course_purchases(user_id);

-- RLS
ALTER TABLE course_purchases ENABLE ROW LEVEL SECURITY;

-- Users can read their own purchases
CREATE POLICY "Users read own course purchases"
  ON course_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role inserts (via webhook) — no user-facing insert policy
-- The webhook uses service role key so it bypasses RLS
