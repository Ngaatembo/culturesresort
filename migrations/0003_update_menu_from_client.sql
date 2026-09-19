-- Cultures Resort: menu update from the latest client-supplied menu pages.
-- Existing photos are intentionally preserved. This migration changes menu data/prices
-- and adds portion pricing only; it does not touch image_url values.

CREATE TABLE IF NOT EXISTS menu_item_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_menu_item_options_item
ON menu_item_options(menu_item_id);

-- Starters
UPDATE menu_items SET price_cents = 400, updated_at = datetime('now') WHERE name = 'Piri Piri Gizzards';
UPDATE menu_items SET price_cents = 400, updated_at = datetime('now') WHERE name = 'Fried Liver (Chiropa)';
UPDATE menu_items SET price_cents = 400, updated_at = datetime('now') WHERE name = 'Mopani Worms (Madora)';
UPDATE menu_items SET price_cents = 400, updated_at = datetime('now') WHERE name = 'Fried Kapenta (Omena)';

-- Main course / grills
UPDATE menu_items SET price_cents = 1300, updated_at = datetime('now') WHERE name = 'Kuku Karanga';
UPDATE menu_items SET price_cents = 1200, updated_at = datetime('now') WHERE name = 'Beef Chop ala Masai';
UPDATE menu_items
SET name = 'Mbuzi Ulaya / Charcoal Grilled',
    price_cents = 1200,
    description = 'Charcoal grilled',
    updated_at = datetime('now')
WHERE name = 'Mbuzi Ulaya (Charcoal Grilled Pork Chops)';

UPDATE menu_items
SET price_cents = 1600,
    description = 'Full goat leg grilled on charcoal',
    updated_at = datetime('now')
WHERE name = 'Mguu wa Mbuzi';

UPDATE menu_items
SET price_cents = 1200,
    description = 'Spicy & delicious',
    updated_at = datetime('now')
WHERE name = 'Borewores';

UPDATE menu_items
SET price_cents = 1200,
    description = 'Grilled, stewed or with dovi',
    updated_at = datetime('now')
WHERE name = 'Tsuro (Rabbit)';

UPDATE menu_items
SET price_cents = 1500,
    description = 'Charcoal grilled duck',
    updated_at = datetime('now')
WHERE name = 'Bata Choma';

UPDATE menu_items
SET price_cents = 1300,
    description = 'Tender beef stew fried with vegetables',
    updated_at = datetime('now')
WHERE name = 'Haifiridzi';

UPDATE menu_items
SET price_cents = 1200,
    description = 'Real warrior',
    updated_at = datetime('now')
WHERE name = 'Braaied Beef Short Ribs';

UPDATE menu_items
SET price_cents = 2800,
    description = 'Charcoal grilled',
    updated_at = datetime('now')
WHERE name = 'Huge Pork Ribs';

-- Match the printed-menu wording while preserving existing photos.
UPDATE menu_items
SET name = 'Zvinvenze',
    description = 'Kapoto',
    updated_at = datetime('now')
WHERE name = 'Zvinyenze';

UPDATE menu_items
SET name = 'Kuku Kienyeji / Road Runner',
    description = 'Charcoal grilled indigenous chicken',
    price_cents = 0,
    updated_at = datetime('now')
WHERE name = 'Road Runner Chicken (Kuku Kienyeji)';

UPDATE menu_items
SET name = 'Mbavu za Mbuzi',
    description = 'Goat ribs',
    price_cents = 0,
    updated_at = datetime('now')
WHERE name = 'Goat Ribs (Mbavu za Mbuzi)';

-- Accompaniments
UPDATE menu_items
SET price_cents = 200,
    description = 'Rice prepared with peanut butter sauce',
    updated_at = datetime('now')
WHERE name = 'Mpunga Une Dovi';

UPDATE menu_items
SET price_cents = 100,
    updated_at = datetime('now')
WHERE name = 'Sadza / Ugali (Isitshwala)';

UPDATE menu_items
SET name = 'Fried Potato Wedges',
    price_cents = 300,
    updated_at = datetime('now')
WHERE name = 'Fried Potatoes';

UPDATE menu_items
SET price_cents = 300,
    updated_at = datetime('now')
WHERE name = 'Chips';

-- Desserts
UPDATE menu_items SET price_cents = 400, updated_at = datetime('now') WHERE name = 'Homemade Cake Slice';
UPDATE menu_items SET price_cents = 300, updated_at = datetime('now') WHERE name = 'Wild Dried Fruits';
UPDATE menu_items SET price_cents = 200, updated_at = datetime('now') WHERE name = 'Best Zimbabwean Tea / Coffee';

