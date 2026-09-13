import { createServerFn } from "@tanstack/react-start";
import { getDb, getGalleryBucket, getAssetsBinding } from "./cf";
import { authMiddleware } from "@/lib/auth/functions";
import { gallery as bundledGallery } from "@/lib/gallery";
import { HOMEPAGE_IMAGE_SLOTS, type HomepageImages } from "./settings";

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

/** Reads which homepage slots (if any) currently point at this R2 key. */
async function findSlotUsage(db: ReturnType<typeof getDb>, r2Key: string): Promise<string[]> {
  const row = await db
    .prepare("SELECT value FROM site_settings WHERE key = 'homepage_images'")
    .first<{ value: string }>();
  if (!row) return [];
  let parsed: HomepageImages;
  try {
    parsed = JSON.parse(row.value) as HomepageImages;
  } catch {
    return [];
  }
  return HOMEPAGE_IMAGE_SLOTS.filter((slot) => parsed[slot.key] === r2Key).map((slot) => slot.label);
}

export const checkGalleryPhotoUsage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    const row = await db
      .prepare("SELECT r2_key FROM gallery_photos WHERE id = ?")
      .bind(data.id)
      .first<{ r2_key: string }>();
    if (!row) return { usedIn: [] as string[] };
    return { usedIn: await findSlotUsage(db, row.r2_key) };
  });

export const deleteGalleryPhoto = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: number; force?: boolean }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    const row = await db
      .prepare("SELECT r2_key, bundled_source FROM gallery_photos WHERE id = ? AND is_deleted = 0")
      .bind(data.id)
      .first<{ r2_key: string; bundled_source: string | null }>();
    if (!row) return { ok: true as const };

    const usedIn = await findSlotUsage(db, row.r2_key);
    if (usedIn.length > 0 && !data.force) {
      return { ok: false as const, usedIn };
    }

    if (usedIn.length > 0 && data.force) {
      // Clear the slot assignments so the site falls back to its bundled
      // default instead of pointing at a now-deleted R2 object.
      const settingsRow = await db
        .prepare("SELECT value FROM site_settings WHERE key = 'homepage_images'")
        .first<{ value: string }>();
      if (settingsRow) {
        const parsed = JSON.parse(settingsRow.value) as HomepageImages;
        for (const slot of HOMEPAGE_IMAGE_SLOTS) {
          if (parsed[slot.key] === row.r2_key) parsed[slot.key] = null;
        }
        await db
          .prepare("UPDATE site_settings SET value = ?, updated_at = datetime('now') WHERE key = 'homepage_images'")
          .bind(JSON.stringify(parsed))
          .run();
      }
    }

    if (row.bundled_source) {
      // Keep a tombstone so the original bundled asset does not reappear.
      await db.prepare("UPDATE gallery_photos SET is_deleted = 1 WHERE id = ?").bind(data.id).run();
    } else {
      const bucket = getGalleryBucket();
      await bucket.delete(row.r2_key);
      await db.prepare("DELETE FROM gallery_photos WHERE id = ?").bind(data.id).run();
    }
    return { ok: true as const };
  });

/** Replaces a photo's image file in place: same DB row/id (so captions,
 * category and any homepage-slot assignment survive), new R2 object. The
 * old R2 object is deleted unless it's the original bundled asset (kept so
 * a second replace-then-revert story never dangles). */
export const replaceGalleryPhoto = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected a file upload.");
    const file = data.get("file");
    const id = Number(data.get("id"));
    if (!(file instanceof File) || file.size === 0) throw new Error("Choose an image file first.");
    if (!file.type.startsWith("image/")) throw new Error("That file doesn't look like an image.");
    if (file.size > 8 * 1024 * 1024) throw new Error("Images must be under 8MB.");
    if (!Number.isFinite(id)) throw new Error("Missing photo id.");
    return { file, id };
  })
  .handler(async ({ data }) => {
    const db = getDb();
    const bucket = getGalleryBucket();
    const row = await db
      .prepare("SELECT r2_key, bundled_source FROM gallery_photos WHERE id = ? AND is_deleted = 0")
      .bind(data.id)
      .first<{ r2_key: string; bundled_source: string | null }>();
    if (!row) throw new Error("That photo no longer exists.");

    const ext = (data.file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const newKey = `gallery/${Date.now()}-${crypto.randomUUID()}.${ext || "jpg"}`;
    const bytes = await data.file.arrayBuffer();
    await bucket.put(newKey, bytes, { httpMetadata: { contentType: data.file.type } });

    await db
      .prepare("UPDATE gallery_photos SET r2_key = ?, bundled_source = NULL WHERE id = ?")
      .bind(newKey, data.id)
      .run();

    // Repoint any homepage slot that referenced the old key, so the
    // assignment survives the replace instead of silently breaking.
    const settingsRow = await db
      .prepare("SELECT value FROM site_settings WHERE key = 'homepage_images'")
      .first<{ value: string }>();
    if (settingsRow) {
      const parsed = JSON.parse(settingsRow.value) as HomepageImages;
      let changed = false;
      for (const slot of HOMEPAGE_IMAGE_SLOTS) {
        if (parsed[slot.key] === row.r2_key) {
          parsed[slot.key] = newKey;
          changed = true;
        }
      }
      if (changed) {
        await db
          .prepare("UPDATE site_settings SET value = ?, updated_at = datetime('now') WHERE key = 'homepage_images'")
          .bind(JSON.stringify(parsed))
          .run();
      }
    }

    // Only delete the old object once nothing references it any more and
    // it wasn't the shipped bundled asset (no R2 object to clean up there).
    if (!row.bundled_source) {
      await bucket.delete(row.r2_key);
    }

    return { ok: true as const, key: newKey };
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
    const assets = getAssetsBinding();

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
        // photo.src is a bundled asset path (e.g. "/assets/garden-abc123.jpg").
        // The hostname here is arbitrary — only the pathname is used to
        // match against the Worker's own bundled static assets.
        const assetUrl = new URL(photo.src, "https://assets.local").toString();
        const res = await assets.fetch(new Request(assetUrl));
        if (!res.ok) {
          failed.push(`${photo.caption} (HTTP ${res.status} reading ${photo.src})`);
          continue;
        }
        const contentType = res.headers.get("content-type") ?? "image/jpeg";
        if (!contentType.startsWith("image/")) {
          // Most common failure mode: the asset path didn't match anything
          // and the SPA fallback (index.html) was returned instead.
          failed.push(`${photo.caption} (got "${contentType}" instead of an image for ${photo.src})`);
          continue;
        }
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
      } catch (err) {
        failed.push(`${photo.caption} (${err instanceof Error ? err.message : "unknown error"})`);
      }
    }

    return { imported, skipped, failed };
  });
