import { queryOptions, useQuery } from "@tanstack/react-query";
import { getSiteSettings, type SiteSettings } from "@/lib/data/settings";
import {
  business,
  eventRequirements,
  eventTypes,
  openingHours,
  socialLinks,
  visitDetails,
} from "@/lib/site-data";

/**
 * Hard-coded fallback matching the original static site-data.ts values.
 * If the database read ever fails for any reason (table not migrated
 * yet, D1 hiccup, anything) the site must keep working with these
 * instead of crashing — a header/footer component used on every single
 * page is the worst possible place for an unhandled fetch failure to
 * live, since it takes the whole site down rather than one page.
 */
const FALLBACK_SETTINGS: SiteSettings = {
  business,
  socialLinks,
  openingHours,
  visitDetails,
  eventTypes: [...eventTypes],
  eventRequirements: [...eventRequirements],
  closureBanner: { enabled: false, message: "" },
  notifications: { enabled: false, email: "" },
};

/**
 * One shared query for business info / hours / visit details / event
 * options, used by every public component that used to statically import
 * these from site-data.ts. Prefetched (best-effort) in the root route's
 * loader so there's usually no loading flash, and cached so the ~15
 * consumers only trigger a single network request between them.
 *
 * Deliberately a plain query, not useSuspenseQuery — a suspense query
 * throws on error, and since this is read from the header/footer that
 * wrap every page, a thrown error here would crash the entire site
 * instead of degrading gracefully to the fallback below.
 */
export const siteSettingsQueryOptions = queryOptions({
  queryKey: ["site-settings"],
  queryFn: () => getSiteSettings(),
  staleTime: 60_000,
  retry: 1,
});

export function useSiteSettings(): SiteSettings {
  const { data } = useQuery(siteSettingsQueryOptions);
  return data ?? FALLBACK_SETTINGS;
}
