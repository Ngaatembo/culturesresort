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

export type MenuItemOptionRow = {
  id: number;
  menu_item_id: number;
  label: string;
  price_cents: number;
  sort_order: number;
};

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

/** Millisecond timestamp so back-to-back saves get distinct row versions. */
const NOW_MS = "strftime('%Y-%m-%d %H:%M:%f','now')";

function formatPrice(cents: number) {
  return cents > 0 ? `$${(cents / 100).toFixed(2)}` : "On request";
}

/** All available menu items, grouped by kind (food/beverages) then category. */
export const getMenu = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "no-store");
  const db = getDb();
  const { results } = await db
    .prepare(
      `SELECT * FROM menu_items
       WHERE available = 1
         AND name NOT IN (
           'Pilau',
           'Trip',
           'Beef (Highfield)',
           'Pork Trotters / Bones',
           'Sadza Rezviyo / Remhunga',
           'Muriwo Une Dovi',
           'Pilau / Jollof Rice',
           'Plain Rice (Wali)'
         )
         AND name NOT LIKE 'Mguu wamb%'
       ORDER BY kind, category_slug, sort_order, id`,
    )
    .all<MenuItemRow>();

  // No silent fallback: if portion prices can't be read, fail loudly rather
  // than render a menu with missing or wrong prices.
  const optionResults = await db
    .prepare(
      "SELECT id, menu_item_id, label, price_cents FROM menu_item_options ORDER BY menu_item_id, sort_order, id",
    )
    .all<{ id: number; menu_item_id: number; label: string; price_cents: number }>();
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
    const itemOptions = optionsByItem.get(row.id) ?? [];
    // A dish with portions is priced "From <cheapest portion>" wherever a single price is shown.
    const fromCents = itemOptions.length ? Math.min(...itemOptions.map((o) => o.priceCents)) : null;
    category.items.push({
      id: row.id,
      name: row.name,
      description: row.description,
      price: fromCents !== null ? `From ${formatPrice(fromCents)}` : formatPrice(row.price_cents),
      priceCents: fromCents ?? row.price_cents,
      imageUrl: row.image_url,
      options: itemOptions,
      videoUrl: row.video_url,
      featured: !!row.featured,
      available: !!row.available,
    });
  }

  return byKind;
});

