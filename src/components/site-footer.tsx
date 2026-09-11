import { Link } from "@tanstack/react-router";
import { Facebook, Instagram } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { whatsappLink, whatsappMessages } from "@/lib/site-data";
import { useSiteSettings } from "@/lib/site-settings-query";
import logoMark from "@/assets/logo-mark.png";

/**
 * Simplified per the brand brief (Section 24): brand + tagline + contact,
 * then three action links (Reserve / Directions / WhatsApp), then social
 * icons, then copyright. Deliberately drops the old "Explore" sitemap
 * column — those links already live in the header and the mobile action
 * bar, and the brief calls for an elegant, spacious footer rather than a
 * third navigation surface repeating the same links.
 */
export function SiteFooter() {
  const { business, socialLinks } = useSiteSettings();
  return (
    <footer className="bg-ink text-bone">
      <div className="mx-auto max-w-3xl px-5 py-20 text-center lg:px-10 lg:py-28">
        <img
          src={logoMark}
          alt=""
          aria-hidden="true"
          width={56}
          height={56}
          className="mx-auto h-14 w-14 rounded-full"
        />
        <p className="mt-5 font-display text-3xl">Cultures Resort</p>
        <p className="mt-2 text-sm uppercase tracking-[0.16em] text-bone/60">
          Traditional African Restaurant
        </p>

        <address className="mt-8 space-y-1.5 text-sm not-italic leading-relaxed text-bone/75">
          <a
            href={business.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:text-ochre"
          >
            {business.addressLine}
          </a>
          <a href={business.phoneHref} className="block hover:text-ochre">
            {business.phoneDisplay}
          </a>
          <a href={`mailto:${business.email}`} className="block hover:text-ochre">
            {business.email}
          </a>
        </address>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/reservations" className="eyebrow bg-primary px-7 py-4 text-primary-foreground">
            Reserve a table
          </Link>
          <a
            href={business.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow border border-bone/30 px-7 py-4 hover:bg-bone/10"
          >
            Get directions
          </a>
          <a
            href={whatsappLink(whatsappMessages.general, business.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow flex items-center gap-2 border border-bone/30 px-7 py-4 hover:bg-bone/10"
          >
            <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </a>
        </div>

        <div className="mt-9 flex items-center justify-center gap-5">
          {socialLinks.instagram && (
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Cultures Resort on Instagram"
              className="hover:text-ochre"
            >
              <Instagram className="h-5 w-5" aria-hidden="true" />
            </a>
          )}
          {socialLinks.facebook && (
            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Cultures Resort on Facebook"
              className="hover:text-ochre"
            >
              <Facebook className="h-5 w-5" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-bone/10 px-5 py-6 text-center text-xs text-bone/45 lg:px-10">
        © {new Date().getFullYear()} Cultures Resort, Harare.
      </div>
    </footer>
  );
}
