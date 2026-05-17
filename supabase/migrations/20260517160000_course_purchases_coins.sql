-- ============================================================
-- Add coin payment support to course_purchases
-- ============================================================

-- Payment method (stripe or coins)
ALTER TABLE course_purchases
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'stripe';

-- How many coins were spent (null for stripe or bundle)
ALTER TABLE course_purchases
  ADD COLUMN IF NOT EXISTS coins_spent NUMERIC(10,1);
