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
