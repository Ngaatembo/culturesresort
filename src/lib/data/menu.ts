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

// ──────────────────────────────────────────────────────────────────────────
// Client menu sync — "Apply latest client menu"
//
// CLIENT_MENU is the client's confirmed food menu. syncClientMenu() (below)
// brings the live D1 tables (menu_items + menu_item_options) in line with it:
// existing rows are renamed/updated in place (never duplicated), portions are
// rewritten per dish, dishes that are not on the client menu are hidden, and
// uploaded photos are kept — except an upload shared with the Road Runner dish
// (or another dish flagged resetImage), which is dropped so the correct mapped
// photo in dish-photos.ts is used. The public menu and the admin both read the
// same D1 rows. Running it twice gives the same result as running it once.
//
// To change a name, price, portion or category, edit CLIENT_MENU and press the
// button again. Prices are whole dollars: a dish has either `price` or `options`.
// ──────────────────────────────────────────────────────────────────────────
// <client-menu-sync>

type CatalogCategory = "starters" | "main-meals" | "grills" | "sides" | "desserts";

const CLIENT_MENU_CATEGORIES: Record<CatalogCategory, string> = {
  starters: "Starters",
  "main-meals": "Main Meals",
  grills: "Grills",
  sides: "Sides",
  desserts: "Desserts",
};

type CatalogOption = { label: string; price: number };

type CatalogItem = {
  /** The name shown on the menu. */
  name: string;
  /** Older names for this same dish. An existing row with one of these is renamed in place (keeping its photo) instead of creating a duplicate. */
  aliases?: string[];
  category: CatalogCategory;
  /** Client-supplied description. Left untouched in the database when omitted. */
  description?: string;
  /** Blank out a stored description that is known to be wrong. */
  clearDescription?: boolean;
  /** Single price. */
  price?: number;
  /** Portion options, in the order the client lists them. */
  options?: CatalogOption[];
  /** If this dish's uploaded photo is shared with another dish, drop it so the mapped (code-level) photo is used instead. */
  resetImage?: boolean;
};

