import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./cf";
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
