-- Real menu data, transcribed from the client's own printed menu board
-- (Cultures Resort, Hillside, Harare) and matched to existing dish photos
-- in src/assets/dishes where available. Items with no confirmed price on
-- the board are seeded at 0 cents, which the menu displays as "On request"
-- until the owner sets a real price from the admin panel.

-- Starters
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order) VALUES
('food','starters','Starters','Piri Piri Gizzards','',300,0,1),
('food','starters','Starters','Fried Liver (Chiropa)','Ox liver',300,0,2),
('food','starters','Starters','Mopani Worms (Madora)','',300,0,3),
('food','starters','Starters','Fried Kapenta (Omena)','',0,0,4);

-- Main Course
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order) VALUES
('food','main-meals','Main Course','Kuku Choma','Charcoal grilled full chicken',800,1,1),
('food','main-meals','Main Course','Kuku Karanga','Chicken pieces prepared the East African way',1300,0,2),
('food','main-meals','Main Course','Beef Chop ala Masai','Tasty & tender',1200,0,3),
('food','main-meals','Main Course','Mbuzi Ulaya (Charcoal Grilled Pork Chops)','',1200,0,4),
('food','main-meals','Main Course','Road Runner Chicken (Kuku Kienyeji)','',1000,0,5),
('food','main-meals','Main Course','Goat Ribs (Mbavu za Mbuzi)','',1000,0,6),
('food','main-meals','Main Course','Mguu wa Mbuzi','Whole goat leg, grilled on charcoal',1400,1,7),
('food','main-meals','Main Course','Pork Trotters / Bones','',800,0,8);

-- Off the charcoal / grills
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order) VALUES
('food','grills','Off the Charcoal','Borewores','Delicately grilled over charcoal',900,0,1),
('food','grills','Off the Charcoal','Samaki (Hove/Tsomba/Bream)','Bream fish',1300,0,2),
('food','grills','Off the Charcoal','Hanga','Guinea fowl, stewed',1000,0,3),
('food','grills','Off the Charcoal','Tsuro (Rabbit)','Grilled, stewed or with dovi',1000,0,4),
('food','grills','Off the Charcoal','Zvinyenze','Kapoto',800,0,5),
('food','grills','Off the Charcoal','Mbuzi Kapoto','',800,0,6),
('food','grills','Off the Charcoal','Beef (Highfield)','',1300,0,7),
('food','grills','Off the Charcoal','Huge Pork Ribs','Charcoal grilled',0,0,8),
('food','grills','Off the Charcoal','Bata Choma','Charcoal grilled duck',0,0,9),
('food','grills','Off the Charcoal','Haifiridzi','Tender beef stew, fried with vegetables',0,0,10),
('food','grills','Off the Charcoal','Braaied Beef Short Ribs','',0,0,11),
('food','grills','Off the Charcoal','Maasai Meat Platter','',0,0,12);

-- Accompaniments
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order) VALUES
('food','sides','Accompaniments','Sadza Rezviyo / Remhunga','',300,0,1),
('food','sides','Accompaniments','Mpunga Une Dovi','Rice with peanut butter sauce',200,0,2),
('food','sides','Accompaniments','Sadza / Ugali (Isitshwala)','',100,0,3),
('food','sides','Accompaniments','Plain Rice (Wali)','',100,0,4),
('food','sides','Accompaniments','Chapati','',100,0,5),
('food','sides','Accompaniments','Fried Potatoes','',300,0,6),
('food','sides','Accompaniments','Chips','',300,0,7),
('food','sides','Accompaniments','Muriwo Une Dovi','',200,0,8),
('food','sides','Accompaniments','Pilau / Jollof Rice','',200,0,9);

-- Desserts
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order) VALUES
('food','desserts','Desserts','Homemade Cake Slice','',300,0,1),
('food','desserts','Desserts','Wild Dried Fruits','',300,0,2),
('food','desserts','Desserts','Best Zimbabwean Tea / Coffee','',200,0,3);

-- Cocktails (no confirmed pricing on the printed board yet)
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order) VALUES
('beverages','cocktails','Cocktails','Caribbean','',0,1,1),
('beverages','cocktails','Cocktails','Dark Margharitta','',0,0,2),
('beverages','cocktails','Cocktails','Sunrise Mocktail','',0,0,3),
('beverages','cocktails','Cocktails','Sex on the Beach','',0,0,4),
('beverages','cocktails','Cocktails','Malawian Shandy','',0,0,5),
('beverages','cocktails','Cocktails','Long Island','',0,0,6),
('beverages','cocktails','Cocktails','Tequila/Gin Sunrise','',0,0,7),
('beverages','cocktails','Cocktails','Blue Lagoon','',0,0,8);

-- Bar price list
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order) VALUES
('beverages','bar','Bar Price List','Local Lagers','',150,0,1),
('beverages','bar','Bar Price List','Imported Lagers','',300,0,2),
('beverages','bar','Bar Price List','Castle Lite','',200,0,3),
('beverages','bar','Bar Price List','Drinks','',100,0,4),
('beverages','bar','Bar Price List','Mineral Water','',100,0,5),
('beverages','bar','Bar Price List','Mixers (Tonic, Ginger Ale, etc)','',200,0,6),
('beverages','bar','Bar Price List','Ciders','',300,0,7),
('beverages','bar','Bar Price List','Spirits','',200,0,8),
('beverages','bar','Bar Price List','J Walker Red','',200,0,9),
('beverages','bar','Bar Price List','J Walker Black','',300,0,10),
('beverages','bar','Bar Price List','J Walker D/Black','',400,0,11),
('beverages','bar','Bar Price List','J Walker Gold','',1200,0,12),
('beverages','bar','Bar Price List','Glenfiddich 12yrs','',400,0,13),
('beverages','bar','Bar Price List','Glenfiddich 15yrs','',700,0,14),
('beverages','bar','Bar Price List','Jack Daniels','',400,0,15),
('beverages','bar','Bar Price List','Chivas Regal 12yrs','',400,0,16),
('beverages','bar','Bar Price List','Famous Grouse','',300,0,17);

-- Wines
INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, sort_order) VALUES
('beverages','wines','Wines','Local','',2000,0,1),
('beverages','wines','Wines','Imported (Selected)','',2500,0,2),
('beverages','wines','Wines','Import Deluxe','',3000,0,3),
('beverages','wines','Wines','Sparkling (Local)','',1500,0,4),
('beverages','wines','Wines','Sparkling (Imported)','',2500,0,5);
