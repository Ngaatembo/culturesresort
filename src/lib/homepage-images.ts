import { useSiteSettings } from "@/lib/site-settings-query";
import type { HomepageImages } from "@/lib/data/settings";

/**
 * Resolves one homepage "slot" (hero, garden, food, craft, drums) to either
 * the admin-assigned gallery photo (if one has been set for that slot in the
 * Media Library) or the original bundled photo, so every place that used to
 * hard-import a fixed asset can be repointed through the admin without a
 * code change or redeploy.
 */
export function resolveSlotImage(
  overrides: HomepageImages | undefined,
  slot: string,
  fallback: string,
): string {
  const key = overrides?.[slot];
  return key ? `/gallery-image/${key}` : fallback;
}

/** Component-friendly version of resolveSlotImage, reading from the same
 * cached site-settings query every page already shares. */
export function useSlotImage(slot: string, fallback: string): string {
  const { homepageImages } = useSiteSettings();
  return resolveSlotImage(homepageImages, slot, fallback);
}
