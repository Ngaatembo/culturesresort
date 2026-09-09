-- Roles for admin accounts. The very first account (created via
-- /admin/setup) is always 'owner'; existing rows default to 'owner' too,
-- since until now there was only ever the one account.
ALTER TABLE admin_users ADD COLUMN role TEXT NOT NULL DEFAULT 'owner';