const CLIENT_MENU: CatalogItem[] = [
  // ── Starters ────────────────────────────────────────────────
  { name: "Piri Piri Gizzards", category: "starters", price: 4, clearDescription: true },
  {
    name: "Fried Liver / Chiropa",
    aliases: ["Fried Liver (Chiropa)"],
    category: "starters",
    price: 4,
  },
  {
    name: "Mopani Worms / Madora",
    aliases: ["Mopani Worms (Madora)"],
    category: "starters",
    price: 4,
  },
  {
    name: "Fried Kapenta / Omena",
    aliases: ["Fried Kapenta (Omena)"],
    category: "starters",
    price: 4,
  },

  // ── Main meals ──────────────────────────────────────────────
  {
    name: "Samaki / Hove / Tsomba / Bream",
    aliases: ["Samaki (Hove/Tsomba/Bream)", "Samaki"],
    category: "main-meals",
    options: [
      { label: "Big", price: 20 },
      { label: "Medium", price: 15 },
      { label: "Small", price: 13 },
    ],
  },
  {
    name: "Samaki Makange",
    category: "main-meals",
    description: "Whole bream stewed",
    options: [
      { label: "Big", price: 21 },
      { label: "Medium", price: 16 },
      { label: "Small", price: 14 },
    ],
    resetImage: true,
  },
  {
    name: "Hanga",
    category: "main-meals",
    options: [
      { label: "1/2 Poto", price: 7 },
      { label: "Full Poto", price: 12 },
    ],
  },
  {
    name: "Tsuro / Rabbit",
    aliases: ["Tsuro (Rabbit)"],
    category: "main-meals",
    description: "Grilled / stewed or with dovi",
    price: 12,
  },
  {
    name: "Bata Choma",
    category: "main-meals",
    description: "Charcoal grilled duck",
    price: 15,
  },
  {
    name: "Zvinvenze",
    aliases: ["Zvinyenze"],
    category: "main-meals",
    description: "Zimbabwean Traditional Delicacy",
    options: [
      { label: "Portion", price: 5 },
      { label: "Kapoto", price: 9 },
    ],
    resetImage: true,
  },
  {
    name: "Mbuzi Kapoto",
    aliases: ["Mbizi Kapoto"],
    category: "main-meals",
    options: [
      { label: "Portion", price: 4 },
      { label: "1/2 Poto", price: 6 },
      { label: "Full Poto", price: 9 },
    ],
  },
  {
    name: "Kuku Kienyeji / Road Runner",
    aliases: ["Road Runner Chicken (Kuku Kienyeji)", "Road Runner"],
    category: "main-meals",
    options: [
      { label: "1/2 Poto", price: 7 },
      { label: "Full Poto", price: 12 },
    ],
  },
  {
    name: "Kuku Karanga",
    category: "main-meals",
    description: "Chicken pieces prepared East African way",
    price: 13,
  },
  {
    name: "Haifiridzi",
    category: "main-meals",
    description: "Tender beef stew fried with vegetables",
    price: 13,
  },

  // ── Grills ──────────────────────────────────────────────────
  {
    name: "Kuku Choma",
    category: "grills",
    description: "Charcoal grilled chicken",
    options: [
      { label: "1/2", price: 8 },
      { label: "Full", price: 12 },
    ],
  },
  { name: "Beef Chop ala Masai", category: "grills", price: 12 },
  {
    name: "Mbavu za Mbuzi",
    aliases: ["Goat Ribs (Mbavu za Mbuzi)"],
    category: "grills",
    description: "Goat ribs",
    options: [
      { label: "1/2", price: 8 },
      { label: "Full", price: 13 },
    ],
  },
  {
    name: "Mbuzi Ulaya / Charcoal Grilled",
    aliases: ["Mbuzi Ulaya (Charcoal Grilled Pork Chops)", "Mbuzi Ulaya"],
    category: "grills",
    description: "Charcoal grilled",
    price: 12,
  },
  {
    name: "Braaied Beef Short Ribs",
    category: "grills",
    description: "Real Warrior",
    price: 12,
  },
  {
    name: "Huge Pork Ribs",
    category: "grills",
    description: "Charcoal grilled",
    price: 28,
  },
  {
    name: "Mguu wa Mbuzi",
    aliases: ["Mguu wambuzi (grilled goat leg)"],
    category: "grills",
    description: "Full goat leg grilled on charcoal",
    price: 16,
  },
  { name: "Borewores", aliases: ["Boerewors"], category: "grills", price: 12 },
  {
    name: "Maasai Meat Platter",
    category: "grills",
    options: [
      { label: "2 Pax", price: 20 },
      { label: "4 Pax", price: 39 },
    ],
  },

  // ── Sides ───────────────────────────────────────────────────
  {
    name: "Mpunga Une Dovi",
    aliases: ["Mupunga Une Dovi"],
    category: "sides",
    description: "Rice prepared with peanut butter sauce",
    price: 2,
  },
  {
    name: "Sadza / Ugali",
    aliases: ["Sadza / Ugali (Isitshwala)"],
    category: "sides",
    price: 1,
  },
  {
    name: "Plain Aromatic Rice",
    aliases: ["Plain Rice (Wali)"],
    category: "sides",
    price: 1,
  },
  {
    name: "Biryani Rice",
    category: "sides",
    options: [
      { label: "Plain", price: 2 },
      { label: "With Goat Meat", price: 9 },
    ],
  },
  {
    name: "Jollof Rice",
    aliases: ["Pilau / Jollof Rice"],
    category: "sides",
    options: [
      { label: "Plain", price: 2 },
      { label: "With Chicken", price: 9 },
    ],
  },
  { name: "Chips / Fries", aliases: ["Chips"], category: "sides", price: 3 },
  {
    name: "Mufushwa Une Dovi",
    category: "sides",
    description: "Dried vegetables stewed with peanut butter sauce",
    price: 3,
  },
  {
    name: "Chapati",
    category: "sides",
    description: "Oriental round flat bread",
    price: 1,
  },
  {
    name: "Fried Potato Wedges",
    aliases: ["Fried Potatoes"],
    category: "sides",
    price: 3,
  },

  // ── Desserts ────────────────────────────────────────────────
  {
    name: "Home Made Cake",
    aliases: ["Homemade Cake Slice", "Homemade Cake"],
    category: "desserts",
    price: 4,
  },
  { name: "Wild Dried Fruits", category: "desserts", price: 3 },
  {
    name: "Best Zimbabwean Coffee / Tea",
    aliases: ["Best Zimbabwean Tea / Coffee"],
    category: "desserts",
    price: 2,
  },
];

