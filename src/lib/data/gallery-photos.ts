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
};

/** Public — the site's gallery page merges this with the bundled launch photos. */
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
      category: String(data.get("category") ?? "Détail"),
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
        "INSERT INTO gallery_photos (r2_key, alt, caption, category, sort_order) VALUES (?, ?, ?, ?, ?)",
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
      .prepare("UPDATE gallery_photos SET alt = ?, caption = ?, category = ? WHERE id = ?")
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
      .prepare("SELECT r2_key FROM gallery_photos WHERE id = ?")
      .bind(data.id)
      .first<{ r2_key: string }>();
    if (row) {
      const bucket = getGalleryBucket();
      await bucket.delete(row.r2_key);
      await db.prepare("DELETE FROM gallery_photos WHERE id = ?").bind(data.id).run();
    }
    return { ok: true as const };
  });

/**
 * One-time: copies the 20 launch photos (bundled with the site's code,
 * src/lib/gallery.ts) into the database + R2, so they become ordinary
 * rows — editable and deletable from the admin like anything uploaded
 * from now on, instead of a separate read-only "launch photos" set.
 * Safe to run more than once: skips any photo whose exact caption
 * already exists in the table.
 */
export const importBundledGalleryPhotos = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async () => {
    const db = getDb();
    const bucket = getGalleryBucket();
    const origin = getRequestUrl().origin;

    const { results: existing } = await db
      .prepare("SELECT caption FROM gallery_photos")
      .all<{ caption: string }>();
    const existingCaptions = new Set(existing.map((r) => r.caption));

    const maxOrder = await db
      .prepare("SELECT COALESCE(MAX(sort_order), 0) as m FROM gallery_photos")
      .first<{ m: number }>();
    let order = maxOrder?.m ?? 0;

    let imported = 0;
    let skipped = 0;
    const failed: string[] = [];

    for (const photo of bundledGallery) {
      if (existingCaptions.has(photo.caption)) {
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
            "INSERT INTO gallery_photos (r2_key, alt, caption, category, sort_order) VALUES (?, ?, ?, ?, ?)",
          )
          .bind(key, photo.alt, photo.caption, photo.category, order)
          .run();
        imported++;
      } catch {
        failed.push(photo.caption);
      }
    }

    return { imported, skipped, failed };
  });
