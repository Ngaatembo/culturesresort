import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { whatsappLink, whatsappMessages } from "@/lib/site-data";

/**
 * Persistent WhatsApp button. Always visible on larger screens; on mobile the
 * fixed bottom action bar carries the same one-tap WhatsApp action.
 */
export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink(whatsappMessages.general)}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Cultures Resort on WhatsApp"
      className="group fixed bottom-6 right-6 z-[80] hidden items-center gap-3 bg-leaf py-4 pl-4 pr-5 text-bone shadow-lift transition-transform duration-300 hover:-translate-y-0.5 lg:flex"
    >
      <WhatsAppIcon className="h-6 w-6 shrink-0" />
      <span className="eyebrow">Chat on WhatsApp</span>
      <span
        className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-ochre"
        aria-hidden="true"
      />
    </a>
  );
}