/**
 * Old dishes that are no longer on the client's menu. The sync hides every
 * food row that isn't matched to CLIENT_MENU, so this list is documentation of
 * what is expected to be switched off (e.g. by name in an old database).
 */
const LEGACY_FOOD_NAMES = [
  "Pilau",
  "Pilau / Jollof Rice",
  "Plain Rice (Wali)",
  "Muriwo Une Dovi",
  "Sadza Rezviyo / Remhunga",
  "Pork Trotters / Bones",
  "Trip",
  "Beef (Highfield)",
  "Mguu wambuzi (grilled goat leg)",
];

type SyncRow = {
  id: number;
  name: string;
  available: number;
  image_url: string | null;
};

type SyncOptionRow = { menu_item_id: number; label: string; price_cents: number };

type SyncFullRow = SyncRow & {
  category_slug: string;
  category_title: string;
  price_cents: number;
};

type SyncStatement = { sql: string; params: (string | number | null)[] };

type SyncPlan = {
  statements: SyncStatement[];
  created: string[];
  renamed: string[];
  disabled: string[];
  imagesCleared: string[];
};

const ROAD_RUNNER = "Kuku Kienyeji / Road Runner";
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const cents = (dollars: number) => Math.round(dollars * 100);

/** The base price stored on the row: the single price, or the cheapest portion (so nothing ever reads as "On request"). */
function catalogBaseCents(item: CatalogItem): number {
  if (item.options?.length) return Math.min(...item.options.map((o) => cents(o.price)));
  return cents(item.price ?? 0);
}

