import { createServerFn } from "@tanstack/react-start";
import { getDb, getGalleryBucket } from "./cf";
import { authMiddleware } from "@/lib/auth/functions";

export type SiteEventStatus = "upcoming" | "active" | "past" | "cancelled";

export type SiteEventRow = {
  id: number;
  title: string;
  description: string;
  image_key: string | null;
  event_date: string | null;
  status: SiteEventStatus;
  featured: number;
  sort_order: number;
  created_at: string;
};

/** Public — shown on the /events page. Only upcoming/active, newest-relevant first. */
export const listPublicEvents = createServerFn({ method: "GET" }).handler(async () => {
  const db = getDb();
  const { results } = await db
    .prepare(
      "SELECT * FROM site_events WHERE status IN ('upcoming','active') ORDER BY featured DESC, sort_order, id DESC",
    )
    .all<SiteEventRow>();
  return results;
});

/** Admin — every event regardless of status. */
export const listSiteEventsAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const db = getDb();
    const { results } = await db
      .prepare("SELECT * FROM site_events ORDER BY sort_order, id DESC")
      .all<SiteEventRow>();
    return results;
  });

async function storeImage(file: File): Promise<string> {
  const bucket = getGalleryBucket();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = `events/${Date.now()}-${crypto.randomUUID()}.${ext || "jpg"}`;
  const bytes = await file.arrayBuffer();
  await bucket.put(key, bytes, { httpMetadata: { contentType: file.type } });
  return key;
}

export const createSiteEvent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected form data.");
    }
    const title = String(data.get("title") ?? "").trim();
    if (!title) {
      throw new Error("Give it a title.");
    }
    const file = data.get("file");
    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        throw new Error("That file doesn't look like an image.");
      }
      if (file.size > 8 * 1024 * 1024) {
        throw new Error("Images must be under 8MB.");
      }
    }
    return {
      title,
      description: String(data.get("description") ?? ""),
      event_date: String(data.get("event_date") ?? "") || null,
      status: String(data.get("status") ?? "upcoming") as SiteEventStatus,
      featured: data.get("featured") === "true",
      file: file instanceof File && file.size > 0 ? file : null,
    };
  })
  .handler(async ({ data }) => {
    const db = getDb();
    const image_key = data.file ? await storeImage(data.file) : null;
    const maxOrder = await db
      .prepare("SELECT COALESCE(MAX(sort_order), 0) as m FROM site_events")
      .first<{ m: number }>();
    await db
      .prepare(
        "INSERT INTO site_events (title, description, image_key, event_date, status, featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        data.title,
        data.description,
        image_key,
        data.event_date,
        data.status,
        data.featured ? 1 : 0,
        (maxOrder?.m ?? 0) + 1,
      )
      .run();
    return { ok: true as const };
  });

export const updateSiteEvent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected form data.");
    }
    const id = Number(data.get("id"));
    if (!Number.isFinite(id)) {
      throw new Error("Missing event id.");
    }
    const title = String(data.get("title") ?? "").trim();
    if (!title) {
      throw new Error("Give it a title.");
    }
    const file = data.get("file");
    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        throw new Error("That file doesn't look like an image.");
      }
      if (file.size > 8 * 1024 * 1024) {
        throw new Error("Images must be under 8MB.");
      }
    }
    return {
      id,
      title,
      description: String(data.get("description") ?? ""),
      event_date: String(data.get("event_date") ?? "") || null,
      status: String(data.get("status") ?? "upcoming") as SiteEventStatus,
      featured: data.get("featured") === "true",
      file: file instanceof File && file.size > 0 ? file : null,
    };
  })
  .handler(async ({ data }) => {
    const db = getDb();
    if (data.file) {
      const image_key = await storeImage(data.file);
      await db
        .prepare(
          "UPDATE site_events SET title = ?, description = ?, event_date = ?, status = ?, featured = ?, image_key = ?, updated_at = datetime('now') WHERE id = ?",
        )
        .bind(
          data.title,
          data.description,
          data.event_date,
          data.status,
          data.featured ? 1 : 0,
          image_key,
          data.id,
        )
        .run();
    } else {
      await db
        .prepare(
          "UPDATE site_events SET title = ?, description = ?, event_date = ?, status = ?, featured = ?, updated_at = datetime('now') WHERE id = ?",
        )
        .bind(
          data.title,
          data.description,
          data.event_date,
          data.status,
          data.featured ? 1 : 0,
          data.id,
        )
        .run();
    }
    return { ok: true as const };
  });

export const deleteSiteEvent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    const row = await db
      .prepare("SELECT image_key FROM site_events WHERE id = ?")
      .bind(data.id)
      .first<{ image_key: string | null }>();
    if (row?.image_key) {
      const bucket = getGalleryBucket();
      await bucket.delete(row.image_key);
    }
    await db.prepare("DELETE FROM site_events WHERE id = ?").bind(data.id).run();
    return { ok: true as const };
  });
