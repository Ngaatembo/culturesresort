import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { images } from "@/lib/gallery";
import { useOrder } from "@/lib/order";
import { beverages, business, menu, visitDetails } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu & Beverages | Traditional African Food, Cultures Resort" },
      {
        name: "description",
        content:
          "Traditional African plates, open-fire grills, sides, snacks and a full beverage list at Cultures Resort in Hillside, Harare. Call +263 77 295 1308 for today's dishes.",
      },
      { property: "og:title", content: "Menu & Beverages | Cultures Resort, Harare" },
      {
        property: "og:description",
        content: "Traditional African cooking and drinks, served family style in a Harare garden.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Menu,
});

type Course = "food" | "beverages";

function Menu() {
  const [course, setCourse] = useState<Course>("food");
  const [active, setActive] = useState<string>("all");
  const { add, has } = useOrder();

  const categories = course === "food" ? menu : beverages;
  const shown = active === "all" ? categories : categories.filter((c) => c.slug === active);

  const switchCourse = (next: Course) => {
    setCourse(next);
    setActive("all");
  };

  return (
    <>
      <PageHeader
        eyebrow="Food & beverages"
        title="Traditional plates, served family style"
        intro="The structure below mirrors the kitchen and the bar. Dish and drink names, along with prices, are placeholders until the restaurant's own lists are loaded — please call to confirm what is being served today."
        image={images.food}
        imageAlt="Traditional African dishes in carved wooden and clay bowls"
      />

      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="flex flex-wrap items-center gap-3 border-b border-border pb-6">
            {(["food", "beverages"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => switchCourse(c)}
                aria-pressed={course === c}
                className={cn(
                  "font-display text-[clamp(1.5rem,3vw,2.1rem)] transition-colors",
                  course === c ? "text-foreground underline decoration-ochre decoration-2 underline-offset-8" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {c === "food" ? "Food" : "Beverages"}
              </button>
            ))}
            <span className="eyebrow ml-auto text-muted-foreground">Placeholder list · owner editable</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Menu categories">
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
            {categories.map((c) => (
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
                  <p className="eyebrow shrink-0 text-muted-foreground">
                    {category.items.length} {course === "food" ? "dishes" : "drinks"}
                  </p>
                </div>

                <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {category.items.map((item) => {
                    const id = `${category.slug}:${item.name}`;
                    return (
                      <li key={item.name} className="flex flex-col border border-border bg-card">
                        <span className="block aspect-[4/3] overflow-hidden bg-secondary">
                          <img
                            src={images[item.imageKey ?? category.imageKey]}
                            alt={`Placeholder image for ${item.name}`}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col p-5">
                          <span className="eyebrow text-ochre">{category.title}</span>
                          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
                            <h3 className="min-w-0 font-display text-xl leading-tight">{item.name}</h3>
                            <span className="shrink-0 text-sm text-muted-foreground">{item.price}</span>
                          </div>
                          {item.featured ? <span className="eyebrow mt-2 text-primary">Signature</span> : null}
                          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>
                          <button
                            type="button"
                            onClick={() => add({ id, name: item.name, category: category.title, price: item.price })}
                            className="eyebrow mt-5 border border-border px-4 py-3 transition-colors hover:bg-secondary"
                          >
                            {has(id) ? "Added — add another" : "Add to enquiry"}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-20 grid gap-10 border border-border bg-secondary p-8 lg:grid-cols-2 lg:p-12">
            <div>
              <p className="eyebrow rule-ochre text-primary">Please note</p>
              <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
                Prices are not published here yet, and availability changes with the season and the day. Call the
                restaurant for current dishes, drinks and pricing.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={business.phoneHref} className="eyebrow bg-primary px-7 py-4 text-primary-foreground">
                  Call {business.phoneDisplay}
                </a>
                <a
                  href={business.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="eyebrow border border-border px-7 py-4"
                >
                  WhatsApp us
                </a>
                <Link to="/reservations" className="eyebrow border border-border px-7 py-4">
                  Reserve a table
                </Link>
              </div>
            </div>
            <div>
              <p className="eyebrow rule-ochre text-primary">Good to know</p>
              <dl className="mt-6 space-y-3 text-sm">
                {visitDetails.map((d) => (
                  <div key={d.label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-border pb-3">
                    <dt className="text-muted-foreground">{d.label}</dt>
                    <dd className="shrink-0 text-foreground">{d.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">
                These answers are not confirmed yet — please ask when you call.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
