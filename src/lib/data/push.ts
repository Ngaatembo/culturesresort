import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./cf";
import { anyAdminMiddleware } from "@/lib/auth/functions";
import { generateVapidKeys, sendWebPush, type VapidKeys } from "@/lib/push/webpush";

/**
 * Roles that receive new-order phone alerts. Every admin role can already
 * view orders (see ordersViewMiddleware), so the default is all of them.
 * To exclude a role, remove it here.
 */
export const ORDER_PUSH_ROLES = ["owner", "manager", "staff", "kitchen"] as const;

// Contact URL sent to push services in the VAPID JWT (required by the spec).
const VAPID_SUBJECT = "https://culturesresort.co.zw";
const MAX_DEVICES_PER_ADMIN = 10;
const VAPID_SECRET_KEY = "vapid_keys";

type StoredVapid = { publicKey: string; privateJwk: JsonWebKey };

/**
 * VAPID keys self-provision in app_secrets on first use — same convention as
 * the session secret (see auth/secret-store.ts): no manual Cloudflare secret
 * to configure, and it survives GitHub-integration redeploys. The private
 * key never leaves the server; only the public key is ever sent to browsers.
 */
async function getVapidKeys(): Promise<VapidKeys> {
  const db = getDb();
  const read = () =>
    db
      .prepare("SELECT value FROM app_secrets WHERE key = ?")
      .bind(VAPID_SECRET_KEY)
      .first<{ value: string }>();
  let row = await read();
  if (!row?.value) {
    const fresh = await generateVapidKeys();
    await db
      .prepare("INSERT OR IGNORE INTO app_secrets (key, value) VALUES (?, ?)")
      .bind(VAPID_SECRET_KEY, JSON.stringify(fresh satisfies StoredVapid))
      .run();
    row = await read(); // whichever request wrote first wins
  }
  return JSON.parse(row!.value) as VapidKeys;
}

type SubRow = { id: number; endpoint: string; p256dh: string; auth: string };

type PushPayload = { title: string; body: string; url: string; tag?: string };

async function deliver(subs: SubRow[], payload: PushPayload) {
  if (!subs.length) return { sent: 0, failed: 0, removed: 0 };
  const db = getDb();
  const keys = await getVapidKeys();
  // Independent sends: one broken subscription can't block anyone else.
  const results = await Promise.all(
    subs.map(async (s) => ({
      s,
      r: await sendWebPush(s, payload, keys, VAPID_SUBJECT),
    })),
  );
  let sent = 0;
  let failed = 0;
  let removed = 0;
  const writes = [];
  for (const { s, r } of results) {
    if (r.ok) {
      sent++;
      writes.push(
        db
          .prepare(
            "UPDATE push_subscriptions SET failure_count = 0, last_success_at = datetime('now'), updated_at = datetime('now') WHERE id = ?",
          )
          .bind(s.id),
      );
    } else if (r.gone) {
      removed++;
      writes.push(db.prepare("DELETE FROM push_subscriptions WHERE id = ?").bind(s.id));
    } else {
      failed++;
      // Transient failure: keep it, but disable after 10 consecutive failures.
      writes.push(
        db
          .prepare(
            "UPDATE push_subscriptions SET failure_count = failure_count + 1, active = CASE WHEN failure_count + 1 >= 10 THEN 0 ELSE active END, updated_at = datetime('now') WHERE id = ?",
          )
          .bind(s.id),
      );
    }
  }
  try {
    if (writes.length) await db.batch(writes);
  } catch (err) {
    console.error("push: could not record delivery results", err);
  }
  return { sent, failed, removed };
}

/**
 * Broadcasts a new-order alert to every active device of every eligible admin.
 * Never throws — call it after the order is safely saved; a push problem must
 * never affect the customer's order. Lock-screen text carries no customer data.
 */
export async function notifyAdminsOfNewOrder(orderId: number): Promise<void> {
  try {
    const db = getDb();
    const placeholders = ORDER_PUSH_ROLES.map(() => "?").join(",");
    const { results } = await db
      .prepare(
        `SELECT ps.id, ps.endpoint, ps.p256dh, ps.auth
           FROM push_subscriptions ps
           JOIN admin_users au ON au.id = ps.admin_user_id
          WHERE ps.active = 1 AND au.role IN (${placeholders})`,
      )
      .bind(...ORDER_PUSH_ROLES)
      .all<SubRow>();
    await deliver(results, {
      title: "New Cultures Resort Order",
      body: `Order #${orderId} has been received. Tap to view.`,
      url: "/admin/orders",
      tag: `order-${orderId}`,
    });
  } catch (err) {
    console.error("push: new-order broadcast failed", err);
  }
}

/** Public VAPID key the browser needs to subscribe. Safe to expose. */
export const getPushPublicKey = createServerFn({ method: "GET" })
  .middleware([anyAdminMiddleware])
  .handler(async () => ({ publicKey: (await getVapidKeys()).publicKey }));

