import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Flame, Palette, Play, Plus, Star, Trees, Users, Volume2, VolumeX } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { ParallaxImage } from "@/components/parallax-image";
import { ExperienceGrid } from "@/components/experience-grid";
import { DishMedia } from "@/components/dish-media";
import { VideoTourModal } from "@/components/video-tour-modal";
import { TrustReviews } from "@/components/trust-reviews";
import { testimonials } from "@/lib/site-data";
import { useSiteSettings } from "@/lib/site-settings-query";
import { images } from "@/lib/gallery";
import { getMenu, type MenuItemOut } from "@/lib/data/menu";
import { dishPhotos } from "@/lib/dish-photos";
import { useOrder } from "@/lib/order";
import fireGrill from "@/assets/fire-nyama-choma.jpg";
import fireCookingLoop from "@/assets/video/fire-cooking-loop.mp4";
import gardenLoop from "@/assets/video/garden-loop.mp4";
import { cn } from "@/lib/utils";

type PreviewDish = MenuItemOut & { categoryTitle: string; categorySlug: string };

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
  const { business } = useSiteSettings();
  const [playVideo, setPlayVideo] = useState(false);
  const [signatureDishes, setSignatureDishes] = useState<PreviewDish[] | null>(null);
  const [craftMuted, setCraftMuted] = useState(true);
  const [tourOpen, setTourOpen] = useState(false);
  const craftVideoRef = useRef<HTMLVideoElement>(null);
  const { add, has } = useOrder();

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlayVideo(true);
    }
  }, []);

  useEffect(() => {
    getMenu()
      .then((data) => {
        const flattened: PreviewDish[] = data.food.flatMap((c) =>
          c.items.map((item) => ({ ...item, categoryTitle: c.title, categorySlug: c.slug })),
        );
        const featured = flattened.filter((d) => d.featured);
        setSignatureDishes((featured.length >= 3 ? featured : flattened).slice(0, 3));
      })
      .catch(() => setSignatureDishes([]));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[92svh] items-end overflow-hidden">
        <ParallaxImage strength={44} className="absolute inset-0 h-full w-full">
          {playVideo ? (
            <video
              src={gardenLoop}
              poster={images.garden}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="h-[122%] w-full object-cover"
            />
          ) : (
            <img
              src={images.garden}
              alt="Life-size zebra, giraffe and elephant sculptures on the lawn among picnic tables"
              width={1920}
              height={1280}
              className="h-[122%] w-full object-cover"
              fetchPriority="high"
            />
          )}
        </ParallaxImage>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/35" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-32 text-bone lg:px-10 lg:pb-24">
          <Reveal>
            <p className="eyebrow text-ochre">Hillside · Harare · Zimbabwe</p>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.95]">
              More than a meal.
              <span className="block italic text-ochre">An experience of Africa.</span>
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-bone/80 sm:text-lg">
              Traditional African cooking served in an open garden, among carved wood, woven fibre
              and open flame.
            </p>
          </Reveal>
          <Reveal delay={270}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/reservations"
                className="group eyebrow bg-primary px-8 py-5 text-center text-primary-foreground transition-all duration-300 [transition-timing-function:var(--ease-premium)] hover:-translate-y-0.5 hover:opacity-90"
              >
                Reserve a table{" "}
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <a
                href={business.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow border border-bone/40 px-8 py-5 text-center transition-all duration-300 [transition-timing-function:var(--ease-premium)] hover:-translate-y-0.5 hover:bg-bone/10"
              >
                Get directions
              </a>
              <button
                type="button"
                onClick={() => setTourOpen(true)}
                className="group eyebrow flex items-center justify-center gap-2 px-8 py-5 text-bone/75 transition-colors hover:text-bone"
              >
                <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                Take a 1-min tour
              </button>
            </div>
          </Reveal>
          <Reveal delay={340}>
            <ul className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-bone/15 pt-6 text-xs">
              {["Traditional clay pot dining", "Open air garden", "Live music"].map((stat, i) => (
                <li key={stat} className="flex items-center gap-3">
                  {i > 0 ? <span className="text-ochre/60" aria-hidden="true">•</span> : null}
                  <span className="eyebrow text-bone/70">{stat}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <a
          href="#story"
          className="eyebrow absolute inset-x-0 bottom-6 z-10 hidden flex-col items-center gap-2 text-bone/70 transition-colors hover:text-bone sm:flex"
          aria-label="Scroll to explore"
        >
          Scroll to explore
          <span className="h-8 w-px animate-pulse bg-bone/50" aria-hidden="true" />
        </a>
      </section>

      {/* Intro */}
      <section id="story" className="grain bg-background py-20 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-start gap-14 px-5 lg:grid-cols-12 lg:px-10">
          <Reveal className="relative lg:col-span-5">
            <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink">
              <video
                ref={craftVideoRef}
                src={fireCookingLoop}
                poster={fireGrill}
                autoPlay
                muted={craftMuted}
                loop
                playsInline
                preload="metadata"
                aria-label="Behind the craft: cooking over the open fire at Cultures Resort"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <p className="eyebrow absolute left-5 top-5 text-bone/85">Behind the craft</p>
              <button
                type="button"
                onClick={() => setCraftMuted((m) => !m)}
                aria-label={craftMuted ? "Turn sound on" : "Turn sound off"}
                className="absolute bottom-5 right-5 grid h-10 w-10 place-items-center rounded-full bg-ink/60 text-bone backdrop-blur transition-colors hover:bg-ink/80"
              >
                {craftMuted ? (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <div className="absolute -bottom-6 -right-6 hidden max-w-[13rem] rounded-2xl border border-border bg-card p-5 shadow-lift sm:block">
              <p className="font-display text-3xl italic text-primary">est.</p>
              <p className="mt-1 text-sm leading-snug text-muted-foreground">
                A garden built around craft, fire and shared tables.
              </p>
            </div>
          </Reveal>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <p className="eyebrow rule-ochre text-primary">Our table</p>
              <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3.25rem)] leading-tight">
                A place to eat, relax and spend time together
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-6 space-y-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
                <p>
                  Cultures Resort sits on the corner of Chiremba and Southey Road in Hillside,
                  Harare. It was built around a simple idea: that African food is best shared
                  slowly, outdoors, with people you like.
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
            <Reveal delay={200} className="mt-12 grid gap-6 sm:grid-cols-2">
              {[
                { title: "Traditional cooking", body: "Slow, open-fire dishes.", Icon: Flame },
                { title: "Open ground", body: "Tables spread across the garden.", Icon: Trees },
                { title: "Craft on show", body: "Carved wood, clay and woven fibre.", Icon: Palette },
                { title: "Room for everyone", body: "Long tables, kids welcome.", Icon: Users },
              ].map(({ title, body, Icon }) => (
                <div key={title} className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-base leading-tight">{title}</p>
                    <p className="mt-1 text-sm leading-snug text-muted-foreground">{body}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Food */}
      <section className="bg-clay text-bone">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-1 px-1 pt-1 lg:grid-cols-3 lg:gap-2 lg:px-2 lg:pt-2">
          <div className="col-span-2 aspect-[16/11] overflow-hidden lg:col-span-2 lg:aspect-auto">
            <img
              src={images.food}
              alt="A grilled meat platter with rosemary garnish and cocktails, served in the evening garden"
              width={1600}
              height={1200}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="hidden h-full grid-rows-2 gap-2 lg:grid">
            <div className="overflow-hidden">
              <img
                src={images.sadzaPlate}
                alt="Sadza and covo served on a white plate at an outdoor wooden table"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <img
                src={images.porkSizzler}
                alt="Sizzling grilled pork served on a hot plate with tomato and onion"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-5 py-16 text-center lg:px-10 lg:py-24">
          <Reveal>
            <p className="eyebrow text-ochre">The kitchen</p>
            <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3.25rem)] leading-tight">
              Traditional plates, cooked without hurry
            </h2>
            <p className="mx-auto mt-6 max-w-md leading-relaxed text-bone/75">
              Slow-cooked relishes, grains, greens and meat from the open fire — served family style
              on wood and clay.
            </p>
            <ul className="mx-auto mt-10 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
              {(signatureDishes ?? [null, null, null]).map((dish, i) =>
                dish ? (
                  <li
                    key={dish.id}
                    className="card-tactile overflow-hidden rounded-2xl bg-bone/5"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <DishMedia
                        imageSrc={
                          dish.imageUrl
                            ? `/gallery-image/${dish.imageUrl}`
                            : (dishPhotos[dish.name] ?? images.food)
                        }
                        videoSrc={dish.videoUrl ? `/gallery-image/${dish.videoUrl}` : null}
                        alt={dish.name}
                        className="h-full"
                      />
                    </div>
                    <div className="p-4">
                      <p className="eyebrow text-ochre">{dish.categoryTitle}</p>
                      <div className="mt-1 flex items-start justify-between gap-2">
                        <h3 className="min-w-0 font-display text-lg leading-tight">{dish.name}</h3>
                        <span className="shrink-0 text-sm text-bone/70">{dish.price}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          add({
                            id: String(dish.id),
                            name: dish.name,
                            category: dish.categoryTitle,
                            price: dish.price,
                          })
                        }
                        className="eyebrow mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-bone/25 px-3 py-2.5 text-bone/85 transition-colors hover:bg-bone/10"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        {has(String(dish.id)) ? "Added — add another" : "Add to enquiry"}
                      </button>
                    </div>
                  </li>
                ) : (
                  <li
                    key={i}
                    className="aspect-[4/3] animate-pulse rounded-2xl bg-bone/10 sm:aspect-auto"
                  />
                ),
              )}
            </ul>
            <Link
              to="/menu"
              className="eyebrow mt-10 inline-block bg-primary px-7 py-4 text-primary-foreground"
            >
              Explore the menu →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Fire */}
      <section className="relative flex h-[60svh] items-center justify-center overflow-hidden">
        <ParallaxImage strength={30} className="absolute inset-0 h-full w-full">
          {playVideo ? (
            <video
              src={fireCookingLoop}
              poster={fireGrill}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="h-[122%] w-full object-cover"
            />
          ) : (
            <img
              src={fireGrill}
              alt="Ribs and cuts of meat charring over open charcoal"
              width={1600}
              height={900}
              loading="lazy"
              className="h-[122%] w-full object-cover"
            />
          )}
        </ParallaxImage>
        <div className="absolute inset-0 flex items-center justify-center bg-ink/55 text-center">
          <Reveal className="px-5">
            <span className="mx-auto block h-px w-12 bg-ochre" aria-hidden="true" />
            <blockquote className="mt-6 max-w-2xl font-display text-[clamp(1.8rem,4.5vw,3.25rem)] italic leading-tight text-bone">
              Where tradition meets fire.
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* Experience */}
      <section className="bg-background pb-10 pt-20 lg:py-32">
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

      {/* Reviews */}
      <section className="bg-background pb-20 pt-10 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <Reveal>
            <p className="eyebrow rule-ochre text-primary">What guests say</p>
            <h2 className="mt-6 max-w-2xl font-display text-[clamp(2rem,4vw,3.25rem)] leading-tight">
              Straight from Google reviews
            </h2>
          </Reveal>
          <div
            className="mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible"
            style={{ scrollbarWidth: "none" }}
          >
            {testimonials.map((t, i) => (
              <Reveal
                key={t.name}
                delay={i * 100}
                className="card-tactile w-[85%] shrink-0 snap-start rounded-2xl border border-border bg-card p-7 shadow-card sm:w-[60%] lg:w-auto"
              >
                <div className="flex items-center gap-3">
                  <span className="eyebrow grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-base leading-tight">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.meta}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={cn(
                        "h-4 w-4",
                        s < t.rating ? "fill-ochre text-ochre" : "fill-transparent text-border",
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="mt-4 leading-relaxed text-foreground">{t.quote}</p>
              </Reveal>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground lg:hidden">Swipe to read more →</p>

          <TrustReviews />
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
                    rel="noopener noreferrer"
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
                rel="noopener noreferrer"
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

      <VideoTourModal
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        src={gardenLoop}
        poster={images.garden}
      />
    </>
  );
}
