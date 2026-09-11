import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { ExperienceGrid } from "@/components/experience-grid";
import { images } from "@/lib/gallery";

export const Route = createFileRoute("/our-story")({
  head: () => ({
    meta: [
      { title: "Our Story | Cultures Resort, Harare" },
      {
        name: "description",
        content:
          "How Cultures Resort became a traditional African dining and cultural destination in Hillside, Harare — food, craft, garden and hospitality.",
      },
      { property: "og:title", content: "Our Story | Cultures Resort" },
      {
        property: "og:description",
        content:
          "A traditional African restaurant built around shared food, craft and open air in Harare.",
      },
    ],
  }),
  component: OurStory,
});

function OurStory() {
  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title="Built around a table, not a trend"
        intro="Cultures Resort is a traditional African restaurant in Hillside, Harare — a place for food, craft and company."
        image={images.craft}
        imageAlt="A staff member hand-painting a buffalo mural on the brick wall of the dining pavilion"
      />

      <section className="grain bg-background py-20 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-12 lg:px-10">
          <Reveal className="lg:col-span-7">
            <div className="space-y-7 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p className="font-display text-2xl leading-snug text-foreground sm:text-3xl">
                We wanted somewhere African food could be served the way it is served at home —
                generously, slowly, and in the open air.
              </p>
              <p>
                Cultures Resort stands on the corner of Chiremba and Southey Road, on the Hillside
                side of Harare. The grounds were shaped as much by the trees already growing there
                as by any plan: seating follows shade, the fire sits where the smoke can lift, and
                guests move between the two as the day cools.
              </p>
              <p>
                The kitchen works with traditional recipes and traditional drinks. Nothing is rushed
                to the table before it is ready. Around it, carved wood, woven fibre and hand-dyed
                cloth from across the continent are part of the fabric of the place, not decoration
                added afterwards.
              </p>
              <p className="border-l-2 border-ochre pl-6 text-foreground">
                Established in 2018, Cultures Resort brings traditional African food, hospitality
                and culture together in a relaxed outdoor setting in Harare.
              </p>
            </div>
          </Reveal>

          <Reveal delay={140} className="lg:col-span-4 lg:col-start-9">
            <div className="border border-border bg-card p-8">
              <p className="eyebrow rule-ochre text-primary">What we hold to</p>
              <ul className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
                <li>
                  <strong className="block font-display text-lg text-foreground">
                    Traditional African Food
                  </strong>
                  African dishes prepared with care, tradition and time.
                </li>
                <li>
                  <strong className="block font-display text-lg text-foreground">
                    Open-Air Experience
                  </strong>
                  Garden seating, shade, fire and nature instead of an ordinary dining room.
                </li>
                <li>
                  <strong className="block font-display text-lg text-foreground">
                    Culture &amp; Craft
                  </strong>
                  African art, handmade objects and cultural details throughout the experience.
                </li>
                <li>
                  <strong className="block font-display text-lg text-foreground">
                    African Hospitality
                  </strong>
                  A welcoming space created for family, friends and shared experiences.
                </li>
              </ul>
              <Link
                to="/reservations"
                className="eyebrow mt-8 inline-block bg-primary px-6 py-4 text-primary-foreground"
              >
                Reserve a table
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Food Experience */}
      <section className="bg-secondary py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <Reveal className="max-w-2xl">
            <p className="eyebrow rule-ochre text-primary">The kitchen</p>
            <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3rem)] leading-tight">
              Food with a story.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Traditional African flavours, prepared with care and served as part of the Cultures
              experience.
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Reveal className="col-span-2 row-span-2 overflow-hidden rounded-2xl">
              <img
                src={images.food}
                alt="A grilled meat platter with rosemary garnish, served in the evening garden"
                loading="lazy"
                className="h-full min-h-64 w-full object-cover object-bottom sm:min-h-full"
              />
            </Reveal>
            <Reveal delay={90} className="overflow-hidden rounded-2xl">
              <img
                src={images.goatChopsPlate}
                alt="Grilled goat chops served on a plate"
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </Reveal>
            <Reveal delay={140} className="overflow-hidden rounded-2xl">
              <img
                src={images.porkSizzler}
                alt="Sizzling grilled pork served on a hot plate with tomato and onion"
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </Reveal>
            <Reveal delay={190} className="overflow-hidden rounded-2xl">
              <img
                src={images.sadzaPlate}
                alt="Sadza and covo served on a white plate at an outdoor wooden table"
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </Reveal>
            <Reveal delay={240} className="overflow-hidden rounded-2xl">
              <img
                src={images.traditionalDrinkPouring}
                alt="Staff pouring a traditional drink from a large clay pot into ceramic cups"
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </Reveal>
          </div>
          <Reveal delay={280}>
            <Link to="/menu" className="eyebrow mt-8 inline-block border-b border-primary pb-2 text-primary">
              See the full menu →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* The Cultures Experience */}
      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <Reveal className="max-w-2xl">
            <p className="eyebrow rule-ochre text-primary">Beyond the table</p>
            <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3rem)] leading-tight">
              The Cultures Experience
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              More than a restaurant — a garden, a gallery of African craft and a place built for
              spending the afternoon.
            </p>
          </Reveal>
          <div className="mt-12">
            <ExperienceGrid />
          </div>
        </div>
      </section>

      <section className="bg-clay py-20 text-bone lg:py-28">
        <div className="mx-auto max-w-3xl px-5 text-center lg:px-10">
          <Reveal>
            <blockquote className="font-display text-[clamp(1.6rem,4vw,2.6rem)] italic leading-tight">
              A meal here is meant to take the afternoon.
            </blockquote>
            <Link
              to="/experience"
              className="eyebrow mt-10 inline-block border border-bone/40 px-7 py-4"
            >
              See the experience
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
