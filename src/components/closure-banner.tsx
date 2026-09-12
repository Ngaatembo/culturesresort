import { AlertTriangle } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings-query";

/**
 * A thin site-wide bar for temporary closures or holiday notices — only
 * rendered at all when an admin has switched it on from Settings. Sits
 * above the header so it's the first thing a visitor sees, on every page.
 */
export function ClosureBanner() {
  const { closureBanner } = useSiteSettings();
  if (!closureBanner?.enabled || !closureBanner.message) return null;

  return (
    <div className="sticky top-16 z-40 flex items-center justify-center gap-2 bg-primary px-4 py-2.5 text-center text-sm text-primary-foreground lg:top-[4.75rem]">
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{closureBanner.message}</p>
    </div>
  );
}
