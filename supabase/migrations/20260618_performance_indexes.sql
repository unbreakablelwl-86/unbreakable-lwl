-- ============================================================
-- Performance indexes for feed, habits, and social queries
-- Created by Viktor – 2026-06-18
-- ============================================================

-- Posts feed (get_feed_posts uses these)
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility, created_at DESC);

-- Post interactions
CREATE INDEX IF NOT EXISTS idx_post_kudos_post_id ON post_kudos(post_id);
CREATE INDEX IF NOT EXISTS idx_post_kudos_user_id ON post_kudos(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_media_post_id ON post_media(post_id, sort_order);

-- Daily habits
CREATE INDEX IF NOT EXISTS idx_daily_habits_user_date ON daily_habits(user_id, habit_date DESC);

-- Token balance lookup
CREATE INDEX IF NOT EXISTS idx_token_balances_user ON token_balances(user_id);

-- Workout sessions (used by auto_fill_daily_habits)
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, created_at DESC);

-- UnTunes purchases
CREATE INDEX IF NOT EXISTS idx_untunes_purchases_user ON un_tunes_purchases(user_id, created_at DESC);
