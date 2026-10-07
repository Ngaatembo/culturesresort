import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Wine } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { DishMedia } from "@/components/dish-media";
import { Reveal } from "@/components/reveal";
import { images } from "@/lib/gallery";
import { useSlotImage } from "@/lib/homepage-images";
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

/** Photos that show several bottles side by side: shown whole, full width, instead of cropped into the side column. */
const WIDE_PHOTO_ITEMS = new Set(["Soft Drink", "Mixers (Tonic, Ginger Ale, etc)", "Mixers"]);

/** Category slug -> real photo of that category. */
const CATEGORY_IMAGE: Record<string, keyof typeof images> = {
  starters: "craft",
  "main-meals": "food",
  grills: "nyamaChomaGrillStation",
  sides: "food",
  "traditional-drinks": "traditionalDrinkPouring",
  cocktails: "drums",
  "soft-drinks": "gardenGuestsDaytime",
};

type Course = MenuKind;

/** Horizontal, swipeable row for the Wines category: touch swipe on phones, prev/next buttons and arrow keys on desktop. */
function WineRow({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const update = () => {
    const el = ref.current;
    if (el)
      setEdge({
        start: el.scrollLeft < 4,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
      });
  };
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const go = (dir: 1 | -1) =>
    ref.current?.scrollBy({
      left: dir * Math.max(240, ref.current.clientWidth * 0.8),
      behavior: "smooth",
    });
  const btn =
    "absolute top-[38%] z-10 hidden h-11 w-11 items-center justify-center rounded-full border border-border bg-background shadow-md disabled:opacity-30 md:flex";
  return (
    <div className="relative mt-8">
      <button
        type="button"
        aria-label={`Previous ${label}`}
        disabled={edge.start}
        onClick={() => go(-1)}
        className={`${btn} left-2`}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <ul
        ref={ref}
        tabIndex={0}
        role="region"
        aria-label={`${label}, swipe or use the arrow keys`}
        onScroll={update}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
          }
        }}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-1 pb-4 [scrollbar-width:thin] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        {children}
      </ul>
      <button
        type="button"
        aria-label={`Next ${label}`}
        disabled={edge.end}
        onClick={() => go(1)}
        className={`${btn} right-2`}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}

