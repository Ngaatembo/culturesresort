-- Client-confirmed operating hours: 10am to 10pm, daily. Replaces the
-- placeholder "Open 24 hours" seeded before real hours were confirmed.
UPDATE site_settings
SET value = '[{"day":"Monday","hours":"10:00 AM – 10:00 PM"},{"day":"Tuesday","hours":"10:00 AM – 10:00 PM"},{"day":"Wednesday","hours":"10:00 AM – 10:00 PM"},{"day":"Thursday","hours":"10:00 AM – 10:00 PM"},{"day":"Friday","hours":"10:00 AM – 10:00 PM"},{"day":"Saturday","hours":"10:00 AM – 10:00 PM"},{"day":"Sunday","hours":"10:00 AM – 10:00 PM"}]'
WHERE key = 'opening_hours';