-- Items from the old seed that are not on the latest supplied food-menu pages.
UPDATE menu_items
SET available = 0,
    updated_at = datetime('now')
WHERE name IN (
  'Pork Trotters / Bones',
  'Sadza Rezviyo / Remhunga',
  'Muriwo Une Dovi',
  'Pilau / Jollof Rice',
  'Plain Rice (Wali)'
);

-- New printed-menu items.
INSERT INTO menu_items
(kind, category_slug, category_title, name, description, price_cents, featured, available, sort_order)
SELECT 'food','grills','Off the Charcoal','Samaki Makange','Whole bream stewed',0,0,1,13
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Samaki Makange');

INSERT INTO menu_items
(kind, category_slug, category_title, name, description, price_cents, featured, available, sort_order)
SELECT 'food','sides','Accompaniments','Mufushwa Une Dovi','Dried vegetables stewed with peanut butter sauce',300,0,1,10
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Mufushwa Une Dovi');

INSERT INTO menu_items
(kind, category_slug, category_title, name, description, price_cents, featured, available, sort_order)
SELECT 'food','sides','Accompaniments','Plain Aromatic Rice','Plain aromatic rice',100,0,1,11
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Plain Aromatic Rice');

INSERT INTO menu_items
(kind, category_slug, category_title, name, description, price_cents, featured, available, sort_order)
SELECT 'food','sides','Accompaniments','Biryani Rice','',0,0,1,12
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Biryani Rice');

INSERT INTO menu_items
(kind, category_slug, category_title, name, description, price_cents, featured, available, sort_order)
SELECT 'food','sides','Accompaniments','Jollof Rice','',0,0,1,13
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Jollof Rice');

-- Multi-price items from the supplied menu pages.
DELETE FROM menu_item_options;

INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'1/2',800,1 FROM menu_items WHERE name = 'Kuku Choma';
INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'Full',1200,2 FROM menu_items WHERE name = 'Kuku Choma';

INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'1/2',800,1 FROM menu_items WHERE name = 'Mbavu za Mbuzi';
INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'Full',1300,2 FROM menu_items WHERE name = 'Mbavu za Mbuzi';

INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'1/2 Poto',700,1 FROM menu_items WHERE name = 'Hanga';
INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'Full Poto',1200,2 FROM menu_items WHERE name = 'Hanga';

INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'Big',2000,1 FROM menu_items WHERE name = 'Samaki (Hove/Tsomba/Bream)';
INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'Med',1500,2 FROM menu_items WHERE name = 'Samaki (Hove/Tsomba/Bream)';
INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'Small',1300,3 FROM menu_items WHERE name = 'Samaki (Hove/Tsomba/Bream)';

INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'Big',2100,1 FROM menu_items WHERE name = 'Samaki Makange';
INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'Med',1600,2 FROM menu_items WHERE name = 'Samaki Makange';
INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'Small',1400,3 FROM menu_items WHERE name = 'Samaki Makange';

INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'Portion',500,1 FROM menu_items WHERE name = 'Zvinvenze';
INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'Kapoto',900,2 FROM menu_items WHERE name = 'Zvinvenze';

INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'Portion',400,1 FROM menu_items WHERE name = 'Mbuzi Kapoto';
INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'1/2 Poto',600,2 FROM menu_items WHERE name = 'Mbuzi Kapoto';
INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'Full Poto',900,3 FROM menu_items WHERE name = 'Mbuzi Kapoto';

INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'1/2',700,1 FROM menu_items WHERE name = 'Kuku Kienyeji / Road Runner';
INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'Full',1200,2 FROM menu_items WHERE name = 'Kuku Kienyeji / Road Runner';

INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'2 pax',2000,1 FROM menu_items WHERE name = 'Maasai Meat Platter';
INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'4 pax',3900,2 FROM menu_items WHERE name = 'Maasai Meat Platter';

INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'Plain',200,1 FROM menu_items WHERE name = 'Biryani Rice';
INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'With Goat Meat',900,2 FROM menu_items WHERE name = 'Biryani Rice';

INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'Plain',200,1 FROM menu_items WHERE name = 'Jollof Rice';
INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order)
SELECT id,'With Chicken',900,2 FROM menu_items WHERE name = 'Jollof Rice';

-- Items with portion pricing use their options instead of the legacy single price.
UPDATE menu_items
SET price_cents = 0,
    updated_at = datetime('now')
WHERE id IN (SELECT menu_item_id FROM menu_item_options);
