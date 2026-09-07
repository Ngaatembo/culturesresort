import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { images } from "@/lib/gallery";
import { business, menu } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu | Traditional African Dishes at Cultures Resort" },
      {
        name: "description",
        content:
          "Traditional African plates, open-fire grills, sides, relishes and traditional drinks at Cultures Resort in Hillside, Harare. Call +263 77 295 1308 for today's dishes.",
      },
      { property: "og:title", content: "Menu | Cultures Resort, Harare" },
      {
        property: "og:description",
        content: "Traditional African cooking, served family style in a Harare garden.",
      },
    ],
  }),
  component: Menu,
});

function Menu() {
  const [active, setActive] = useState<string>("all");
  const shown = active === "all" ? menu : menu.filter((c) => c.slug === active);

  return (
    <>
      <PageHeader
        eyebrow="The menu"
        title="Traditional plates, served family style"
        intro="The structure below mirrors the kitchen. Dish names and prices are placeholders until the restaurant's own menu is loaded — please call to confirm what is cooking today."
        image={images.food}
        imageAlt="Traditional African dishes in carved wooden and clay bowls"
      />

      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Menu categories">
            <button
              type="button"
              role="tab"
              aria-selected={active === "all"}
              onClick={() => setActive("all")}
              className={cn(
                "eyebrow border px-5 py-3 transition-colors",
                active === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary",
              )}
            >
              All
            </button>
            {menu.map((c) => (
              <button
                key={c.slug}
                type="button"
                role="tab"
                aria-selected={active === c.slug}
                onClick={() => setActive(c.slug)}
                className={cn(
                  "eyebrow border px-5 py-3 transition-colors",
                  active === c.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-secondary",
                )}
              >
                {c.title}
              </button>
            ))}
          </div>

          <div className="mt-16 space-y-20">
            {shown.map((category) => (
              <Reveal as="section" key={category.slug}>
                <div className="grid gap-3 border-b border-border pb-6 sm:flex sm:items-end sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-display text-[clamp(1.7rem,3.5vw,2.5rem)]">{category.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{category.intro}</p>
                  </div>
                  <p className="eyebrow shrink-0 text-muted-foreground">{category.items.length} dishes</p>
                </div>

                <ul className="mt-8 grid gap-x-14 gap-y-8 lg:grid-cols-2">
                  {category.items.map((item) => (
                    <li key={item.name} className="border-b border-dashed border-border pb-6">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4">
                        <h3 className="min-w-0 font-display text-xl">
                          {item.name}
                          {item.featured ? (
                            <span className="eyebrow ml-3 align-middle text-ochre">Signature</span>
                          ) : null}
                        </h3>
                        <span className="shrink-0 text-sm text-muted-foreground">{item.price}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-20 border border-border bg-secondary p-8 lg:p-12">
            <p className="eyebrow rule-ochre text-primary">Please note</p>
            <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
              Prices are not published here yet, and dish availability changes with the season and the day. Call the
              restaurant for current dishes and pricing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={business.phoneHref} className="eyebrow bg-primary px-7 py-4 text-primary-foreground">
                Call {business.phoneDisplay}
              </a>
              <Link to="/reservations" className="eyebrow border border-border px-7 py-4">
                Reserve a table
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
