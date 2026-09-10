import { Link } from "@tanstack/react-router";
import { CalendarHeart, Home, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { useOrder } from "@/lib/order";
import { whatsappLink, whatsappMessages } from "@/lib/site-data";
import { useSiteSettings } from "@/lib/site-settings-query";

const itemClass =
  "flex flex-col items-center justify-center gap-1.5 py-3 text-[0.6rem] uppercase tracking-[0.16em] font-semibold";

export function MobileActionBar() {
  const { count, openDrawer } = useOrder();
  const { business } = useSiteSettings();

  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-[85] grid grid-cols-5 border-t border-bone/15 bg-ink text-bone/70 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Link
        to="/"
        activeOptions={{ exact: true }}
        className={itemClass}
        activeProps={{ className: "text-ochre" }}
      >
        <Home className="h-5 w-5" aria-hidden="true" />
        Home
      </Link>
      <Link to="/menu" className={itemClass} activeProps={{ className: "text-ochre" }}>
        <UtensilsCrossed className="h-5 w-5" aria-hidden="true" />
        Menu
      </Link>
      <button
        type="button"
        onClick={openDrawer}
        className={`${itemClass} relative`}
        aria-label="Open your enquiry list"
      >
        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
        Order
        {count > 0 ? (
          <span className="absolute right-3 top-2 grid h-5 min-w-5 place-items-center rounded-full bg-ochre px-1 text-[0.6rem] text-ink">
            {count}
          </span>
        ) : null}
      </button>
      <Link
        to="/reservations"
        className={`${itemClass} bg-primary text-primary-foreground`}
        activeProps={{ className: "bg-ember" }}
      >
        <CalendarHeart className="h-5 w-5" aria-hidden="true" />
        Reserve
      </Link>
      <a
        href={whatsappLink(whatsappMessages.general, business.whatsappNumber)}
        target="_blank"
        rel="noreferrer"
        className={`${itemClass} bg-leaf text-bone`}
        aria-label="Chat with Cultures Resort on WhatsApp"
      >
        <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
        WhatsApp
      </a>
    </nav>
  );
}
