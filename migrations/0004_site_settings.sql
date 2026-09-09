-- Business-editable content that used to live only in src/lib/site-data.ts
-- (opening hours, visit details, contact/social links, event enquiry
-- options). One JSON blob per logical group, keyed by name, so the admin
-- can edit any of it without a schema change per field.
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL, -- JSON-encoded
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed with the exact values already live on the site today, so turning
-- this on changes nothing visually — it only makes these fields editable.
INSERT OR IGNORE INTO site_settings (key, value) VALUES
('business', '{"name":"Cultures Resort","addressLine":"Corner Chiremba Road & Southey Road, Hillside, Harare, Zimbabwe","addressShort":"Cnr Chiremba & Southey Rd, Hillside, Harare","phoneDisplay":"+263 77 295 1308","phoneHref":"tel:+263772951308","whatsappNumber":"263772951308","whatsappHref":"https://wa.me/263772951308","email":"culturesresort@gmail.com","emailAlt":"culturesresortzimbabwe@gmail.com","mapsHref":"https://www.google.com/maps/search/?api=1&query=-17.8362078%2C31.0696115","mapsEmbedHref":"https://www.google.com/maps?q=-17.8362078,31.0696115&output=embed","tripadvisorHref":"https://www.tripadvisor.com/Restaurant_Review-g293760-d26802869-Reviews-Cultures_Resort-Harare_Harare_Province.html"}'),
('social_links', '{"facebook":"https://www.facebook.com/100057503797633","instagram":"https://www.instagram.com/culturesresort/"}'),
('opening_hours', '[{"day":"Monday","hours":"Open 24 hours"},{"day":"Tuesday","hours":"Open 24 hours"},{"day":"Wednesday","hours":"Open 24 hours"},{"day":"Thursday","hours":"Open 24 hours"},{"day":"Friday","hours":"Open 24 hours"},{"day":"Saturday","hours":"Open 24 hours"},{"day":"Sunday","hours":"Open 24 hours"}]'),
('visit_details', '[{"label":"Largest group seated","value":"To be confirmed"},{"label":"Parking","value":"To be confirmed"},{"label":"Children","value":"Yes — there''s a kids'' play area on the grounds"},{"label":"Alcohol license","value":"Fully licensed restaurant"},{"label":"Vegetarian options","value":"To be confirmed"},{"label":"Card payments","value":"To be confirmed"},{"label":"Advance notice for groups","value":"To be confirmed"}]'),
('event_types', '["Birthday or celebration","Family gathering","Friends'' outing","Business lunch or team function","Cultural event","Something else"]'),
('event_requirements', '["Reserved seating area","Set menu for the group","Cake or own décor","Music or performance","Children in the party","Accessibility needs"]');