async function ensureMenuOptionsTable(db: ReturnType<typeof getDb>) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS menu_item_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`,
    )
    .run();
  await db
    .prepare(
      "CREATE INDEX IF NOT EXISTS idx_menu_item_options_item ON menu_item_options(menu_item_id)",
    )
    .run();
}

export const getMenuOptionsAdmin = createServerFn({ method: "GET" })
  .middleware([staffUpMiddleware])
  .handler(async () => {
    setResponseHeader("Cache-Control", "private, no-store");
    const db = getDb();
    await ensureMenuOptionsTable(db);
    const { results } = await db
      .prepare(
        "SELECT id, menu_item_id, label, price_cents, sort_order FROM menu_item_options ORDER BY menu_item_id, sort_order, id",
      )
      .all<MenuItemOptionRow>();
    return results;
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
      .all<MenuItemAdmin>();
    return results;
  });

export const setMenuItemAvailability = createServerFn({ method: "POST" })
  .middleware([managerUpMiddleware])
  .validator((data: { id: number; available: boolean }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    const result = await db
      .prepare(`UPDATE menu_items SET available = ?, updated_at = ${NOW_MS} WHERE id = ?`)
      .bind(data.available ? 1 : 0, data.id)
      .run();
    if (Number(result.meta?.changes ?? 0) !== 1) {
      console.error("[setMenuItemAvailability] no row updated", data);
      throw new Error("Couldn't update availability — the item wasn't found. Reload the page.");
    }
    const row = await db
      .prepare("SELECT * FROM menu_items WHERE id = ?")
      .bind(data.id)
      .first<MenuItemAdmin>();
    return { ok: true as const, item: row };
  });

// ──────────────────────────────────────────────────────────────────────────
// Menu item saving — the ONE write path for names, descriptions and prices.
//
// The database is the only source of truth for prices. Every admin save goes
// through saveMenuItem(), which:
//   1. validates everything first,
//   2. refuses to write if the row changed since the admin loaded it
//      (so an old, open tab can't overwrite a newer price),
//   3. writes the item and all its portions in one D1 batch (one transaction),
//   4. checks each statement actually changed a row, and
//   5. reads the item + portions back and returns those stored values, which
//      the admin UI then displays. "Saved" is only shown after that read-back.
// ──────────────────────────────────────────────────────────────────────────

export type MenuItemAdmin = MenuItemRow & { updated_at: string };

export type SaveMenuItemInput = {
  id: number;
  /** updated_at the admin loaded — used to reject stale overwrites. */
  expectedUpdatedAt: string;
  name: string;
  description: string;
  /** Whole currency units. Ignored when the item has portions (the base price then follows the cheapest portion). */
  price: number;
  /** Existing portions to update (every one the item has, with its current or edited values). */
  options: { id: number; label: string; price: number }[];
  /** Portions to add. */
  newOptions: { label: string; price: number }[];
  /** Portion ids to delete. */
  removeOptionIds: number[];
};

async function currentUpdatedAt(db: ReturnType<typeof getDb>, id: number): Promise<string> {
  const row = await db
    .prepare("SELECT updated_at FROM menu_items WHERE id = ?")
    .bind(id)
    .first<{ updated_at: string }>();
  if (!row) throw new Error("This item no longer exists. Reload the page.");
  return row.updated_at;
}

function toCents(price: number, what: string): number {
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0 || price > 100000) {
    throw new Error(`Enter a valid price for ${what}.`);
  }
  return Math.round(price * 100);
}

async function readItemWithOptions(db: ReturnType<typeof getDb>, id: number) {
  const item = await db
    .prepare("SELECT * FROM menu_items WHERE id = ?")
    .bind(id)
    .first<MenuItemAdmin>();
  const { results: options } = await db
    .prepare(
      "SELECT id, menu_item_id, label, price_cents, sort_order FROM menu_item_options WHERE menu_item_id = ? ORDER BY sort_order, id",
    )
    .bind(id)
    .all<MenuItemOptionRow>();
  return { item, options };
}

export const saveMenuItem = createServerFn({ method: "POST" })
  .middleware([managerUpMiddleware])
  .validator((data: SaveMenuItemInput) => data)
  .handler(async ({ data, context }) => {
    const id = Number(data.id);
    if (!Number.isInteger(id) || id <= 0) throw new Error("Missing menu item id.");
    const name = String(data.name ?? "").trim();
    if (!name) throw new Error("The name can't be empty.");
    const description = String(data.description ?? "").trim();

    const updates = (data.options ?? []).map((o) => {
      const label = String(o.label ?? "").trim();
      if (!label) throw new Error(`Every portion of ${name} needs a label.`);
      return { id: Number(o.id), label, cents: toCents(o.price, `${name} — ${label}`) };
    });
    const inserts = (data.newOptions ?? []).map((o) => {
      const label = String(o.label ?? "").trim();
      if (!label) throw new Error(`Every portion of ${name} needs a label.`);
      return { label, cents: toCents(o.price, `${name} — ${label}`) };
    });
    const removeIds = (data.removeOptionIds ?? []).map(Number);

    const db = getDb();
    const current = await readItemWithOptions(db, id);
    if (!current.item) throw new Error("This item no longer exists. Reload the page.");
    if (current.item.updated_at !== data.expectedUpdatedAt) {
      throw new Error(
        `"${current.item.name}" was changed somewhere else since you opened this page. Your changes were NOT saved — reload the page and try again.`,
      );
    }

    // Every portion id sent must belong to this item — never touch another dish's row.
    const ownIds = new Set(current.options.map((o) => o.id));
    for (const oid of [...updates.map((u) => u.id), ...removeIds]) {
      if (!ownIds.has(oid)) {
        throw new Error(
          `A portion of "${name}" was changed somewhere else. Reload the page and try again.`,
        );
      }
    }

    // What the portion list will be after the save.
    const remaining = current.options
      .filter((o) => !removeIds.includes(o.id))
      .map((o) => updates.find((u) => u.id === o.id)?.cents ?? o.price_cents);
    const finalCents = [...remaining, ...inserts.map((i) => i.cents)];
    // With portions, the stored base price mirrors the cheapest portion so every
    // reader agrees; without portions it is the single price entered.
    const baseCents = finalCents.length ? Math.min(...finalCents) : toCents(data.price, name);

    const maxSort = current.options.reduce((m, o) => Math.max(m, o.sort_order), 0);
    const statements = [
      db
        .prepare(
          `UPDATE menu_items SET name = ?, description = ?, price_cents = ?, updated_at = ${NOW_MS} WHERE id = ? AND updated_at = ?`,
        )
        .bind(name, description, baseCents, id, data.expectedUpdatedAt),
      ...updates.map((u) =>
        db
          .prepare(
            "UPDATE menu_item_options SET label = ?, price_cents = ? WHERE id = ? AND menu_item_id = ?",
          )
          .bind(u.label, u.cents, u.id, id),
      ),
      ...removeIds.map((rid) =>
        db.prepare("DELETE FROM menu_item_options WHERE id = ? AND menu_item_id = ?").bind(rid, id),
      ),
      ...inserts.map((ins, i) =>
        db
          .prepare(
            "INSERT INTO menu_item_options (menu_item_id, label, price_cents, sort_order) VALUES (?, ?, ?, ?)",
          )
          .bind(id, ins.label, ins.cents, maxSort + i + 1),
      ),
    ];

    const results = await db.batch(statements);
    const changed = results.map((r) => Number(r.meta?.changes ?? 0));
    if (changed.some((c) => c !== 1)) {
      console.error("[saveMenuItem] unexpected row counts", { id, changed });
      throw new Error(
        `Saving "${name}" did not complete as expected. Reload the page to see what is stored, then try again.`,
      );
    }

    // Authoritative read-back: this is what the admin screen will show.
    const saved = await readItemWithOptions(db, id);
    if (!saved.item) throw new Error("The item disappeared while saving. Reload the page.");
    const expected = [...updates.map((u) => `${u.id}:${u.cents}`)];
    for (const e of expected) {
      const [oid, c] = e.split(":").map(Number);
      const row = saved.options.find((o) => o.id === oid);
      if (!row || row.price_cents !== c) {
        console.error("[saveMenuItem] read-back mismatch", {
          id,
          oid,
          want: c,
          got: row?.price_cents,
        });
        throw new Error(`"${name}" did not save correctly. Reload the page and try again.`);
      }
    }
    if (saved.item.price_cents !== baseCents) {
      console.error("[saveMenuItem] base price read-back mismatch", {
        id,
        want: baseCents,
        got: saved.item.price_cents,
      });
      throw new Error(`"${name}" did not save correctly. Reload the page and try again.`);
    }

    if (context.admin) {
      const summary = saved.options.length
        ? saved.options.map((o) => `${o.label} $${(o.price_cents / 100).toFixed(2)}`).join(", ")
        : `$${(saved.item.price_cents / 100).toFixed(2)}`;
      await logAdminActivity(
        { email: context.admin.email, role: context.admin.role },
        "Updated menu item",
        `${saved.item.name} — ${summary}`,
      ).catch((err) => console.error("[saveMenuItem] activity log failed", err));
    }

    return { item: saved.item, options: saved.options };
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

    const id = Number(result.meta.last_row_id);
    const item = await db
      .prepare("SELECT * FROM menu_items WHERE id = ?")
      .bind(id)
      .first<MenuItemAdmin>();
    if (!item) {
      console.error("[createMenuItem] insert not readable", { id, name });
      throw new Error(`"${name}" could not be added. Reload the page and try again.`);
    }
    return { ok: true as const, id, item };
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
      .prepare(`UPDATE menu_items SET image_url = ?, updated_at = ${NOW_MS} WHERE id = ?`)
      .bind(key, data.id)
      .run();

    if (existing?.image_url) {
      await bucket.delete(existing.image_url).catch(() => {});
    }

    return { ok: true as const, imageUrl: key, updatedAt: await currentUpdatedAt(db, data.id) };
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
      .prepare(`UPDATE menu_items SET image_url = NULL, updated_at = ${NOW_MS} WHERE id = ?`)
      .bind(data.id)
      .run();

    return { ok: true as const, updatedAt: await currentUpdatedAt(db, data.id) };
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
      .prepare(`UPDATE menu_items SET video_url = ?, updated_at = ${NOW_MS} WHERE id = ?`)
      .bind(key, data.id)
      .run();

    if (existing?.video_url) {
      await bucket.delete(existing.video_url).catch(() => {});
    }

    return { ok: true as const, videoUrl: key, updatedAt: await currentUpdatedAt(db, data.id) };
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
      .prepare(`UPDATE menu_items SET video_url = NULL, updated_at = ${NOW_MS} WHERE id = ?`)
      .bind(data.id)
      .run();

    return { ok: true as const, updatedAt: await currentUpdatedAt(db, data.id) };
  });
