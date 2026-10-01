-- Public "practical details" now list only facts confirmed by Cultures Resort.
-- Removed pending client verification: vegetarian options, takeout & delivery,
-- wheelchair accessibility, "fully licensed restaurant & bar".
-- NOTE: overwrites any edits made in /admin/visit-details — review before applying.
UPDATE site_settings
SET value = '[{"label":"Parking","value":"Guarded on-site parking available"},{"label":"Families & children","value":"Kids'' play area available"},{"label":"Groups & celebrations","value":"Group bookings and celebrations welcome — hosts up to 200 guests"},{"label":"Payments","value":"Cash, Ecocash, bank transfer, and card payments (Visa) accepted"},{"label":"Group reservations","value":"Advance booking recommended for larger groups"}]'
WHERE key = 'visit_details';
