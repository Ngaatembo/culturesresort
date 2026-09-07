import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { images } from "@/lib/gallery";
import { experiences } from "@/lib/site-data";

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: "The Experience | Garden Dining & Culture at Cultures Resort" },
      {
        name: "description",
        content:
          "Garden seating, open-fire cooking, African art and an unhurried, family-friendly atmosphere at Cultures Resort in Hillside, Harare.",
      },
      { property: "og:title", content: "The Experience | Cultures Resort, Harare" },
      {
        property: "og:description",
        content: "Open air, open fire, African craft and a table worth staying at.",
      },
    ],
  }),
  component: Experience;
});

function Experience() {
  return (
    <>
      <PageHeader
        eyebrow="The experience"
        title="Open air, open fire, open afternoon"
        intro="What the grounds feel like, and how a visit tends to unfold."
        image={images.garden}
        imageAlt="Garden tables under trees lit with lanterns at dusk"
      />

      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="space-y-px border border-border bg-border">
            {experiences.map((e, i) => (
              <Reveal key={e.title} delay={i * 80} className="grid gap-6 bg-card p-8 lg:grid-cols-12 lg:p-14">
                <p className="eyebrow text-ochre lg:col-span-2">0{i + 1}</p>
                <h2 className="font-display text-[clamp(1.6rem,3vw,2.25rem)] leading-tight lg:col-span-4">
                  {e.title}
                </h2>
                <p className="leading-relaxed text-muted-foreground lg:col-span-6">{e.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-clay text-bone">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="min-h-[50vh]">
            <img
              src={images.drums}
              alt="Drummer and dancers performing beside a fire in the courtyard"
              width={1600}
              height={1067}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="px-5 py-16 lg:px-14 lg:py-28">
            <Reveal>
              <p className="eyebrow text-ochre">Atmosphere</p>
              <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3rem)] leading-tight">
                A social place, not a quiet one
              </h2>
              <p className="mt-6 max-w-md leading-relaxed text-bone/75">
                Evenings tend to be livelier than afternoons. Cultural performances and live entertainment are part of
                the character of the place — schedules are not published here because they vary, so call ahead if you
                are coming for a particular night.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link to="/events" className="eyebrow bg-ochre px-7 py-4 text-ink">
                  Events & functions
                </Link>
                <Link to="/gallery" className="eyebrow border border-bone/40 px-7 py-4">
                  Gallery
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="grain bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-5 text-center lg:px-10">
          <Reveal>
            <p className="eyebrow text-primary">Plan your visit</p>
            <h2 className="mt-6 font-display text-[clamp(1.9rem,4vw,3rem)] leading-tight">
              Bring the family. Bring time.
            </h2>
            <Link to="/reservations" className="eyebrow mt-10 inline-block bg-primary px-8 py-5 text-primary-foreground">
              Reserve a table
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
