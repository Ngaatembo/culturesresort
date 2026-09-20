import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { getDb, getGalleryBucket } from "./cf";
import { managerUpMiddleware, staffUpMiddleware } from "@/lib/auth/functions";
import { logAdminActivity } from "./activity-log-write";

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
  video_url: string | null;
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
  options: MenuItemOptionOut[];
  videoUrl: string | null;
  featured: boolean;
  available: boolean;
};

export type MenuItemOptionRow = { id: number; menu_item_id: number; label: string; price_cents: number; sort_order: number };

export type MenuItemOptionOut = {
  id: number;
  label: string;
  price: string;
  priceCents: number;
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
  setResponseHeader("Cache-Control", "no-store");
  const db = getDb();
  const { results } = await db
    .prepare(
      "SELECT * FROM menu_items WHERE available = 1 ORDER BY kind, category_slug, sort_order, id",
    )
    .all<MenuItemRow>();

  let optionResults: { results: { id: number; menu_item_id: number; label: string; price_cents: number }[] } = { results: [] };
  try {
    optionResults = await db
      .prepare(
        "SELECT id, menu_item_id, label, price_cents FROM menu_item_options ORDER BY menu_item_id, sort_order, id",
      )
      .all<{ id: number; menu_item_id: number; label: string; price_cents: number }>();
  } catch {
    // The options table is introduced by migration 0003. Keep the existing
    // single-price menu working during a rolling deployment until it lands.
  }
  const optionsByItem = new Map<number, MenuItemOptionOut[]>();
  for (const option of optionResults.results) {
    const list = optionsByItem.get(option.menu_item_id) ?? [];
    list.push({
      id: option.id,
      label: option.label,
      price: formatPrice(option.price_cents),
      priceCents: option.price_cents,
    });
    optionsByItem.set(option.menu_item_id, list);
  }

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
      options: optionsByItem.get(row.id) ?? [],
      videoUrl: row.video_url,
      featured: !!row.featured,
      available: !!row.available,
    });
  }

  return byKind;
});

async function ensureMenuOptionsTable(db: ReturnType<typeof getDb>) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS menu_item_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_menu_item_options_item ON menu_item_options(menu_item_id)").run();
}

export const getMenuOptionsAdmin = createServerFn({ method: "GET" })
  .middleware([staffUpMiddleware])
  .handler(async () => {
    setResponseHeader("Cache-Control", "private, no-store");
    const db = getDb();
    await ensureMenuOptionsTable(db);
    const { results } = await db.prepare(
      "SELECT id, menu_item_id, label, price_cents, sort_order FROM menu_item_options ORDER BY menu_item_id, sort_order, id",
    ).all<MenuItemOptionRow>();
    return results;
  });

export const createMenuItemOption = createServerFn({ method: "POST" })
  .middleware([managerUpMiddleware])
  .validator((data: { menu_item_id: number; label: string; price: number }) => data)
  .handler(async ({ data }) => {
    const label = data.label.trim();
    if (!label || !Number.isFinite(data.price) || data.price < 0) throw new Error("Enter a portion label and valid price.");
    const db = getDb();
    await ensureMenuOptionsTable(db);
    const max = await db.prepare("SELECT COALESCE(MAX(sort_order),0) m FROM menu_item_options WHERE menu_item_id = ?").bind(data.menu_item_id).first<{m:number}>();
    const result = await db.prepare("INSERT INTO menu_item_options (menu_item_id,label,price_cents,sort_order) VALUES (?,?,?,?)")
      .bind(data.menu_item_id,label,Math.round(data.price*100),(max?.m ?? 0)+1).run();
    return { id: Number(result.meta.last_row_id), label, priceCents: Math.round(data.price*100) };
  });

export const updateMenuItemOption = createServerFn({ method: "POST" })
  .middleware([managerUpMiddleware])
  .validator((data: { id: number; label: string; price: number }) => data)
  .handler(async ({ data }) => {
    const label = data.label.trim();
    if (!label || !Number.isFinite(data.price) || data.price < 0) throw new Error("Enter a portion label and valid price.");
    const db = getDb();
    await ensureMenuOptionsTable(db);
    await db.prepare("UPDATE menu_item_options SET label=?, price_cents=? WHERE id=?")
      .bind(label,Math.round(data.price*100),data.id).run();
    return { ok: true as const };
  });