function planClientMenuSync(rows: SyncRow[]): SyncPlan {
  const statements: SyncStatement[] = [];
  const created: string[] = [];
  const renamed: string[] = [];
  const disabled: string[] = [];
  const imagesCleared: string[] = [];

  const sorted = [...rows].sort((a, b) => a.id - b.id);
  const byName = new Map<string, SyncRow[]>();
  for (const row of sorted) {
    const key = norm(row.name);
    byName.set(key, [...(byName.get(key) ?? []), row]);
  }

  const claimed = new Set<number>();
  const canonicalByItem = new Map<string, SyncRow>();
  const photoByItem = new Map<string, string | null>(); // the photo each live dish ends up with

  CLIENT_MENU.forEach((item, index) => {
    const title = CLIENT_MENU_CATEGORIES[item.category];
    const sortOrder = (index + 1) * 10;
    const base = catalogBaseCents(item);

    const pick = (names: string[]) =>
      names
        .flatMap((n) => byName.get(norm(n)) ?? [])
        .filter((r) => !claimed.has(r.id))
        // prefer a live row, then one that already has a photo, then the oldest
        .sort(
          (a, b) =>
            b.available - a.available ||
            (a.image_url ? 0 : 1) - (b.image_url ? 0 : 1) ||
            a.id - b.id,
        );

    const exact = pick([item.name]);
    const viaAlias = pick(item.aliases ?? []);
    const candidates = [...exact, ...viaAlias.filter((r) => !exact.includes(r))];
    const canonical = candidates[0];

    // Any further matches are old duplicates of the same dish: hide them.
    for (const dup of candidates.slice(1)) {
      claimed.add(dup.id);
      if (dup.available) disabled.push(`${dup.name} (duplicate of ${item.name})`);
      statements.push({
        sql: "UPDATE menu_items SET available = 0, updated_at = datetime('now') WHERE id = ?",
        params: [dup.id],
      });
    }

    let itemRef: { sql: string; params: (string | number | null)[] }; // how options find the item

    if (canonical) {
      claimed.add(canonical.id);
      canonicalByItem.set(item.name, canonical);
      if (canonical.name !== item.name) {
        renamed.push(`${canonical.name} → ${item.name}`);
      }
      const sets = [
        "name = ?",
        "category_slug = ?",
        "category_title = ?",
        "price_cents = ?",
        "available = 1",
        "sort_order = ?",
        "updated_at = datetime('now')",
      ];
      const params: (string | number | null)[] = [item.name, item.category, title, base, sortOrder];
      if (item.description !== undefined) {
        sets.push("description = ?");
        params.push(item.description);
      } else if (item.clearDescription) {
        sets.push("description = ''");
      }
      let photo = canonical.image_url;
      if (!photo) {
        // An old duplicate held this dish's uploaded photo: keep it on the live row.
        const donor = candidates.slice(1).find((r) => r.image_url);
        if (donor?.image_url) {
          sets.push("image_url = ?");
          params.push(donor.image_url);
          photo = donor.image_url;
        }
      }
      photoByItem.set(item.name, photo);
      statements.push({
        sql: `UPDATE menu_items SET ${sets.join(", ")} WHERE id = ?`,
        params: [...params, canonical.id],
      });
      statements.push({
        sql: "DELETE FROM menu_item_options WHERE menu_item_id = ?",
        params: [canonical.id],
      });
      itemRef = { sql: "?", params: [canonical.id] };
    } else {
      created.push(item.name);
      statements.push({
        sql:
          "INSERT INTO menu_items (kind, category_slug, category_title, name, description, price_cents, featured, available, sort_order) " +
          "VALUES ('food', ?, ?, ?, ?, ?, 0, 1, ?)",
        params: [item.category, title, item.name, item.description ?? "", base, sortOrder],
      });
      // The new row is found again by its (unique, just-inserted) name.
      itemRef = {
        sql: "(SELECT id FROM menu_items WHERE kind = 'food' AND name = ? ORDER BY id DESC LIMIT 1)",
        params: [item.name],
      };
    }

    (item.options ?? []).forEach((option, i) => {
      statements.push({
        sql: `INSERT INTO menu_item_options (menu_item_id, label, price_cents, sort_order) VALUES (${itemRef.sql}, ?, ?, ?)`,
        params: [...itemRef.params, option.label, cents(option.price), i + 1],
      });
    });
  });

  // Shared uploads. A photo that Road Runner also holds is the "duplicate Road
  // Runner image": it stays on Road Runner and is cleared from every other dish
  // (they fall back to their own mapped photo). Dishes flagged `resetImage` also
  // lose an upload that any other dish shares. Unique uploads are never touched.
  const holders = new Map<string, Set<string>>();
  const hold = (photo: string, who: string) => holders.set(photo, (holders.get(photo) ?? new Set()).add(who));
  photoByItem.forEach((photo, name) => {
    if (photo) hold(photo, name);
  });
  for (const row of sorted) {
    if (!claimed.has(row.id) && row.available && row.image_url) hold(row.image_url, `legacy:${row.id}`);
  }
  const roadRunnerPhoto = photoByItem.get(ROAD_RUNNER);
  for (const [name, row] of canonicalByItem) {
    const photo = photoByItem.get(name);
    if (!photo || name === ROAD_RUNNER) continue;
    const sharesRoadRunner = !!roadRunnerPhoto && photo === roadRunnerPhoto;
    const flaggedAndShared =
      !!CLIENT_MENU.find((i) => i.name === name)?.resetImage && (holders.get(photo)?.size ?? 0) > 1;
    if (sharesRoadRunner || flaggedAndShared) {
      imagesCleared.push(name);
      statements.push({
        sql: "UPDATE menu_items SET image_url = NULL, updated_at = datetime('now') WHERE id = ?",
        params: [row.id],
      });
    }
  }

  // Everything else still switched on is legacy: not on the client's menu.
  for (const row of sorted) {
    if (claimed.has(row.id)) continue;
    if (row.available) {
      disabled.push(row.name);
      statements.push({
        sql: "UPDATE menu_items SET available = 0, updated_at = datetime('now') WHERE id = ?",
        params: [row.id],
      });
    }
  }

  return { statements, created, renamed, disabled, imagesCleared };
}

