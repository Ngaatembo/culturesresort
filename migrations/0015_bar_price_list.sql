-- Bar price list (Beverages tab). These are the original Cultures bar prices from 0002_seed_menu.sql, put back as they
-- are not in the live menu. Prices are unchanged. Idempotent: an item is only added if it is not already there.
-- NOT applied automatically: confirm with the client first, then run this file once against the culturesresort D1.
-- ("Drinks" is left out because Soft Drink already covers it.)
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order)
SELECT 'beverages', 'bar', 'Bar Price List', v.name, '', v.price_cents, 0, v.sort_order
FROM (
  SELECT 'Local Lagers' AS name, 150 AS price_cents, 1 AS sort_order UNION ALL
  SELECT 'Imported Lagers', 300, 2 UNION ALL
  SELECT 'Castle Lite', 200, 3 UNION ALL
  SELECT 'Mineral Water', 100, 5 UNION ALL
  SELECT 'Mixers (Tonic, Ginger Ale, etc)', 200, 6 UNION ALL
  SELECT 'Ciders', 300, 7 UNION ALL
  SELECT 'Spirits', 200, 8 UNION ALL
  SELECT 'J Walker Red', 200, 9 UNION ALL
  SELECT 'J Walker Black', 300, 10 UNION ALL
  SELECT 'J Walker D/Black', 400, 11 UNION ALL
  SELECT 'J Walker Gold', 1200, 12 UNION ALL
  SELECT 'Glenfiddich 12yrs', 400, 13 UNION ALL
  SELECT 'Glenfiddich 15yrs', 700, 14 UNION ALL
  SELECT 'Jack Daniels', 400, 15 UNION ALL
  SELECT 'Chivas Regal 12yrs', 400, 16 UNION ALL
  SELECT 'Famous Grouse', 300, 17
) AS v
WHERE NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_slug = 'bar' AND m.name = v.name);
