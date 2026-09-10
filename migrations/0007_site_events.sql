-- Events/specials the restaurant itself posts (e.g. "Mother's Day
-- Special"), distinct from the `bookings` table, which holds guest
-- enquiries asking to book a function. This is content the owner
-- publishes; that's requests coming in.
CREATE TABLE IF NOT EXISTS site_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_key TEXT, -- R2 object key in the same "GALLERY" bucket, or NULL
  event_date TEXT, -- free text ("11 May 2026", "Every Sunday"), optional
  status TEXT NOT NULL DEFAULT 'upcoming', -- upcoming | active | past | cancelled
  featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
