import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/reveal";
import { ExperienceGrid } from "@/components/experience-grid";
import { business, menu } from "@/lib/site-data";
import { images } from "@/lib/gallery";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cultures Resort | Traditional African Restaurant in Harare" },
      {
        name: "description",
        content:
          "Traditional African cuisine, garden dining and cultural atmosphere at the corner of Chiremba and Southey Road, Hillside, Harare. Reserve a table or call +263 77 295 1308.",
      },
      { property: "og:title", content: "Cultures Resort | Traditional African Dining in Harare" },
      {
        property: "og:description",
        content: "More than a meal — an experience of Africa, in Hillside, Harare.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[92svh] items-end overflow-hidden">
        <img
          src={images.garden}
          alt="Long wooden tables set under trees, lit by lanterns and an open fire at dusk"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/35" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-32 text-bone lg:px-10 lg:pb-24">
          <Reveal>
            <p className="eyebrow text-ochre">Hillside · Harare · Zimbabwe</p>
            <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.95]">
              More than a meal.
              <span className="block italic text-ochre">An experience of Africa.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-bone/80 sm:text-lg">
              Traditional African cooking served in an open garden, among carved wood, woven fibre
              and open flame.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/reservations"
                className="eyebrow bg-ochre px-8 py-5 text-center text-ink transition-colors hover:bg-bone"
              >
                Reserve a table
              </Link>
              <a
                href={business.mapsHref}
                target="_blank"
                rel="noreferrer"
                className="eyebrow border border-bone/40 px-8 py-5 text-center transition-colors hover:bg-bone/10"
              >
                Get directions
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Intro */}
      <section className="grain bg-background py-20 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-12 lg:px-10">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow rule-ochre text-primary">Our table</p>
            <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3.25rem)] leading-tight">
              A place to eat, relax and spend time together
            </h2>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-6 lg:col-start-7">
            <div className="space-y-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                Cultures Resort sits on the corner of Chiremba and Southey Road in Hillside, Harare.
                It was built around a simple idea: that African food is best shared slowly,
                outdoors, with people you like.
              </p>
              <p>
                The kitchen cooks traditional dishes. The grounds hold African art, handcrafted
                objects and shade trees. Families come for lunch and stay through the afternoon.
              </p>
              <Link
                to="/our-story"
                className="eyebrow inline-block border-b border-primary pb-2 text-primary"
              >
                Read our story
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Food */}
      <section className="bg-clay text-bone">
        <div className="mx-auto grid max-w-7xl items-stretch lg:grid-cols-2">
          <div className="order-2 px-5 py-16 lg:order-1 lg:px-14 lg:py-28">
            <Reveal>
              <p className="eyebrow text-ochre">The kitchen</p>
              <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3.25rem)] leading-tight">
                Traditional plates, cooked without hurry
              </h2>
              <p className="mt-6 max-w-md leading-relaxed text-bone/75">
                Slow-cooked relishes, grains, greens and meat from the open fire — served family
                style on wood and clay.
              </p>
              <ul className="mt-10 space-y-4 border-t border-bone/15 pt-8">
                {menu.slice(0, 4).map((c) => (
                  <li key={c.slug} className="flex items-baseline justify-between gap-6 text-sm">
                    <span className="font-display text-xl">{c.title}</span>
                    <span className="text-bone/50">{c.items.length} dishes</span>
                  </li>
                ))}
              </ul>
              <Link to="/menu" className="eyebrow mt-10 inline-block bg-ochre px-7 py-4 text-ink">
                View the menu
              </Link>
            </Reveal>
          </div>
          <div className="order-1 min-h-[50vh] lg:order-2">
            <img
              src={images.food}
              alt="Traditional African dishes served in carved wooden and clay bowls"
              width={1600}
              height={1200}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="bg-background py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <Reveal>
            <p className="eyebrow rule-ochre text-primary">The experience</p>
            <h2 className="mt-6 max-w-2xl font-display text-[clamp(2rem,4vw,3.25rem)] leading-tight">
              Four things people come back for
            </h2>
          </Reveal>
          <div className="mt-14">
            <ExperienceGrid />
          </div>
          <Reveal className="mt-12">
            <Link
              to="/experience"
              className="eyebrow inline-block border-b border-primary pb-2 text-primary"
            >
              Explore the grounds
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Culture band */}
      <section className="relative overflow-hidden">
        <img
          src={images.drums}
          alt="Drummer and dancers performing beside a fire in the courtyard"
          width={1600}
          height={1067}
          loading="lazy"
          className="h-[70svh] w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center bg-ink/60">
          <div className="mx-auto w-full max-w-7xl px-5 text-bone lg:px-10">
            <Reveal>
              <p className="eyebrow text-ochre">Culture</p>
              <blockquote className="mt-6 max-w-2xl font-display text-[clamp(1.8rem,4vw,3rem)] italic leading-tight">
                Food, music, craft and company — held in one place.
              </blockquote>
              <Link
                to="/gallery"
                className="eyebrow mt-9 inline-block border border-bone/40 px-7 py-4"
              >
                See the gallery
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Visit */}
      <section className="grain bg-secondary py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-3 lg:px-10">
          <Reveal>
            <p className="eyebrow rule-ochre text-primary">Visit</p>
            <h2 className="mt-6 font-display text-3xl leading-tight">
              Come and find us in Hillside
            </h2>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-2">
            <dl className="grid gap-8 sm:grid-cols-3">
              <div>
                <dt className="eyebrow text-muted-foreground">Address</dt>
                <dd className="mt-3">
                  <a
                    href={business.mapsHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm leading-relaxed hover:text-primary"
                  >
                    {business.addressLine}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-muted-foreground">Phone</dt>
                <dd className="mt-3">
                  <a href={business.phoneHref} className="text-sm hover:text-primary">
                    {business.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-muted-foreground">Email</dt>
                <dd className="mt-3">
                  <a
                    href={`mailto:${business.email}`}
                    className="break-all text-sm hover:text-primary"
                  >
                    {business.email}
                  </a>
                </dd>
              </div>
            </dl>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/reservations"
                className="eyebrow bg-primary px-7 py-4 text-primary-foreground"
              >
                Reserve a table
              </Link>
              <a
                href={business.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="eyebrow border border-border px-7 py-4"
              >
                WhatsApp us
              </a>
              <Link to="/events" className="eyebrow border border-border px-7 py-4">
                Enquire about an event
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
