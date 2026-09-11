ALTER TABLE gallery_photos ADD COLUMN bundled_source TEXT;
ALTER TABLE gallery_photos ADD COLUMN is_deleted INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_photos_bundled_source ON gallery_photos(bundled_source) WHERE bundled_source IS NOT NULL;
