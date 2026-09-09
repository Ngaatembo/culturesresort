import { createServerFn } from "@tanstack/react-start";
import { getDb, getGalleryBucket } from "./cf";
import { authMiddleware } from "@/lib/auth/functions";

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
