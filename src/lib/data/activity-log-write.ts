import { getDb } from "./cf";
import type { AdminRole } from "@/lib/auth/admin-users";

/**
 * Records one sensitive admin action. Called from inside the server
 * functions that perform those actions (see auth/functions.ts,
 * settings.ts, site-events.ts, menu.ts, gallery-photos.ts) — never from
 * the client, so the record can't be forged or skipped by calling a
 * mutation without also calling this.
 *
 * Deliberately has zero imports from auth/functions.ts — that file needs
 * to call this too, and a two-way import there would be a circular
 * dependency that breaks at module-init time (a middleware referenced
 * before it's defined).
 *
 * Best-effort: an audit-log write failing must never roll back or block
 * the real action it's describing.
 */
export async function logAdminActivity(
  actor: { email: string; role: AdminRole },
  action: string,
  details?: string,
): Promise<void> {
  try {
    const db = getDb();
    await db
      .prepare(
        "INSERT INTO admin_activity_log (actor_email, actor_role, action, details) VALUES (?, ?, ?, ?)",
      )
      .bind(actor.email, actor.role, action, details ?? null)
      .run();
  } catch {
    // Never let audit logging break the action it's recording.
  }
}
