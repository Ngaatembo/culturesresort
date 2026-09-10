-- Separates "business owner" (full functional access to the admin panel)
-- from "developer" (sees raw technical/system info too). A client can be
-- role='owner' without being a developer; is_developer is never exposed
-- in the Staff & Users UI and is only ever set directly in the database.
ALTER TABLE admin_users ADD COLUMN is_developer INTEGER NOT NULL DEFAULT 0;
