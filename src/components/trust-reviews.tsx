import { ExternalLink, Facebook, Instagram, MapPin, Star } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { business, socialLinks } from "@/lib/site-data";

/**
 * External, verifiable trust links only. No rating or review count is
 * hard-coded here — a number baked into the code goes stale the moment
 * a new review comes in, so the CTA sends people to the real review
 * pages instead of quoting a figure the site can't keep accurate.
 *
 * Facebook / Instagram buttons render only once socialLinks.* is filled
 * in with a confirmed URL — see src/lib/site-data.ts. Never add a guessed
 * handle here.
 *
 * Rendered as a continuation of the homepage's "What guests say" section
 * (see routes/index.tsx) rather than its own section, so reviews reads
 * as one block instead of two back-to-back sections about the same topic.
 */
export function TrustReviews() {
  const socials = [
    { key: "facebook", href: socialLinks.facebook, label: "Follow on Facebook", Icon: Facebook },
    {
      key: "instagram",
      href: socialLinks.instagram,
      label: "Follow on Instagram",
      Icon: Instagram,
    },
  ].filter((s): s is typeof s & { href: string } => Boolean(s.href));

  return (
    <>
      <Reveal delay={80} className="mt-14 grid gap-4 sm:grid-cols-3">
        <a
          href={business.mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col justify-between gap-6 border border-border bg-background p-7 transition-colors hover:border-primary"
        >
          <div className="flex items-start justify-between">
            <Star className="h-6 w-6 text-ochre" aria-hidden="true" />
            <ExternalLink
              className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="font-display text-lg leading-tight">Read our Google reviews</p>
            <p className="mt-2 text-sm text-muted-foreground">
              See what guests are saying, straight from Google.
            </p>
          </div>
        </a>

        <a
          href={business.tripadvisorHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col justify-between gap-6 border border-border bg-background p-7 transition-colors hover:border-primary"
        >
          <div className="flex items-start justify-between">
            <Star className="h-6 w-6 text-ochre" aria-hidden="true" />
            <ExternalLink
              className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="font-display text-lg leading-tight">Read our TripAdvisor reviews</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Our listing on TripAdvisor, for visitors planning ahead.
            </p>
          </div>
        </a>

        <a
          href={business.mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col justify-between gap-6 border border-border bg-background p-7 transition-colors hover:border-primary"
        >
          <div className="flex items-start justify-between">
            <MapPin className="h-6 w-6 text-ochre" aria-hidden="true" />
            <ExternalLink
              className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="font-display text-lg leading-tight">Get directions</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Corner Chiremba &amp; Southey Road, Hillside, Harare.
            </p>
          </div>
        </a>
      </Reveal>

      {socials.length > 0 && (
        <Reveal delay={140} className="mt-8 flex flex-wrap gap-3">
          {socials.map(({ key, href, label, Icon }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow inline-flex items-center gap-2 border border-border px-5 py-3 transition-colors hover:border-primary hover:text-primary"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </a>
          ))}
        </Reveal>
      )}
    </>
  );
}
