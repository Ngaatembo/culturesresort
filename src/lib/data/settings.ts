import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./cf";
import { authMiddleware } from "@/lib/auth/functions";

export type BusinessInfo = {
  name: string;
  addressLine: string;
  addressShort: string;
  phoneDisplay: string;
  phoneHref: string;
  whatsappNumber: string;
  whatsappHref: string;
  email: string;
  emailAlt: string;
  mapsHref: string;
  mapsEmbedHref: string;
  tripadvisorHref: string;
};

export type SocialLinks = { facebook: string | null; instagram: string | null; tiktok: string | null };
export type OpeningHour = { day: string; hours: string };
export type VisitDetail = { label: string; value: string };

export type SiteSettings = {
  business: BusinessInfo;
  socialLinks: SocialLinks;
  openingHours: OpeningHour[];
  visitDetails: VisitDetail[];
  eventTypes: string[];
  eventRequirements: string[];
};

const KEYS = {
  business: "business",
  socialLinks: "social_links",
  openingHours: "opening_hours",
  visitDetails: "visit_details",
  eventTypes: "event_types",
  eventRequirements: "event_requirements",
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
      socialLinks: parse(KEYS.socialLinks, { facebook: null, instagram: null, tiktok: null }),
      openingHours: parse(KEYS.openingHours, []),
      visitDetails: parse(KEYS.visitDetails, []),
      eventTypes: parse(KEYS.eventTypes, []),
      eventRequirements: parse(KEYS.eventRequirements, []),
    };
  },
);

const SETTING_KEYS = new Set<string>(Object.values(KEYS));

/** Admin-only — overwrites one settings group at a time. */
export const updateSiteSetting = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { key: keyof typeof KEYS; value: unknown }) => data)
  .handler(async ({ data }) => {
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
    return { ok: true as const };
  });
