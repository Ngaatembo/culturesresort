import { createServerFn } from "@tanstack/react-start";
import { getDb, getGalleryBucket } from "./cf";
import { authMiddleware } from "@/lib/auth/functions";

export type MenuKind = "food" | "beverages";

export type MenuItemRow = {
  id: number;
  kind: MenuKind;
  category_slug: string;
  category_title: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string | null;
  featured: number;
  available: number;
  sort_order: number;
};

export type MenuItemOut = {
  id: number;
  name: string;
  description: string;
  price: string;
  priceCents: number;
  imageUrl: string | null;
  featured: boolean;
  available: boolean;
};

export type MenuCategoryOut = {
  slug: string;
  title: string;
  items: MenuItemOut[];
};

function formatPrice(cents: number) {
  return cents > 0 ? `$${(cents / 100).toFixed(2)}` : "On request";
}

/** All available menu items, grouped by kind (food/beverages) then category. */
export const getMenu = createServerFn({ method: "GET" }).handler(async () => {
  const db = getDb();
  const { results } = await db
    .prepare(
      "SELECT * FROM menu_items WHERE available = 1 ORDER BY kind, category_slug, sort_order, id",
    )
    .all<MenuItemRow>();

  const byKind: Record<MenuKind, MenuCategoryOut[]> = { food: [], beverages: [] };

  for (const row of results) {
    const bucket = byKind[row.kind];
    let category = bucket.find((c) => c.slug === row.category_slug);
    if (!category) {
      category = { slug: row.category_slug, title: row.category_title, items: [] };
      bucket.push(category);
    }
    category.items.push({
      id: row.id,
      name: row.name,
      description: row.description,
      price: formatPrice(row.price_cents),
      priceCents: row.price_cents,
      imageUrl: row.image_url,
      featured: !!row.featured,
      available: !!row.available,
    });
  }

  return byKind;
});

/** Full row list for the admin menu editor — includes unavailable items. */
export const getMenuAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const db = getDb();
    const { results } = await db
      .prepare("SELECT * FROM menu_items ORDER BY kind, category_slug, sort_order, id")
      .all<MenuItemRow>();
    return results;
  });

export const setMenuItemAvailability = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: number; available: boolean }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    await db
      .prepare("UPDATE menu_items SET available = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(data.available ? 1 : 0, data.id)
      .run();
    return { ok: true };
  });

/** Sets a real price (in whole currency units, e.g. 4.5 for $4.50). Pass 0 to mark it "On request". */
export const setMenuItemPrice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: number; price: number }) => data)
  .handler(async ({ data }) => {
    if (!Number.isFinite(data.price) || data.price < 0) {
      throw new Error("Enter a valid price.");
    }
    const db = getDb();
    const priceCents = Math.round(data.price * 100);
    await db
      .prepare("UPDATE menu_items SET price_cents = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(priceCents, data.id)
      .run();
    return { ok: true, priceCents };
  });

/**
 * Uploads a photo for one menu item, replacing whatever image it had
 * before (old R2 object is deleted so the bucket doesn't accumulate
 * orphaned files). Stored in the same bucket as the gallery, under a
 * separate `menu/` prefix, and served by the same /gallery-image/$ route.
 */
export const setMenuItemImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected a file upload.");
    }
    const file = data.get("file");
    const id = Number(data.get("id"));
    if (!Number.isFinite(id)) {
      throw new Error("Missing menu item id.");
    }
    if (!(file instanceof File) || file.size === 0) {
      throw new Error("Choose an image file first.");
    }
    if (!file.type.startsWith("image/")) {
      throw new Error("That file doesn't look like an image.");
    }
    if (file.size > 8 * 1024 * 1024) {
      throw new Error("Images must be under 8MB.");
    }
    return { id, file };
  })
  .handler(async ({ data }) => {
    const db = getDb();
    const bucket = getGalleryBucket();

    const existing = await db
      .prepare("SELECT image_url FROM menu_items WHERE id = ?")
      .bind(data.id)
      .first<{ image_url: string | null }>();

    const ext = (data.file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const key = `menu/${data.id}-${Date.now()}-${crypto.randomUUID()}.${ext || "jpg"}`;

    const bytes = await data.file.arrayBuffer();
    await bucket.put(key, bytes, { httpMetadata: { contentType: data.file.type } });

    await db
      .prepare("UPDATE menu_items SET image_url = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(key, data.id)
      .run();

    if (existing?.image_url) {
      await bucket.delete(existing.image_url).catch(() => {});
    }

    return { ok: true as const, imageUrl: key };
  });

/** Removes a menu item's uploaded photo — it falls back to the default stock photo. */
export const clearMenuItemImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    const existing = await db
      .prepare("SELECT image_url FROM menu_items WHERE id = ?")
      .bind(data.id)
      .first<{ image_url: string | null }>();

    if (existing?.image_url) {
      const bucket = getGalleryBucket();
      await bucket.delete(existing.image_url).catch(() => {});
    }

    await db
      .prepare("UPDATE menu_items SET image_url = NULL, updated_at = datetime('now') WHERE id = ?")
      .bind(data.id)
      .run();

    return { ok: true as const };
  });
