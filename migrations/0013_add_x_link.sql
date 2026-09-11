-- Add the confirmed X (Twitter) handle to the stored social_links setting.
UPDATE site_settings
SET value = '{"facebook":"https://www.facebook.com/100057503797633","instagram":"https://www.instagram.com/culturesresort/","tiktok":"https://www.tiktok.com/@culturesresort_hillside2","x":"https://x.com/choma_nyama"}'
WHERE key = 'social_links';
