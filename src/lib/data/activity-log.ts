import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./cf";
import { managerUpMiddleware } from "@/lib/auth/functions";
import type { AdminRole } from "@/lib/auth/admin-users";

export { logAdminActivity } from "./activity-log-write";

export type AdminActivityLogRow = {
  id: number;
  actor_email: string;
  actor_role: AdminRole;
  action: string;
  details: string | null;
  created_at: string;
};

/** Owner + manager — the real who-did-what audit trail (see admin.activity.tsx). */
export const listAdminActivityLog = createServerFn({ method: "GET" })
  .middleware([managerUpMiddleware])
  .handler(async (): Promise<AdminActivityLogRow[]> => {
    const db = getDb();
    const { results } = await db
      .prepare("SELECT * FROM admin_activity_log ORDER BY created_at DESC LIMIT 200")
      .all<AdminActivityLogRow>();
    return results;
  });
