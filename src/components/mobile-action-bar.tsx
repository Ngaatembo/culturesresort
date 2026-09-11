import { Link } from "@tanstack/react-router";
import { CalendarHeart, MapPin, UtensilsCrossed } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { whatsappLink, whatsappMessages } from "@/lib/site-data";
import { useSiteSettings } from "@/lib/site-settings-query";

const itemClass =
  "flex flex-col items-center justify-center gap-1.5 py-3 text-[0.6rem] uppercase tracking-[0.16em] font-semibold text-bone/70 transition-colors";

/**
 * Four actions, not five — Order was dropped from the bar (still fully
 * available from the Menu page and desktop header; nothing was removed
 * from the site, just this shortcut) to match the site's own CTA
 * priority order: Reserve, Explore the menu, Get directions, WhatsApp.
 * One flat neutral bar background throughout — no solid red/green
 * blocks competing for attention — Reserve and WhatsApp are picked out
 * by icon colour only, which is enough to read as "the important one"
 * without the bar turning into two clashing colour blocks.
 */
export function MobileActionBar() {
  const { business } = useSiteSettings();

  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-[85] grid grid-cols-4 border-t border-bone/15 bg-ink"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <a
        href={business.mapsHref}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClass}
        aria-label="Get directions to Cultures Resort"
      >
        <MapPin className="h-5 w-5" aria-hidden="true" />
        Directions
      </a>
      <Link to="/menu" className={itemClass} activeProps={{ className: "!text-ochre" }}>
        <UtensilsCrossed className="h-5 w-5" aria-hidden="true" />
        Menu
      </Link>
      <Link to="/reservations" className={itemClass} activeProps={{ className: "!text-primary" }}>
        <CalendarHeart className="h-5 w-5 text-primary" aria-hidden="true" />
        Reserve
      </Link>
      <a
        href={whatsappLink(whatsappMessages.general, business.whatsappNumber)}
        target="_blank"
        rel="noreferrer"
        className={itemClass}
        aria-label="Chat with Cultures Resort on WhatsApp"
      >
        <WhatsAppIcon className="h-5 w-5 text-leaf" aria-hidden="true" />
        WhatsApp
      </a>
    </nav>
  );
}