function Menu() {
  const { business, visitDetails } = useSiteSettings();
  const foodImg = useSlotImage("food", images.feastPlatterMixed);
  const [course, setCourse] = useState<Course>("food");
  const [active, setActive] = useState<string>("all");
  const [menuData, setMenuData] = useState<Record<MenuKind, MenuCategoryOut[]> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { add, has } = useOrder();
  // Which portion is selected for each multi-portion item, keyed by menu item id.
  // Defaults to the first portion so "Add to order" always has something to add.
  const [selectedOption, setSelectedOption] = useState<Record<number, number>>({});
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
        intro="Explore Cultures Resort's traditional plates, charcoal grills, Zimbabwean favourites and desserts. Choose a portion where options are available, then add it to your order."
        image={foodImg}
        imageAlt="Large mixed grill platter at Cultures Resort: sadza, brown rice, jollof rice, grilled chicken, chips, greens and gravy"
        imagePosition="center"
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
              Portions & prices shown from the current menu
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
                className="-mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
                role="tablist"
                aria-label="Menu categories"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={active === "all"}
                  onClick={() => setActive("all")}
                  className={cn(
                    "eyebrow shrink-0 whitespace-nowrap rounded-full border px-5 py-3 transition-colors",
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
                      "eyebrow shrink-0 whitespace-nowrap rounded-full border px-5 py-3 transition-colors",
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

                    {(() => {
                      const isWine = category.slug === "wines";
                      const cards = (
                        <>
                          {category.items.map((item) => {
                            const imageKey = CATEGORY_IMAGE[category.slug] ?? "food";
                            const mappedPhoto = item.imageUrl
                              ? `/gallery-image/${item.imageUrl}`
                              : dishPhotos[item.name];
                            // Food without a real photo gets a text-only card; only
                            // beverages keep the category placeholder image.
                            const isWide =
                              !isWine && WIDE_PHOTO_ITEMS.has(item.name) && !item.imageUrl;
                            const photo =
                              mappedPhoto ??
                              (course === "food" || isWine || category.slug === "bar"
                                ? null
                                : images[imageKey]);
                            // A "choice" only exists with 2+ portions. A single stored portion
                            // (e.g. "Portion" at $14) is not a real choice and should use the
                            // normal single-price card treatment.
                            const hasChoice = item.options.length > 1;
                            const singleOption = item.options.length === 1 ? item.options[0] : null;
                            const displayPrice = singleOption ? singleOption.price : item.price;
                            return (
                              <li
                                key={item.id}
                                className={`card-tactile flex overflow-hidden rounded-2xl border border-border bg-card ${isWine ? "w-[62vw] max-w-[260px] shrink-0 snap-start flex-col sm:w-[250px]" : isWide ? "flex-col" : photo ? "" : "border-l-4 border-l-ochre"}`}
                              >
                                {isWine && !photo ? (
                                  <div className="flex aspect-[4/5] w-full items-center justify-center bg-secondary text-ochre">
                                    <Wine className="h-12 w-12" aria-hidden="true" />
                                  </div>
                                ) : null}
                                {photo ? (
                                  <div
                                    className={
                                      isWine || isWide
                                        ? "w-full bg-white"
                                        : "w-[38%] shrink-0 sm:w-2/5"
                                    }
                                  >
                                    <DishMedia
                                      imgClassName={isWine || isWide ? "object-contain" : ""}
                                      imageSrc={photo}
                                      videoSrc={
                                        item.videoUrl ? `/gallery-image/${item.videoUrl}` : null
                                      }
                                      alt={item.name}
                                      className={
                                        isWine
                                          ? "aspect-[4/5] w-full"
                                          : isWide
                                            ? "aspect-[4/3] w-full"
                                            : "h-full min-h-36"
                                      }
                                    />
                                  </div>
                                ) : null}
                                <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                                  <div className="flex items-start justify-between gap-2">
                                    <h3 className="min-w-0 font-display text-lg leading-tight">
                                      {item.name}
                                    </h3>
                                    {hasChoice ? null : (
                                      <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-sm text-foreground">
                                        {displayPrice}
                                      </span>
                                    )}
                                  </div>
                                  <p className="eyebrow mt-1 text-primary">
                                    {category.title}
                                    {item.featured ? " · Signature" : ""}
                                  </p>
                                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                                    {item.description}
                                  </p>
                                  {hasChoice ? (
                                    (() => {
                                      const chosenId =
                                        selectedOption[item.id] ?? item.options[0]!.id;
                                      const chosenOption =
                                        item.options.find((o) => o.id === chosenId) ??
                                        item.options[0]!;
                                      const optionId = `${item.id}:${chosenOption.id}`;
                                      const optionName = `${item.name} (${chosenOption.label})`;
                                      return (
                                        <div className="mt-4 space-y-3">
                                          <div className="space-y-2">
                                            <p className="eyebrow text-muted-foreground">
                                              Choose portion
                                            </p>
                                            <div className="grid gap-2 sm:grid-cols-2">
                                              {item.options.map((option) => {
                                                const selected = option.id === chosenOption.id;
                                                return (
                                                  <button
                                                    key={option.id}
                                                    type="button"
                                                    aria-pressed={selected}
                                                    onClick={() =>
                                                      setSelectedOption((prev) => ({
                                                        ...prev,
                                                        [item.id]: option.id,
                                                      }))
                                                    }
                                                    aria-label={`Select portion ${option.label}, ${option.price}`}
                                                    className={cn(
                                                      "flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-colors",
                                                      selected
                                                        ? "border-secondary bg-secondary/30"
                                                        : "border-border hover:bg-secondary",
                                                    )}
                                                  >
                                                    <span className="text-sm font-medium">
                                                      {option.label}
                                                    </span>
                                                    <span className="text-sm font-medium text-foreground">
                                                      {option.price}
                                                    </span>
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              add({
                                                id: optionId,
                                                name: optionName,
                                                category: category.title,
                                                price: chosenOption.price,
                                              })
                                            }
                                            aria-label={`Add ${optionName} to your order, ${chosenOption.price}`}
                                            className="eyebrow flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-bone transition-colors hover:bg-ink/90"
                                          >
                                            <Plus className="h-4 w-4" aria-hidden="true" />
                                            {has(optionId) ? "Added — add another" : "Add to order"}
                                          </button>
                                        </div>
                                      );
                                    })()
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        add({
                                          id: String(item.id),
                                          name: item.name,
                                          category: category.title,
                                          price: displayPrice,
                                        })
                                      }
                                      className="eyebrow mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-bone transition-colors hover:bg-ink/90"
                                    >
                                      <Plus className="h-4 w-4" aria-hidden="true" />
                                      {has(String(item.id))
                                        ? "Added — add another"
                                        : "Add to order"}
                                    </button>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </>
                      );
                      return isWine ? (
                        <WineRow label={category.title}>{cards}</WineRow>
                      ) : (
                        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{cards}</ul>
                      );
                    })()}
                  </Reveal>
                ))}
              </div>
            </>
          )}

          <Reveal className="mt-20 grid gap-10 border border-border bg-secondary p-8 lg:grid-cols-2 lg:p-12">
            <div>
              <p className="eyebrow rule-ochre text-primary">Please note</p>
              <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
                Portion prices are shown where the current menu provides different sizes. If an item
                is marked "On request", please contact Cultures Resort to confirm today's price and
                availability.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={business.phoneHref} className="eyebrow border border-border px-7 py-4">
                  Call {business.phoneDisplay}
                </a>
                {business.phoneDisplay2 ? (
                  <a
                    href={business.phoneHref2 ?? undefined}
                    className="eyebrow border border-border px-7 py-4"
                  >
                    Call {business.phoneDisplay2}
                  </a>
                ) : null}
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
                Planning a larger group? Call ahead to confirm timing.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
