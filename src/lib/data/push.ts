import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./cf";
import { anyAdminMiddleware } from "@/lib/auth/functions";
import { generateVapidKeys, sendWebPush, type VapidKeys } from "@/lib/push/webpush";

/** Roles that receive operational phone alerts. */
export const ORDER_PUSH_ROLES = ["owner", "manager", "staff", "kitchen"] as const;
export const ENQUIRY_PUSH_ROLES = ["owner", "manager", "staff", "kitchen"] as const;
export const RESERVATION_PUSH_ROLES = ["owner", "manager", "staff", "kitchen"] as const;
export const EVENT_PUSH_ROLES = ["owner", "manager"] as const;

const VAPID_SUBJECT = "https://culturesresort.co.zw";
const MAX_DEVICES_PER_ADMIN = 10;
const VAPID_SECRET_KEY = "vapid_keys";

type StoredVapid = { publicKey: string; privateJwk: JsonWebKey };

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
    row = await read();
  }
  return JSON.parse(row!.value) as VapidKeys;
}

type SubRow = { id: number; endpoint: string; p256dh: string; auth: string };
type PushPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
  requireInteraction?: boolean;
};

async function deliver(subs: SubRow[], payload: PushPayload) {
  if (!subs.length) return { sent: 0, failed: 0, removed: 0 };
  const db = getDb();
  const keys = await getVapidKeys();
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

async function broadcast(
  roles: readonly string[],
  payload: PushPayload,
  label: string,
): Promise<void> {
  try {
    const db = getDb();
    const placeholders = roles.map(() => "?").join(",");
    const { results } = await db
      .prepare(
        `SELECT ps.id, ps.endpoint, ps.p256dh, ps.auth
           FROM push_subscriptions ps
           JOIN admin_users au ON au.id = ps.admin_user_id
          WHERE ps.active = 1 AND au.role IN (${placeholders})`,
      )
      .bind(...roles)
      .all<SubRow>();
    await deliver(results, payload);
  } catch (err) {
    console.error(`push: ${label} broadcast failed`, err);
  }
}

function firstName(value: string): string {
  const first = value.trim().split(/\s+/)[0] ?? "";
  if (!first || first.length > 40 || /\d/.test(first)) return "";
  return first.replace(/[^\p{L}'’-]/gu, "");
}

function safeEnquiryExcerpt(message: string): string {
  const cleaned = message
    .replace(/(?:\+?\d[\d\s().-]{6,}\d)/g, "…")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "New enquiry — open to view details.";
  return cleaned.length > 80 ? `${cleaned.slice(0, 79).trimEnd()}…` : cleaned;
}

function dateLabel(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value.slice(0, 20);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

function withPerson(text: string, name: string): string {
  const first = firstName(name);
  return first ? `${text} — ${first}` : text;
}

export async function notifyAdminsOfNewOrder(
  orderId: number,
  totalCents: number,
  itemCount: number,
): Promise<void> {
  const amount = `$${(totalCents / 100).toFixed(2)}`;
  await broadcast(
    ORDER_PUSH_ROLES,
    {
      title: `New Order #${orderId}`,
      body: `${amount}, ${itemCount} ${itemCount === 1 ? "item" : "items"}`,
      url: "/admin/orders",
      tag: `order-${orderId}`,
      requireInteraction: true,
    },
    "new-order",
  );
}

export async function notifyAdminsOfEnquiry(
  enquiryId: number,
  name: string,
  message: string,
): Promise<void> {
  const person = firstName(name);
  const prefix = person ? `${person}: ` : "";
  await broadcast(
    ENQUIRY_PUSH_ROLES,
    {
      title: "New Enquiry",
      body: `${prefix}${safeEnquiryExcerpt(message)}`,
      url: "/admin/enquiries",
      tag: `enquiry-${enquiryId}`,
      requireInteraction: true,
    },
    "new-enquiry",
  );
}

export async function notifyAdminsOfBooking(
  bookingId: number,
  eventType: string,
  guestName: string,
  eventDate: string | null | undefined,
  guests: number | null | undefined,
): Promise<void> {
  const isReservation = eventType === "Table reservation";
  const date = dateLabel(eventDate);
  const base = isReservation
    ? `Table for ${guests ?? "?"}${date ? `, ${date}` : ""}`
    : `${eventType}${date ? `, ${date}` : ""}`;
  await broadcast(
    isReservation ? RESERVATION_PUSH_ROLES : EVENT_PUSH_ROLES,
    {
      title: isReservation ? "New Reservation" : "New Event Enquiry",
      body: withPerson(base, guestName),
      url: isReservation ? "/admin/reservations" : "/admin/events",
      tag: `booking-${bookingId}`,
    },
    isReservation ? "new-reservation" : "new-event-enquiry",
  );
}

/** Public VAPID key the browser needs to subscribe. Safe to expose. */
export const getPushPublicKey = createServerFn({ method: "GET" })
  .middleware([anyAdminMiddleware])
  .handler(async () => ({ publicKey: (await getVapidKeys()).publicKey }));

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
           platform = excluded.platform,
           active = 1,
           failure_count = 0,
           updated_at = datetime('now')`,
      )
      .bind(userId, endpoint, p256dh, auth, ua || null, platform)
      .run();
    return { ok: true as const, platform };
  });

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