/** Reads the result back and lists anything that doesn't match the client menu. Empty = verified. */
function verifyClientMenu(rows: SyncFullRow[], options: SyncOptionRow[]): string[] {
  const problems: string[] = [];
  const active = rows.filter((r) => r.available);
  const activeByName = new Map<string, SyncFullRow[]>();
  for (const row of active) {
    const key = norm(row.name);
    activeByName.set(key, [...(activeByName.get(key) ?? []), row]);
  }

  for (const [key, list] of activeByName) {
    if (list.length > 1) problems.push(`Duplicate active dish: ${list[0]?.name ?? key}`);
  }

  const catalogNames = new Set(CLIENT_MENU.map((i) => norm(i.name)));
  for (const row of active) {
    if (!catalogNames.has(norm(row.name))) problems.push(`Not on the client menu but active: ${row.name}`);
  }
  for (const legacy of LEGACY_FOOD_NAMES) {
    if (activeByName.has(norm(legacy))) problems.push(`Legacy dish still active: ${legacy}`);
  }

  const byPhoto = new Map<string, string[]>();
  for (const row of active) {
    if (row.image_url) byPhoto.set(row.image_url, [...(byPhoto.get(row.image_url) ?? []), row.name]);
  }
  for (const names of byPhoto.values()) {
    if (names.length > 1) problems.push(`Same uploaded photo on several dishes: ${names.join(", ")}`);
  }

  for (const item of CLIENT_MENU) {
    const row = activeByName.get(norm(item.name))?.[0];
    if (!row) {
      problems.push(`Missing or hidden: ${item.name}`);
      continue;
    }
    if (row.name !== item.name) problems.push(`Name differs: "${row.name}" should be "${item.name}"`);
    if (row.category_slug !== item.category) {
      problems.push(`${item.name}: category is ${row.category_slug}, should be ${item.category}`);
    }
    if (row.category_title !== CLIENT_MENU_CATEGORIES[item.category]) {
      problems.push(`${item.name}: category title is "${row.category_title}"`);
    }
    if (row.price_cents !== catalogBaseCents(item)) {
      problems.push(`${item.name}: price is ${row.price_cents}, should be ${catalogBaseCents(item)}`);
    }
    const stored = options
      .filter((o) => o.menu_item_id === row.id)
      .map((o) => `${o.label}=${o.price_cents}`);
    const expected = (item.options ?? []).map((o) => `${o.label}=${cents(o.price)}`);
    if (stored.join("|") !== expected.join("|")) {
      problems.push(`${item.name}: portions are [${stored.join(", ")}], should be [${expected.join(", ")}]`);
    }
  }

  return problems;
}
// </client-menu-sync>

export const syncClientMenu = createServerFn({ method: "POST" })
  .middleware([managerUpMiddleware])
  .handler(async () => {
    const db = getDb();
    await ensureMenuOptionsTable(db);

    const { results: existing } = await db
      .prepare("SELECT id, name, available, image_url FROM menu_items WHERE kind = 'food'")
      .all<SyncRow>();
    const plan = planClientMenuSync(existing);

    // Small batches: each D1 batch is one call (and one transaction). The sync is
    // idempotent, so if one ever fails it is safe to just press the button again.
    const CHUNK = 40;
    for (let i = 0; i < plan.statements.length; i += CHUNK) {
      await db.batch(
        plan.statements.slice(i, i + CHUNK).map((s) => db.prepare(s.sql).bind(...s.params)),
      );
    }

    // Read the live tables back and check them against the client menu.
    const { results: rows } = await db
      .prepare(
        "SELECT id, name, available, image_url, category_slug, category_title, price_cents FROM menu_items WHERE kind = 'food'",
      )
      .all<SyncFullRow>();
    const { results: optionRows } = await db
      .prepare(
        "SELECT menu_item_id, label, price_cents FROM menu_item_options ORDER BY menu_item_id, sort_order, id",
      )
      .all<SyncOptionRow>();
    const problems = verifyClientMenu(rows, optionRows);

    return {
      ok: true as const,
      dishes: CLIENT_MENU.length,
      created: plan.created,
      renamed: plan.renamed,
      disabled: plan.disabled,
      imagesCleared: plan.imagesCleared,
      verified: problems.length === 0,
      problems,
    };
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
