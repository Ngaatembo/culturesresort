import { Link } from "@tanstack/react-router";
import { ExternalLink, Facebook, Instagram } from "lucide-react";
import { TikTokIcon } from "@/components/tiktok-icon";
import { XIcon } from "@/components/x-icon";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { navLinks, whatsappLink, whatsappMessages } from "@/lib/site-data";
import { useSiteSettings } from "@/lib/site-settings-query";
import logoMark from "@/assets/logo-mark.png";

export function SiteFooter() {
  const { business, socialLinks } = useSiteSettings();
  return (
    <footer className="bg-ink text-bone">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-3 lg:px-10 lg:py-28">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <img
              src={logoMark}
              alt=""
              aria-hidden="true"
              width={52}
              height={52}
              className="h-[52px] w-[52px] shrink-0 rounded-full"
            />
            <p className="font-display text-4xl">Cultures Resort</p>
          </div>
          <p className="mt-5 max-w-xs leading-relaxed text-bone/65">
            A traditional African restaurant and cultural dining destination in Hillside, Harare.
          </p>
          <Link
            to="/reservations"
            className="eyebrow mt-8 inline-block bg-primary px-7 py-4 text-primary-foreground"
          >
            Reserve a table →
          </Link>
        </div>

        <address className="not-italic lg:col-span-1">
          <h2 className="eyebrow text-ochre">Contact</h2>
          <div className="mt-5 space-y-2 text-sm leading-relaxed text-bone/75">
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
            <a href={`mailto:${business.email}`} className="block break-all hover:text-ochre">
              {business.email}
            </a>
            <Link to="/contact" className="inline-block pt-1 text-ochre hover:underline">
              Full hours →
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <a
              href={whatsappLink(whatsappMessages.general, business.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Cultures Resort"
              className="hover:text-ochre"
            >
              <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={business.tripadvisorHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Cultures Resort on TripAdvisor"
              className="hover:text-ochre"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
            {socialLinks.facebook && (
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Cultures Resort on Facebook"
                className="hover:text-ochre"
              >
                <Facebook className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Cultures Resort on Instagram"
                className="hover:text-ochre"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            {socialLinks.tiktok && (
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Cultures Resort on TikTok"
                className="hover:text-ochre"
              >
                <TikTokIcon className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            {socialLinks.x && (
              <a
                href={socialLinks.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Cultures Resort on X"
                className="hover:text-ochre"
              >
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>
        </address>

        <nav aria-label="Footer" className="lg:col-span-1">
          <h2 className="eyebrow text-ochre">Explore</h2>
          <ul className="mt-5 space-y-2 text-sm text-bone/75">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-ochre">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-bone/10 px-5 py-6 text-center text-xs text-bone/45 lg:px-10">
        © {new Date().getFullYear()} Cultures Resort, Harare.
      </div>
    </footer>
  );
}
