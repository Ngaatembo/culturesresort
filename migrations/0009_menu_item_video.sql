-- Optional short video clip per menu item (hover-to-play on the menu grid).
-- Same bucket/serving route as photos, stored under a menu-video/ prefix.
ALTER TABLE menu_items ADD COLUMN video_url TEXT;
