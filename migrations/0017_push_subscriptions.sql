-- Web Push subscriptions for admin devices (new-order phone alerts).
-- One admin can have many devices (phone + laptop); each device is one row,
-- keyed by its unique push endpoint. Rows are removed automatically if the
-- admin account is deleted, and marked inactive when the push service reports
-- the subscription as gone (HTTP 404/410).
-- Only the public subscription data the browser hands us is stored (endpoint,
-- p256dh, auth). The server's VAPID private key lives in app_secrets.
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  platform TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  failure_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_success_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_admin ON push_subscriptions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(active);
