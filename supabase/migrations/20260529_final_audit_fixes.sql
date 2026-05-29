-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FINAL AUDIT FIXES — 29 May 2026
-- 1. error_logs table for client-side error tracking
-- 2. user_presence table for coach online status
-- 3. push_subscriptions table for push notifications
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ── 1. Error Logs ──
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  stack TEXT,
  source TEXT,
  url TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_created ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_user ON error_logs(user_id);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Users can insert their own errors
CREATE POLICY "Users can insert errors"
  ON error_logs FOR INSERT
  WITH CHECK (true);

-- Only devs/admins can read
CREATE POLICY "Devs can read errors"
  ON error_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('dev', 'admin')
    )
  );

-- Auto-cleanup: keep only last 30 days
-- (run via pg_cron or manual cleanup)

-- ── 2. User Presence ──
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_online BOOLEAN NOT NULL DEFAULT false,
  current_page TEXT
);

ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Anyone can read presence
CREATE POLICY "Anyone can read presence"
  ON user_presence FOR SELECT
  USING (true);

-- Users can update their own presence
CREATE POLICY "Users can upsert own presence"
  ON user_presence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presence"
  ON user_presence FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update presence (call from client heartbeat)
CREATE OR REPLACE FUNCTION update_presence(p_page TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_presence (user_id, last_seen, is_online, current_page)
  VALUES (auth.uid(), now(), true, p_page)
  ON CONFLICT (user_id) DO UPDATE SET
    last_seen = now(),
    is_online = true,
    current_page = COALESCE(p_page, user_presence.current_page);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark users offline if not seen for 5 minutes
CREATE OR REPLACE FUNCTION mark_stale_users_offline()
RETURNS VOID AS $$
BEGIN
  UPDATE user_presence
  SET is_online = false
  WHERE is_online = true
  AND last_seen < now() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 3. Push Notification Subscriptions ──
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  device_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subs"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to send push notification (uses pg_net or edge function)
CREATE OR REPLACE FUNCTION notify_user(
  p_user_id UUID,
  p_title TEXT,
  p_body TEXT,
  p_url TEXT DEFAULT '/',
  p_icon TEXT DEFAULT '/icons/icon-192x192.png'
)
RETURNS VOID AS $$
BEGIN
  -- Store notification in-app
  INSERT INTO notifications (user_id, type, title, body, url, is_read)
  VALUES (p_user_id, 'push', p_title, p_body, p_url, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure notifications table has the fields we need
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS url TEXT,
  ADD COLUMN IF NOT EXISTS icon TEXT;
