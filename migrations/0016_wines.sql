-- Wines as individual products (shown as a swipeable row on the Beverages tab). No wine prices have been supplied yet,
-- so they are stored with price 0, which the site shows as "On request". Update each price in Admin > Beverages once
-- the client confirms it. Idempotent: a wine is only added if it is not already there.
-- NOT applied automatically: run once against the culturesresort D1 when ready.
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'Chamdor', '', 0, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'Chamdor');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'J.C. Le Roux Domaine White', '', 0, 0, 2
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'J.C. Le Roux Domaine White');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'J.C. Le Roux La Fleurette', '', 0, 0, 3
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'J.C. Le Roux La Fleurette');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'Rooiberg Brut', '', 0, 0, 4
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'Rooiberg Brut');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'KWV Sauvignon Blanc', '', 0, 0, 5
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'KWV Sauvignon Blanc');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'KWV Merlot', '', 0, 0, 6
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'KWV Merlot');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'Nederburg Pinotage', '', 0, 0, 7
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'Nederburg Pinotage');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'Bon Courage Cabernet Sauvignon', '', 0, 0, 8
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'Bon Courage Cabernet Sauvignon');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'Fat Bastard Cabernet Sauvignon', '', 0, 0, 9
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'Fat Bastard Cabernet Sauvignon');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'Four Cousins', '', 0, 0, 10
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'Four Cousins');
