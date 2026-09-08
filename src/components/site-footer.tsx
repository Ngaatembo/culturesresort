import { Link } from "@tanstack/react-router";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { business, navLinks, openingHours, whatsappLink, whatsappMessages } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-bone">
      <div className="pattern-band h-1.5 w-full" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-4 lg:px-10 lg:py-24">
        <div className="lg:col-span-2">
          <p className="font-display text-3xl">Cultures Resort</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-bone/70">
            A traditional African restaurant and cultural dining destination in Hillside, Harare.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/reservations" className="eyebrow bg-ochre px-5 py-3 text-ink">
              Reserve a table
            </Link>
            <a
              href={whatsappLink(whatsappMessages.general)}
              target="_blank"
              rel="noreferrer"
              className="eyebrow flex items-center gap-2 bg-leaf px-5 py-3 text-bone"
            >
              <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </a>
            <a href={business.phoneHref} className="eyebrow border border-bone/30 px-5 py-3">
              Call us
            </a>
            <a
              href={business.mapsHref}
              target="_blank"
              rel="noreferrer"
              className="eyebrow border border-bone/30 px-5 py-3"
            >
              Get directions
            </a>
          </div>
        </div>

        <div>
          <h2 className="eyebrow text-ochre">Find us</h2>
          <address className="mt-5 space-y-3 text-sm not-italic leading-relaxed text-bone/80">
            <a href={business.mapsHref} target="_blank" rel="noreferrer" className="block hover:text-ochre">
              {business.addressLine}
            </a>
            <a href={business.phoneHref} className="block hover:text-ochre">
              {business.phoneDisplay}
            </a>
            <a href={`mailto:${business.email}`} className="block break-all hover:text-ochre">
              {business.email}
            </a>
          </address>
          <h2 className="eyebrow mt-8 text-ochre">Opening hours</h2>
          <ul className="mt-4 space-y-1 text-sm text-bone/70">
            {openingHours.slice(0, 3).map((h) => (
              <li key={h.day} className="flex justify-between gap-4">
                <span>{h.day}</span>
                <span>{h.hours}</span>
              </li>
            ))}
            <li>
              <Link to="/contact" className="text-ochre hover:underline">
                Full hours
              </Link>
            </li>
          </ul>
        </div>

        <nav aria-label="Footer">
          <h2 className="eyebrow text-ochre">Explore</h2>
          <ul className="mt-5 space-y-3 text-sm text-bone/80">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-ochre">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/reservations" className="hover:text-ochre">
                Reservations
              </Link>
            </li>
            <li>
              <Link to="/admin" className="text-bone/50 hover:text-ochre">
                Owner dashboard
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-bone/10 px-5 py-6 text-center text-xs text-bone/50 lg:px-10">
        © {new Date().getFullYear()} Cultures Resort, Harare. Photography shown is placeholder imagery pending the
        restaurant's own photographs.
      </div>
    </footer>
  );
}