export const deleteMenuItemOption = createServerFn({ method: "POST" })
  .middleware([managerUpMiddleware])
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    await ensureMenuOptionsTable(db);
    await db.prepare("DELETE FROM menu_item_options WHERE id=?").bind(data.id).run();
    return { ok: true as const };
  });

export const syncClientMenu = createServerFn({ method: "POST" })
  .middleware([managerUpMiddleware])
  .handler(async () => {
    const db = getDb();
    await ensureMenuOptionsTable(db);
    const statements = [
      ["UPDATE menu_items SET category_title='Starters',updated_at=datetime('now') WHERE category_slug='starters' AND kind='food'"],
      ["UPDATE menu_items SET category_title='Main Meals',updated_at=datetime('now') WHERE category_slug='main-meals' AND kind='food'"],
      ["UPDATE menu_items SET category_title='Grills',updated_at=datetime('now') WHERE category_slug='grills' AND kind='food'"],
      ["UPDATE menu_items SET category_title='Sides',updated_at=datetime('now') WHERE category_slug='sides' AND kind='food'"],
      ["UPDATE menu_items SET category_title='Desserts',updated_at=datetime('now') WHERE category_slug='desserts' AND kind='food'"],
      ["UPDATE menu_items SET price_cents=400,updated_at=datetime('now') WHERE name IN ('Piri Piri Gizzards','Fried Liver (Chiropa)','Mopani Worms (Madora)','Fried Kapenta (Omena)')"],
      ["UPDATE menu_items SET category_slug='main-meals',category_title='Main Meals',price_cents=1300,updated_at=datetime('now') WHERE name='Kuku Karanga'"],
      ["UPDATE menu_items SET category_slug='grills',category_title='Grills',price_cents=1200,updated_at=datetime('now') WHERE name='Beef Chop ala Masai'"],
      ["UPDATE menu_items SET name='Mbuzi Ulaya / Charcoal Grilled',price_cents=1200,description='Charcoal grilled',updated_at=datetime('now') WHERE name='Mbuzi Ulaya (Charcoal Grilled Pork Chops)'"],
      ["UPDATE menu_items SET category_slug='grills',category_title='Grills',price_cents=1600,description='Full goat leg grilled on charcoal',updated_at=datetime('now') WHERE name='Mguu wa Mbuzi'"],
      ["UPDATE menu_items SET available=0,updated_at=datetime('now') WHERE name IN ('Mguu wambuzi (grilled goat leg)','Mguu wambudzi (grilled goat leg)','Mguu wambudzi (grilled goat leg)')"],
      ["UPDATE menu_items SET price_cents=1200,description='Spicy & delicious',updated_at=datetime('now') WHERE name='Borewores'"],
      ["UPDATE menu_items SET price_cents=1200,description='Grilled, stewed or with dovi',updated_at=datetime('now') WHERE name='Tsuro (Rabbit)'"],
      ["UPDATE menu_items SET price_cents=1500,description='Charcoal grilled duck',updated_at=datetime('now') WHERE name='Bata Choma'"],
      ["UPDATE menu_items SET price_cents=1300,description='Tender beef stew fried with vegetables',updated_at=datetime('now') WHERE name='Haifiridzi'"],
      ["UPDATE menu_items SET category_slug='grills',category_title='Grills',updated_at=datetime('now') WHERE name='Mbuzi Ulaya / Charcoal Grilled'"],
      ["UPDATE menu_items SET category_slug='grills',category_title='Grills',updated_at=datetime('now') WHERE name IN ('Mbavu za Mbuzi','Mguu wa Mbuzi','Borewores','Bata Choma','Huge Pork Ribs','Braaied Beef Short Ribs','Maasai Meat Platter')"],
      ["UPDATE menu_items SET category_slug='main-meals',category_title='Main Meals',updated_at=datetime('now') WHERE name IN ('Hanga','Tsuro (Rabbit)','Zvinvenze','Mbuzi Kapoto','Samaki (Hove/Tsomba/Bream)','Samaki Makange','Kuku Kienyeji / Road Runner','Haifiridzi')"],

      ["UPDATE menu_items SET price_cents=1200,description='Real warrior',updated_at=datetime('now') WHERE name='Braaied Beef Short Ribs'"],
      ["UPDATE menu_items SET category_slug='grills',category_title='Grills',price_cents=2800,description='Charcoal grilled',updated_at=datetime('now') WHERE name='Huge Pork Ribs'"],
      ["UPDATE menu_items SET name='Zvinvenze',description='Kapoto',image_url=NULL,category_slug='main-meals',category_title='Main Meals',updated_at=datetime('now') WHERE name='Zvinyenze'"],
      ["UPDATE menu_items SET name='Kuku Kienyeji / Road Runner',description='Charcoal grilled indigenous chicken',price_cents=0,category_slug='main-meals',category_title='Main Meals',updated_at=datetime('now') WHERE name='Road Runner Chicken (Kuku Kienyeji)'"],
      ["UPDATE menu_items SET name='Mbavu za Mbuzi',description='Goat ribs',price_cents=0,category_slug='grills',category_title='Grills',updated_at=datetime('now') WHERE name='Goat Ribs (Mbavu za Mbuzi)'"],
      ["UPDATE menu_items SET price_cents=200,description='Rice prepared with peanut butter sauce',updated_at=datetime('now') WHERE name='Mpunga Une Dovi'"],
      ["UPDATE menu_items SET name='Fried Potato Wedges',price_cents=300,updated_at=datetime('now') WHERE name='Fried Potatoes'"],
      ["UPDATE menu_items SET price_cents=300,updated_at=datetime('now') WHERE name='Chips'"],
      ["UPDATE menu_items SET price_cents=100,updated_at=datetime('now') WHERE name='Chapati'"],
      ["UPDATE menu_items SET price_cents=400,updated_at=datetime('now') WHERE name='Homemade Cake Slice'"],
      ["UPDATE menu_items SET price_cents=300,updated_at=datetime('now') WHERE name='Wild Dried Fruits'"],
      ["UPDATE menu_items SET price_cents=200,updated_at=datetime('now') WHERE name='Best Zimbabwean Tea / Coffee'"],
      ["UPDATE menu_items SET available=0,updated_at=datetime('now') WHERE name IN ('Pork Trotters / Bones','Sadza Rezviyo / Remhunga','Muriwo Une Dovi','Pilau','Pilau / Jollof Rice','Plain Rice (Wali)','Trip','Beef (Highfield)')"],
      ["INSERT INTO menu_items (kind,category_slug,category_title,name,description,price_cents,featured,available,sort_order) SELECT 'food','grills','Off the Charcoal','Samaki Makange','Whole bream stewed',0,0,1,13 WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name='Samaki Makange')"],
      ["UPDATE menu_items SET image_url=NULL,updated_at=datetime('now') WHERE name='Samaki Makange'"],
      ["INSERT INTO menu_items (kind,category_slug,category_title,name,description,price_cents,featured,available,sort_order) SELECT 'food','sides','Accompaniments','Mufushwa Une Dovi','Dried vegetables stewed with peanut butter sauce',300,0,1,10 WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name='Mufushwa Une Dovi')"],
      ["INSERT INTO menu_items (kind,category_slug,category_title,name,description,price_cents,featured,available,sort_order) SELECT 'food','sides','Accompaniments','Plain Aromatic Rice','Plain aromatic rice',100,0,1,11 WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name='Plain Aromatic Rice')"],
      ["INSERT INTO menu_items (kind,category_slug,category_title,name,description,price_cents,featured,available,sort_order) SELECT 'food','sides','Accompaniments','Biryani Rice','',0,0,1,12 WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name='Biryani Rice')"],
      ["INSERT INTO menu_items (kind,category_slug,category_title,name,description,price_cents,featured,available,sort_order) SELECT 'food','sides','Accompaniments','Jollof Rice','',0,0,1,13 WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name='Jollof Rice')"],
      ["DELETE FROM menu_item_options"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'1/2',800,1 FROM menu_items WHERE name='Kuku Choma'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'Full',1200,2 FROM menu_items WHERE name='Kuku Choma'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'1/2',800,1 FROM menu_items WHERE name='Mbavu za Mbuzi'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'Full',1300,2 FROM menu_items WHERE name='Mbavu za Mbuzi'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'1/2 Poto',700,1 FROM menu_items WHERE name='Hanga'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'Full Poto',1200,2 FROM menu_items WHERE name='Hanga'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'Big',2000,1 FROM menu_items WHERE name='Samaki (Hove/Tsomba/Bream)'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'Med',1500,2 FROM menu_items WHERE name='Samaki (Hove/Tsomba/Bream)'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'Small',1300,3 FROM menu_items WHERE name='Samaki (Hove/Tsomba/Bream)'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'Big',2100,1 FROM menu_items WHERE name='Samaki Makange'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'Med',1600,2 FROM menu_items WHERE name='Samaki Makange'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'Small',1400,3 FROM menu_items WHERE name='Samaki Makange'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'Portion',500,1 FROM menu_items WHERE name='Zvinvenze'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'Kapoto',900,2 FROM menu_items WHERE name='Zvinvenze'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'Portion',400,1 FROM menu_items WHERE name='Mbuzi Kapoto'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'1/2 Poto',600,2 FROM menu_items WHERE name='Mbuzi Kapoto'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'Full Poto',900,3 FROM menu_items WHERE name='Mbuzi Kapoto'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'1/2 Poto',700,1 FROM menu_items WHERE name='Kuku Kienyeji / Road Runner'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'Full Poto',1200,2 FROM menu_items WHERE name='Kuku Kienyeji / Road Runner'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'2 pax',2000,1 FROM menu_items WHERE name='Maasai Meat Platter'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'4 pax',3900,2 FROM menu_items WHERE name='Maasai Meat Platter'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'Plain',200,1 FROM menu_items WHERE name='Biryani Rice'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'With Goat Meat',900,2 FROM menu_items WHERE name='Biryani Rice'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'Plain',200,1 FROM menu_items WHERE name='Jollof Rice'"],
      ["INSERT INTO menu_item_options(menu_item_id,label,price_cents,sort_order) SELECT id,'With Chicken',900,2 FROM menu_items WHERE name='Jollof Rice'"],
      ["UPDATE menu_items SET price_cents=0,updated_at=datetime('now') WHERE id IN (SELECT menu_item_id FROM menu_item_options)"],
    ];

    for (const sql of statements.flat()) {
      await db.prepare(sql).run();
    }
    return { ok: true as const };
  });

/** Full row list for the admin menu editor — includes unavailable items. */
export const getMenuAdmin = createServerFn({ method: "GET" })
  .middleware([staffUpMiddleware])
  .handler(async () => {
    setResponseHeader("Cache-Control", "private, no-store");
    const db = getDb();
    await ensureMenuOptionsTable(db);
    const { results } = await db
      .prepare("SELECT * FROM menu_items ORDER BY kind, category_slug, sort_order, id")
      .all<MenuItemRow>();
    return results;
  });

export const setMenuItemAvailability = createServerFn({ method: "POST" })
  .middleware([managerUpMiddleware])
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
  .middleware([managerUpMiddleware])
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

/** Renames a menu item and/or updates its description. */
export const setMenuItemDetails = createServerFn({ method: "POST" })
  .middleware([managerUpMiddleware])
  .validator((data: { id: number; name: string; description: string }) => data)
  .handler(async ({ data }) => {
    const name = data.name.trim();
    if (!name) {
      throw new Error("The name can't be empty.");
    }
    const db = getDb();
    await db
      .prepare(
        "UPDATE menu_items SET name = ?, description = ?, updated_at = datetime('now') WHERE id = ?",
      )
      .bind(name, data.description.trim(), data.id)
      .run();
    return { ok: true as const };
  });

/** Adds a brand-new dish or beverage to an existing category, at the end of its list. */
export const createMenuItem = createServerFn({ method: "POST" })
  .middleware([managerUpMiddleware])
  .validator(
    (data: {
      kind: MenuKind;
      category_slug: string;
      category_title: string;
      name: string;
      description: string;
      price: number;
    }) => data,
  )
  .handler(async ({ data }) => {
    const name = data.name.trim();
    if (!name) {
      throw new Error("Enter a name for the new item.");
    }
    if (!Number.isFinite(data.price) || data.price < 0) {
      throw new Error("Enter a valid price (or leave blank for On request).");
    }
    const db = getDb();
    const priceCents = Math.round(data.price * 100);
    const maxOrder = await db
      .prepare("SELECT COALESCE(MAX(sort_order), 0) as m FROM menu_items WHERE category_slug = ?")
      .bind(data.category_slug)
      .first<{ m: number }>();

    const result = await db
      .prepare(
        "INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, available, sort_order) VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?)",
      )
      .bind(
        data.kind,
        data.category_slug,
        data.category_title,
        name,
        data.description.trim(),
        priceCents,
        (maxOrder?.m ?? 0) + 1,
      )
      .run();

    return { ok: true as const, id: Number(result.meta.last_row_id) };
  });

/** Permanently removes a menu item (and any uploaded photo/clip it had). */
export const deleteMenuItem = createServerFn({ method: "POST" })
  .middleware([managerUpMiddleware])
  .validator((data: { id: number }) => data)
  .handler(async ({ data, context }) => {
    const db = getDb();
    const existing = await db
      .prepare("SELECT name, image_url, video_url FROM menu_items WHERE id = ?")
      .bind(data.id)
      .first<{ name: string; image_url: string | null; video_url: string | null }>();
    if (existing) {
      const bucket = getGalleryBucket();
      if (existing.image_url) await bucket.delete(existing.image_url).catch(() => {});
      if (existing.video_url) await bucket.delete(existing.video_url).catch(() => {});
    }
    await db.prepare("DELETE FROM menu_items WHERE id = ?").bind(data.id).run();
    if (context.admin && existing) {
      await logAdminActivity(
        { email: context.admin.email, role: context.admin.role },
        "Deleted menu item",
        existing.name,
      );
    }
    return { ok: true as const };
  });

/**
 * Uploads a photo for one menu item, replacing whatever image it had
 * before (old R2 object is deleted so the bucket doesn't accumulate
 * orphaned files). Stored in the same bucket as the gallery, under a
 * separate `menu/` prefix, and served by the same /gallery-image/$ route.
 */
export const setMenuItemImage = createServerFn({ method: "POST" })
  .middleware([staffUpMiddleware])
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
  .middleware([staffUpMiddleware])
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

/**
 * Uploads a short hover-to-play video clip for one menu item (e.g. sizzling
 * on the grill, steam off a fresh plate). Same bucket/route as photos, under
 * a menu-video/ prefix. Kept small on purpose — this autoplays muted on
 * hover, so a heavy file would stall instead of feeling instant.
 */
export const setMenuItemVideo = createServerFn({ method: "POST" })
  .middleware([managerUpMiddleware])
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
      throw new Error("Choose a video file first.");
    }
    if (!file.type.startsWith("video/")) {
      throw new Error("That file doesn't look like a video.");
    }
    if (file.size > 15 * 1024 * 1024) {
      throw new Error("Keep dish clips under 15MB so they play instantly on hover.");
    }
    return { id, file };
  })
  .handler(async ({ data }) => {
    const db = getDb();
    const bucket = getGalleryBucket();

    const existing = await db
      .prepare("SELECT video_url FROM menu_items WHERE id = ?")
      .bind(data.id)
      .first<{ video_url: string | null }>();

    const ext = (data.file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "");
    const key = `menu-video/${data.id}-${Date.now()}-${crypto.randomUUID()}.${ext || "mp4"}`;

    const bytes = await data.file.arrayBuffer();
    await bucket.put(key, bytes, { httpMetadata: { contentType: data.file.type } });

    await db
      .prepare("UPDATE menu_items SET video_url = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(key, data.id)
      .run();

    if (existing?.video_url) {
      await bucket.delete(existing.video_url).catch(() => {});
    }

    return { ok: true as const, videoUrl: key };
  });

/** Removes a menu item's hover clip — it falls back to the static photo. */
export const clearMenuItemVideo = createServerFn({ method: "POST" })
  .middleware([managerUpMiddleware])
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    const existing = await db
      .prepare("SELECT video_url FROM menu_items WHERE id = ?")
      .bind(data.id)
      .first<{ video_url: string | null }>();
    if (existing?.video_url) {
      const bucket = getGalleryBucket();
      await bucket.delete(existing.video_url).catch(() => {});
    }

    await db
      .prepare("UPDATE menu_items SET video_url = NULL, updated_at = datetime('now') WHERE id = ?")
      .bind(data.id)
      .run();

    return { ok: true as const };
  });
