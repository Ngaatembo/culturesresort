-- Wines as individual products (shown as a swipeable row on the Beverages tab). Client-confirmed price on 07/10/2026:
-- $6.00 per glass for every wine. Idempotent: a wine is only added if it is not already there.
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'Chamdor', 'Per glass', 600, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'Chamdor');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'J.C. Le Roux Domaine White', 'Per glass', 600, 0, 2
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'J.C. Le Roux Domaine White');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'J.C. Le Roux La Fleurette', 'Per glass', 600, 0, 3
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'J.C. Le Roux La Fleurette');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'Rooiberg Brut', 'Per glass', 600, 0, 4
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'Rooiberg Brut');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'KWV Sauvignon Blanc', 'Per glass', 600, 0, 5
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'KWV Sauvignon Blanc');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'KWV Merlot', 'Per glass', 600, 0, 6
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'KWV Merlot');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'Nederburg Pinotage', 'Per glass', 600, 0, 7
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'Nederburg Pinotage');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'Bon Courage Cabernet Sauvignon', 'Per glass', 600, 0, 8
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'Bon Courage Cabernet Sauvignon');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'Fat Bastard Cabernet Sauvignon', 'Per glass', 600, 0, 9
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'Fat Bastard Cabernet Sauvignon');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'wines', 'Wines', 'Four Cousins', 'Per glass', 600, 0, 10
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'wines' AND name = 'Four Cousins');
