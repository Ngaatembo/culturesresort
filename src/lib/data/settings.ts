import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./cf";
import { ownerOnlyMiddleware } from "@/lib/auth/functions";
import { logAdminActivity } from "./activity-log-write";

export type BusinessInfo = {
  name: string;
  addressLine: string;
  addressShort: string;
  phoneDisplay: string;
  phoneHref: string;
  phoneDisplay2: string | null;
  phoneHref2: string | null;
  whatsappNumber: string;
  whatsappHref: string;
  email: string;
  emailAlt: string;
  mapsHref: string;
  mapsEmbedHref: string;
  tripadvisorHref: string;
  googleReviewsHref: string;
};

export type SocialLinks = {
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  x: string | null;
};
export type OpeningHour = { day: string; hours: string };
export type VisitDetail = { label: string; value: string };
export type ClosureBanner = { enabled: boolean; message: string };
export type NotificationPrefs = { enabled: boolean; email: string };
/** Slot name -> gallery_photos.r2_key (or null to use the bundled default). */
export type HomepageImages = Record<string, string | null>;

export type SiteSettings = {
  business: BusinessInfo;
  socialLinks: SocialLinks;
  openingHours: OpeningHour[];
  visitDetails: VisitDetail[];
  eventTypes: string[];
  eventRequirements: string[];
  closureBanner: ClosureBanner;
  notifications: NotificationPrefs;
  homepageImages: HomepageImages;
};

const KEYS = {
  business: "business",
  socialLinks: "social_links",
  openingHours: "opening_hours",
  visitDetails: "visit_details",
  eventTypes: "event_types",
  eventRequirements: "event_requirements",
  closureBanner: "closure_banner",
  notifications: "notifications",
  homepageImages: "homepage_images",
} as const;

/** Public — read by every page that used to import these from site-data.ts. */
export const getSiteSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSettings> => {
    const db = getDb();
    const { results } = await db
      .prepare("SELECT key, value FROM site_settings")
      .all<{ key: string; value: string }>();
    const rows = new Map(results.map((r) => [r.key, r.value]));

    const parse = <T>(key: string, fallback: T): T => {
      const raw = rows.get(key);
      if (!raw) return fallback;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    };

    return {
      business: parse(KEYS.business, {} as BusinessInfo),
      socialLinks: parse(KEYS.socialLinks, {
        facebook: null,
        instagram: null,
        tiktok: null,
        x: null,
      }),
      openingHours: parse(KEYS.openingHours, []),
      visitDetails: parse(KEYS.visitDetails, []),
      eventTypes: parse(KEYS.eventTypes, []),
      eventRequirements: parse(KEYS.eventRequirements, []),
      closureBanner: parse(KEYS.closureBanner, { enabled: false, message: "" }),
      notifications: parse(KEYS.notifications, { enabled: false, email: "" }),
      homepageImages: parse(KEYS.homepageImages, {} as HomepageImages),
    };
  },
);

const SETTING_KEYS = new Set<string>(Object.values(KEYS));

/** Admin-only — overwrites one settings group at a time. */
export const updateSiteSetting = createServerFn({ method: "POST" })
  .middleware([ownerOnlyMiddleware])
  .validator((data: { key: keyof typeof KEYS; value: unknown }) => data)
  .handler(async ({ data, context }) => {
    const dbKey = KEYS[data.key];
    if (!dbKey || !SETTING_KEYS.has(dbKey)) {
      throw new Error(`Unknown settings key: ${String(data.key)}`);
    }
    const db = getDb();
    await db
      .prepare(
        "INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
      )
      .bind(dbKey, JSON.stringify(data.value))
      .run();
    if (context.admin) {
      await logAdminActivity(
        { email: context.admin.email, role: context.admin.role },
        "Changed business setting",
        data.key,
      );
    }
    return { ok: true as const };
  });

/** Named homepage image slots an admin can assign a gallery photo to. */
export const HOMEPAGE_IMAGE_SLOTS = [
  { key: "hero", label: "Homepage Hero" },
  { key: "garden", label: "The Garden" },
  { key: "food", label: "Open Fire Cooking" },
  { key: "craft", label: "African Art & Décor" },
  { key: "drums", label: "Culture band" },
  { key: "logo_mark", label: "Logo — header icon" },
  { key: "logo_full", label: "Logo — full (footer & intro)" },
] as const;
export type HomepageImageSlotKey = (typeof HOMEPAGE_IMAGE_SLOTS)[number]["key"];

/** Admin-only — assigns (or clears, when r2Key is null) one homepage slot to a
 * gallery photo without touching the other slots. Read-modify-write on the
 * single `homepage_images` JSON row. */
export const setHomepageImageSlot = createServerFn({ method: "POST" })
  .middleware([ownerOnlyMiddleware])
  .validator((data: { slot: HomepageImageSlotKey; r2Key: string | null }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    const row = await db
      .prepare("SELECT value FROM site_settings WHERE key = ?")
      .bind(KEYS.homepageImages)
      .first<{ value: string }>();
    const current: HomepageImages = row ? (JSON.parse(row.value) as HomepageImages) : {};
    current[data.slot] = data.r2Key;
    await db
      .prepare(
        "INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
      )
      .bind(KEYS.homepageImages, JSON.stringify(current))
      .run();
    return { ok: true as const };
  });
