-- Bar price list (Beverages tab). These are the original Cultures bar prices from 0002_seed_menu.sql, put back as they
-- are not in the live menu. Prices are unchanged. Idempotent: an item is only added if it is not already there.
-- NOT applied automatically: confirm with the client first, then run this file once against the culturesresort D1.
-- ("Drinks" is left out because Soft Drink already covers it.) One statement per item: D1 limits compound SELECTs.
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'bar', 'Bar Price List', 'Local Lagers', '', 150, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'bar' AND name = 'Local Lagers');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'bar', 'Bar Price List', 'Imported Lagers', '', 300, 0, 2
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'bar' AND name = 'Imported Lagers');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'bar', 'Bar Price List', 'Castle Lite', '', 200, 0, 3
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'bar' AND name = 'Castle Lite');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'bar', 'Bar Price List', 'Mineral Water', '', 100, 0, 5
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'bar' AND name = 'Mineral Water');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'bar', 'Bar Price List', 'Mixers (Tonic, Ginger Ale, etc)', '', 200, 0, 6
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'bar' AND name = 'Mixers (Tonic, Ginger Ale, etc)');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'bar', 'Bar Price List', 'Ciders', '', 300, 0, 7
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'bar' AND name = 'Ciders');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'bar', 'Bar Price List', 'Spirits', '', 200, 0, 8
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'bar' AND name = 'Spirits');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'bar', 'Bar Price List', 'J Walker Red', '', 200, 0, 9
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'bar' AND name = 'J Walker Red');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'bar', 'Bar Price List', 'J Walker Black', '', 300, 0, 10
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'bar' AND name = 'J Walker Black');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'bar', 'Bar Price List', 'J Walker D/Black', '', 400, 0, 11
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'bar' AND name = 'J Walker D/Black');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'bar', 'Bar Price List', 'J Walker Gold', '', 1200, 0, 12
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'bar' AND name = 'J Walker Gold');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'bar', 'Bar Price List', 'Glenfiddich 12yrs', '', 400, 0, 13
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'bar' AND name = 'Glenfiddich 12yrs');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'bar', 'Bar Price List', 'Glenfiddich 15yrs', '', 700, 0, 14
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'bar' AND name = 'Glenfiddich 15yrs');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'bar', 'Bar Price List', 'Jack Daniels', '', 400, 0, 15
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'bar' AND name = 'Jack Daniels');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'bar', 'Bar Price List', 'Chivas Regal 12yrs', '', 400, 0, 16
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'bar' AND name = 'Chivas Regal 12yrs');
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'bar', 'Bar Price List', 'Famous Grouse', '', 300, 0, 17
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE category_slug = 'bar' AND name = 'Famous Grouse');
