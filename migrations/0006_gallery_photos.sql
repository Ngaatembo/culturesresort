-- Real, admin-uploadable gallery photos. The original 20 launch photos
-- stay bundled with the site's code (src/lib/gallery.ts) since they were
-- shipped as build-time assets — this table is additive, for anything
-- uploaded from now on. The public gallery page merges both lists.
CREATE TABLE IF NOT EXISTS gallery_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  r2_key TEXT NOT NULL UNIQUE,
  alt TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Détail',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
