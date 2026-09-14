-- Audit trail for sensitive owner-level admin actions (staff account
-- created/removed, role changed, business settings changed, content
-- deleted). Separate from the customer-facing "activity" feed on
-- /admin/activity, which is really just recent orders/bookings/enquiries —
-- this table is specifically about who-did-what inside the admin panel.
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_email TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log (created_at);
