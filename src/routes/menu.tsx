import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { DishMedia } from "@/components/dish-media";
import { Reveal } from "@/components/reveal";
import { images } from "@/lib/gallery";
import { useOrder } from "@/lib/order";
import { getMenu, type MenuCategoryOut, type MenuKind } from "@/lib/data/menu";
import { dishPhotos } from "@/lib/dish-photos";
import { useSiteSettings } from "@/lib/site-settings-query";
import cocktailPourLoop from "@/assets/video/cocktail-pour-loop.mp4";
import cocktailPoster from "@/assets/cocktail-poster.jpg";
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

/** Category slug -> placeholder photo, until the restaurant supplies real photography. */
const CATEGORY_IMAGE: Record<string, keyof typeof images> = {
  starters: "craft",
  "main-meals": "food",
  grills: "garden",
  sides: "food",
  "traditional-drinks": "traditionalDrinkPouring",
  cocktails: "drums",
  "soft-drinks": "gardenGuestsDaytime",
};

type Course = MenuKind;

function Menu() {
  const { business, visitDetails } = useSiteSettings();
  const [course, setCourse] = useState<Course>("food");
  const [active, setActive] = useState<string>("all");
  const [menuData, setMenuData] = useState<Record<MenuKind, MenuCategoryOut[]> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { add, has } = useOrder();
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlayVideo(true);
    }
  }, []);

  useEffect(() => {
    getMenu()
      .then(setMenuData)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load the menu."));
  }, []);

  const categories = menuData?.[course] ?? [];
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
        intro="Add anything you'd like to try and check out online or on WhatsApp. Items, prices and availability are managed by the Cultures team, so a few are still marked On request while the full list is loaded."
        image={images.food}
        imageAlt="A grilled meat platter with rosemary garnish and cocktails, served in the evening garden"
        imagePosition="bottom"
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
                  course === c
                    ? "text-foreground underline decoration-ochre decoration-2 underline-offset-8"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {c === "food" ? "Food" : "Beverages"}
              </button>
            ))}
            <span className="eyebrow ml-auto text-muted-foreground">
              Managed by the Cultures team
            </span>
          </div>

          {course === "beverages" ? (
            <Reveal className="card-tactile img-zoom relative mt-8 overflow-hidden rounded-2xl">
              {playVideo ? (
                <video
                  src={cocktailPourLoop}
                  poster={cocktailPoster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                  className="img-zoom-target h-56 w-full object-cover sm:h-72"
                />
              ) : (
                <img
                  src={cocktailPoster}
                  alt="A cocktail being poured behind the bar"
                  className="img-zoom-target h-56 w-full object-cover sm:h-72"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <p className="eyebrow text-ochre">Full bar</p>
                <h2 className="mt-1 font-display text-xl text-bone sm:text-2xl">
                  Cocktails and cold drinks, made to order
                </h2>
              </div>
            </Reveal>
          ) : null}

          {error ? (
            <div className="mt-8 border border-dashed border-destructive p-6 text-sm text-destructive">
              {error}
            </div>
          ) : !menuData ? (
            <p className="mt-8 text-sm text-muted-foreground">Loading the menu…</p>
          ) : (
            <>
              <div
                className="mt-8 flex flex-wrap gap-2"
                role="tablist"
                aria-label="Menu categories"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={active === "all"}
                  onClick={() => setActive("all")}
                  className={cn(
                    "eyebrow rounded-full border px-5 py-3 transition-colors",
                    active === "all"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-secondary",
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
                      "eyebrow rounded-full border px-5 py-3 transition-colors",
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
                        <h2 className="font-display text-[clamp(1.7rem,3.5vw,2.5rem)]">
                          {category.title}
                        </h2>
                      </div>
                      <p className="eyebrow shrink-0 text-muted-foreground">
                        {category.items.length} {course === "food" ? "dishes" : "drinks"}
                      </p>
                    </div>

                    <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {category.items.map((item) => {
                        const id = String(item.id);
                        const imageKey = CATEGORY_IMAGE[category.slug] ?? "food";
                        const photo = item.imageUrl
                          ? `/gallery-image/${item.imageUrl}`
                          : (dishPhotos[item.name] ?? images[imageKey]);
                        return (
                          <li
                            key={item.id}
                            className="card-tactile flex overflow-hidden rounded-2xl border border-border bg-card"
                          >
                            <div className="w-[38%] shrink-0 sm:w-2/5">
                              <DishMedia
                                imageSrc={photo}
                                videoSrc={item.videoUrl ? `/gallery-image/${item.videoUrl}` : null}
                                alt={item.name}
                                className="h-full min-h-36"
                              />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="min-w-0 font-display text-lg leading-tight">
                                  {item.name}
                                </h3>
                                <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-sm text-foreground">
                                  {item.price}
                                </span>
                              </div>
                              <p className="eyebrow mt-1 text-primary">
                                {category.title}
                                {item.featured ? " · Signature" : ""}
                              </p>
                              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                                {item.description}
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  add({
                                    id,
                                    name: item.name,
                                    category: category.title,
                                    price: item.price,
                                  })
                                }
                                className="eyebrow mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-bone transition-colors hover:bg-ink/90"
                              >
                                <Plus className="h-4 w-4" aria-hidden="true" />
                                {has(id) ? "Added — add another" : "Add to order"}
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </Reveal>
                ))}
              </div>
            </>
          )}

          <Reveal className="mt-20 grid gap-10 border border-border bg-secondary p-8 lg:grid-cols-2 lg:p-12">
            <div>
              <p className="eyebrow rule-ochre text-primary">Please note</p>
              <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
                Items marked "On request" haven't been priced yet — call the restaurant to confirm
                what's freshest today.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={business.phoneHref} className="eyebrow border border-border px-7 py-4">
                  Call {business.phoneDisplay}
                </a>
                <a
                  href={business.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="eyebrow flex items-center justify-center gap-2 border border-border px-7 py-4 hover:bg-secondary"
                >
                  <WhatsAppIcon className="h-4 w-4 text-leaf" aria-hidden="true" />
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
                  <div
                    key={d.label}
                    className="flex flex-col gap-1 border-b border-border pb-3 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:gap-4"
                  >
                    <dt className="text-muted-foreground">{d.label}</dt>
                    <dd className="text-foreground">{d.value}</dd>
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
