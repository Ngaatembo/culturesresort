import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
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
        content: "A traditional African restaurant built around shared food, craft and open air in Harare.",
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
        imageAlt="Carved wooden mask, woven basket and clay pot against an earth wall"
      />

      <section className="grain bg-background py-20 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-12 lg:px-10">
          <Reveal className="lg:col-span-7">
            <div className="space-y-7 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p className="font-display text-2xl leading-snug text-foreground sm:text-3xl">
                We wanted somewhere African food could be served the way it is served at home — generously, slowly,
                and in the open air.
              </p>
              <p>
                Cultures Resort stands on the corner of Chiremba and Southey Road, on the Hillside side of Harare. The
                grounds were shaped as much by the trees already growing there as by any plan: seating follows shade,
                the fire sits where the smoke can lift, and guests move between the two as the day cools.
              </p>
              <p>
                The kitchen works with traditional recipes and traditional drinks. Nothing is rushed to the table
                before it is ready. Around it, carved wood, woven fibre and hand-dyed cloth from across the continent
                are part of the fabric of the place, not decoration added afterwards.
              </p>
              <p className="border-l-2 border-ochre pl-6 text-foreground">
                This section is written as an honest placeholder. The owner's own history, founding year and family
                story can be added from the dashboard — we haven't invented dates or claims.
              </p>
            </div>
          </Reveal>

          <Reveal delay={140} className="lg:col-span-4 lg:col-start-9">
            <div className="border border-border bg-card p-8">
              <p className="eyebrow rule-ochre text-primary">What we hold to</p>
              <ul className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
                <li>
                  <strong className="block font-display text-lg text-foreground">Traditional cooking</strong>
                  African dishes prepared the long way.
                </li>
                <li>
                  <strong className="block font-display text-lg text-foreground">Open ground</strong>
                  Garden seating, shade and fire rather than a dining room.
                </li>
                <li>
                  <strong className="block font-display text-lg text-foreground">Craft on show</strong>
                  African art and handmade objects throughout.
                </li>
                <li>
                  <strong className="block font-display text-lg text-foreground">Room for everyone</strong>
                  Family-friendly, unhurried, sociable.
                </li>
              </ul>
              <Link to="/reservations" className="eyebrow mt-8 inline-block bg-primary px-6 py-4 text-primary-foreground">
                Reserve a table
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-clay py-20 text-bone lg:py-28">
        <div className="mx-auto max-w-3xl px-5 text-center lg:px-10">
          <Reveal>
            <blockquote className="font-display text-[clamp(1.6rem,4vw,2.6rem)] italic leading-tight">
              A meal here is meant to take the afternoon.
            </blockquote>
            <Link to="/experience" className="eyebrow mt-10 inline-block border border-bone/40 px-7 py-4">
              See the experience
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
