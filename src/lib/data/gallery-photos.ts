import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { getDb, getGalleryBucket } from "./cf";
import { authMiddleware } from "@/lib/auth/functions";
import { gallery as bundledGallery } from "@/lib/gallery";

export type GalleryPhotoRow = {
  id: number;
  r2_key: string;
  alt: string;
  caption: string;
  category: string;
  sort_order: number;
  created_at: string;
  bundled_source: string | null;
  is_deleted: number;
};

/** Public data source. Bundled rows include tombstones so the public gallery can
 * permanently hide a launch photo after an admin deletes it. */
export const listGalleryPhotos = createServerFn({ method: "GET" }).handler(async () => {
  const db = getDb();
  const { results } = await db
    .prepare("SELECT * FROM gallery_photos ORDER BY sort_order, id DESC")
    .all<GalleryPhotoRow>();
  return results;
});

export const uploadGalleryPhoto = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected a file upload.");
    }
    const file = data.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw new Error("Choose an image file first.");
    }
    if (!file.type.startsWith("image/")) {
      throw new Error("That file doesn't look like an image.");
    }
    if (file.size > 8 * 1024 * 1024) {
      throw new Error("Images must be under 8MB.");
    }
    return {
      file,
      alt: String(data.get("alt") ?? ""),
      caption: String(data.get("caption") ?? ""),
      category: String(data.get("category") ?? "Details"),
    };
  })
  .handler(async ({ data }) => {
    const bucket = getGalleryBucket();
    const db = getDb();
    const ext = (data.file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const key = `gallery/${Date.now()}-${crypto.randomUUID()}.${ext || "jpg"}`;

    const bytes = await data.file.arrayBuffer();
    await bucket.put(key, bytes, { httpMetadata: { contentType: data.file.type } });

    const maxOrder = await db
      .prepare("SELECT COALESCE(MAX(sort_order), 0) as m FROM gallery_photos")
      .first<{ m: number }>();

    await db
      .prepare(
        "INSERT INTO gallery_photos (r2_key, alt, caption, category, sort_order, bundled_source, is_deleted) VALUES (?, ?, ?, ?, ?, NULL, 0)",
      )
      .bind(key, data.alt, data.caption, data.category, (maxOrder?.m ?? 0) + 1)
      .run();

    return { ok: true as const, key };
  });

export const updateGalleryPhoto = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: number; alt: string; caption: string; category: string }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    await db
      .prepare("UPDATE gallery_photos SET alt = ?, caption = ?, category = ? WHERE id = ? AND is_deleted = 0")
      .bind(data.alt, data.caption, data.category, data.id)
      .run();
    return { ok: true as const };
  });

export const deleteGalleryPhoto = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    const row = await db
      .prepare("SELECT r2_key, bundled_source FROM gallery_photos WHERE id = ? AND is_deleted = 0")
      .bind(data.id)
      .first<{ r2_key: string; bundled_source: string | null }>();
    if (row) {
      if (row.bundled_source) {
        // Keep a tombstone so the original bundled asset does not reappear.
        await db.prepare("UPDATE gallery_photos SET is_deleted = 1 WHERE id = ?").bind(data.id).run();
      } else {
        const bucket = getGalleryBucket();
        await bucket.delete(row.r2_key);
        await db.prepare("DELETE FROM gallery_photos WHERE id = ?").bind(data.id).run();
      }
    }
    return { ok: true as const };
  });

/**
 * One-time: copies the bundled launch photos into database + R2 so they become
 * ordinary admin-managed rows. `bundled_source` preserves the original asset
 * identity, which makes later edits and deletions persistent.
 */
export const importBundledGalleryPhotos = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async () => {
    const db = getDb();
    const bucket = getGalleryBucket();
    const origin = getRequestUrl().origin;

    const { results: existing } = await db
      .prepare("SELECT bundled_source, caption FROM gallery_photos")
      .all<{ bundled_source: string | null; caption: string }>();
    const existingSources = new Set(existing.map((r) => r.bundled_source).filter(Boolean) as string[]);
    const existingCaptions = new Set(existing.map((r) => r.caption));

    const maxOrder = await db
      .prepare("SELECT COALESCE(MAX(sort_order), 0) as m FROM gallery_photos")
      .first<{ m: number }>();
    let order = maxOrder?.m ?? 0;

    let imported = 0;
    let skipped = 0;
    const failed: string[] = [];

    for (const photo of bundledGallery) {
      if (existingSources.has(photo.caption) || existingCaptions.has(photo.caption)) {
        skipped++;
        continue;
      }
      try {
        const assetUrl = new URL(photo.src, origin).toString();
        const res = await fetch(assetUrl);
        if (!res.ok) {
          failed.push(photo.caption);
          continue;
        }
        const contentType = res.headers.get("content-type") ?? "image/jpeg";
        const ext = contentType.split("/")[1]?.replace(/[^a-z0-9]/gi, "") || "jpg";
        const key = `gallery/imported-${Date.now()}-${crypto.randomUUID()}.${ext}`;
        await bucket.put(key, await res.arrayBuffer(), { httpMetadata: { contentType } });

        order += 1;
        await db
          .prepare(
            "INSERT INTO gallery_photos (r2_key, alt, caption, category, sort_order, bundled_source, is_deleted) VALUES (?, ?, ?, ?, ?, ?, 0)",
          )
          .bind(key, photo.alt, photo.caption, photo.category, order, photo.caption)
          .run();
        imported++;
      } catch {
        failed.push(photo.caption);
      }
    }

    return { imported, skipped, failed };
  });
