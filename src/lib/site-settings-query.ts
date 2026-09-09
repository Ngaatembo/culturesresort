import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSiteSettings } from "@/lib/data/settings";

/**
 * One shared query for business info / hours / visit details / event
 * options, used by every public component that used to statically import
 * these from site-data.ts. Prefetched in the root route's loader
 * (see __root.tsx) so there's no loading flash on first paint, and cached
 * so the ~15 consumers only trigger a single network request between them.
 */
export const siteSettingsQueryOptions = queryOptions({
  queryKey: ["site-settings"],
  queryFn: () => getSiteSettings(),
  staleTime: 60_000,
});

export function useSiteSettings() {
  return useSuspenseQuery(siteSettingsQueryOptions).data;
}