/** How many of the signed-in admin's devices are registered, and whether a given endpoint is one. */
export const getMyPushStatus = createServerFn({ method: "POST" })
  .middleware([anyAdminMiddleware])
  .validator((data: { endpoint?: string | null }) => data)
  .handler(async ({ data, context }) => {
    const db = getDb();
    const userId = context.admin!.userId;
    const count = await db
      .prepare(
        "SELECT COUNT(*) AS n FROM push_subscriptions WHERE admin_user_id = ? AND active = 1",
      )
      .bind(userId)
      .first<{ n: number }>();
    let thisDevice = false;
    if (data.endpoint) {
      const row = await db
        .prepare(
          "SELECT id FROM push_subscriptions WHERE endpoint = ? AND admin_user_id = ? AND active = 1",
        )
        .bind(data.endpoint, userId)
        .first();
      thisDevice = !!row;
    }
    return { devices: count?.n ?? 0, thisDevice };
  });

type RegisterInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
};

/**
 * Registers the calling device against the *signed-in* admin only — the admin
 * id always comes from the verified session, never from the request body.
 * If the same browser endpoint was previously registered to someone else
 * (shared device), it moves to the current admin.
 */
export const registerPushSubscription = createServerFn({ method: "POST" })
  .middleware([anyAdminMiddleware])
  .validator((data: RegisterInput) => data)
  .handler(async ({ data, context }) => {
    const { endpoint, p256dh, auth } = data;
    let url: URL;
    try {
      url = new URL(endpoint);
    } catch {
      throw new Error("Invalid push subscription.");
    }
    if (
      url.protocol !== "https:" ||
      endpoint.length > 1000 ||
      typeof p256dh !== "string" ||
      typeof auth !== "string" ||
      p256dh.length < 20 ||
      p256dh.length > 200 ||
      auth.length < 10 ||
      auth.length > 100 ||
      !/^[A-Za-z0-9_-]+$/.test(p256dh) ||
      !/^[A-Za-z0-9_-]+$/.test(auth)
    ) {
      throw new Error("Invalid push subscription.");
    }
    const ua = (data.userAgent ?? "").slice(0, 300);
    const platform = /iPhone|iPad|iPod/i.test(ua)
      ? "iOS"
      : /Android/i.test(ua)
        ? "Android"
        : /Windows/i.test(ua)
          ? "Windows"
          : /Mac OS X|Macintosh/i.test(ua)
            ? "macOS"
            : /Linux/i.test(ua)
              ? "Linux"
              : "Other";

    const db = getDb();
    const userId = context.admin!.userId;
    const existing = await db
      .prepare("SELECT admin_user_id FROM push_subscriptions WHERE endpoint = ?")
      .bind(endpoint)
      .first<{ admin_user_id: number }>();
    if (!existing) {
      const n = await db
        .prepare("SELECT COUNT(*) AS c FROM push_subscriptions WHERE admin_user_id = ?")
        .bind(userId)
        .first<{ c: number }>();
      if ((n?.c ?? 0) >= MAX_DEVICES_PER_ADMIN) {
        throw new Error("This account already has the maximum number of notification devices.");
      }
    }
    await db
      .prepare(
        `INSERT INTO push_subscriptions (admin_user_id, endpoint, p256dh, auth, user_agent, platform)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(endpoint) DO UPDATE SET
           admin_user_id = excluded.admin_user_id,
           p256dh = excluded.p256dh,
           auth = excluded.auth,
           user_agent = excluded.user_agent,
           platform = excluded.platform,
           active = 1,
           failure_count = 0,
           updated_at = datetime('now')`,
      )
      .bind(userId, endpoint, p256dh, auth, ua || null, platform)
      .run();
    return { ok: true as const, platform };
  });

/** Removes a device registration — only ever one belonging to the signed-in admin. */
export const removePushSubscription = createServerFn({ method: "POST" })
  .middleware([anyAdminMiddleware])
  .validator((data: { endpoint: string }) => data)
  .handler(async ({ data, context }) => {
    await getDb()
      .prepare("DELETE FROM push_subscriptions WHERE endpoint = ? AND admin_user_id = ?")
      .bind(data.endpoint, context.admin!.userId)
      .run();
    return { ok: true as const };
  });

/** Sends a test notification to the signed-in admin's own registered devices only. */
export const sendTestPush = createServerFn({ method: "POST" })
  .middleware([anyAdminMiddleware])
  .handler(async ({ context }) => {
    const { results } = await getDb()
      .prepare(
        "SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE admin_user_id = ? AND active = 1",
      )
      .bind(context.admin!.userId)
      .all<SubRow>();
    if (!results.length) {
      throw new Error("No notification devices registered yet. Enable notifications first.");
    }
    const r = await deliver(results, {
      title: "Cultures Resort",
      body: "Cultures Resort notifications are working.",
      url: "/admin/orders",
      tag: "test",
    });
    if (r.sent === 0) {
      throw new Error(
        "The push service didn't accept the test. Try turning notifications off and on again on this device.",
      );
    }
    return r;
  });
