-- Cultures Resort — admin authentication
-- One row per admin login. Passwords are never stored in plaintext —
-- only a PBKDF2 hash + its own random salt (see src/lib/auth/password.ts).
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Small self-provisioned key/value store for server-side secrets that
-- shouldn't depend on Cloudflare's dashboard "Variables and Secrets" UI —
-- notably the session-signing key, which the app generates itself on
-- first use (see src/lib/auth/session.ts) instead of requiring a manual
-- Worker secret that can be wiped by GitHub-integration redeploys.
CREATE TABLE IF NOT EXISTS app_secrets (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
