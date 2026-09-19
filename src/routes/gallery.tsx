import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { Lightbox } from "@/components/lightbox";
import { gallery as bundledGallery, images, type GalleryEntry } from "@/lib/gallery";
import { useSlotImage } from "@/lib/homepage-images";
import { listGalleryPhotos } from "@/lib/data/gallery-photos";
import { cn } from "@/lib/utils";

const categories = ["All", "People", "Food", "Fire", "Garden", "Culture", "Night", "Details"] as const;
/** Fixed, sensible reading order for the grouped "All" view — not just insertion order. */
const SECTION_ORDER = ["Garden", "Food", "Fire", "Culture", "Night", "People", "Details"] as const;
/** Card widths for `srcSet` entries: about a third of the viewport on desktop (the grid has spanning tiles), half on mobile. */
const GALLERY_CARD_SIZES = "(min-width: 1024px) 34vw, 50vw";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery | Cultures Resort, Hillside Harare" },
      { name: "description", content: "Photographs of the garden, the food, the craft and the cultural atmosphere at Cultures Resort in Hillside, Harare." },
      { property: "og:title", content: "Gallery | Cultures Resort" },
      { property: "og:description", content: "A look at the garden, the plates and the atmosphere." },
    ],
  }),
  component: Gallery,
});

function GalleryCard({
  img,
  spanClass,
  delay,
  onOpen,
}: {
  img: GalleryEntry;
  spanClass: string;
  delay: number;
  onOpen: () => void;
}) {
  return (
    <Reveal as="li" delay={delay} className={cn("h-full min-w-0", spanClass)}>
      <button
        type="button"
        onClick={onOpen}
        className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-shadow duration-300 hover:shadow-lift"
        aria-label={`Open image: ${img.caption}`}
      >
        <span className={cn("relative block w-full flex-1 overflow-hidden lg:aspect-auto", spanClass ? "aspect-[4/3]" : img.tall ? "aspect-[3/4]" : "aspect-[4/3]")}>
          <img src={img.src} srcSet={img.srcSet} sizes={img.srcSet ? GALLERY_CARD_SIZES : undefined} alt={img.alt} loading="lazy" style={img.position ? { objectPosition: img.position } : undefined} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <span className="eyebrow absolute left-3 top-3 rounded-full bg-ink/70 px-3 py-1.5 text-[10px] text-bone backdrop-blur-sm">
            {img.category}
          </span>
        </span>
        <span className="line-clamp-2 px-4 py-3 text-sm leading-snug text-foreground">
          {img.caption}
        </span>
      </button>
    </Reveal>
  );
}

function Gallery() {
  const craftImg = useSlotImage("craft", images.craft);
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const [index, setIndex] = useState<number | null>(null);
  const [uploaded, setUploaded] = useState<GalleryEntry[]>([]);
  const [bundledSources, setBundledSources] = useState<Set<string>>(new Set());

  useEffect(() => {
    listGalleryPhotos()
      .then((rows) => {
        const activeRows = rows.filter((r) => r.is_deleted === 0);
        setUploaded(activeRows.map((r) => ({
          src: `/gallery-image/${r.r2_key}`,
          alt: r.alt,
          caption: r.caption,
          category: r.category as GalleryEntry["category"],
        })));
        setBundledSources(new Set(rows.map((r) => r.bundled_source).filter(Boolean) as string[]));
      })
      .catch(() => {
        // Uploaded photos are additive — if this fails, the page still works with bundled launch photos.
      });
  }, []);

  const gallery = useMemo(() => {
    const uploadedCaptions = new Set(uploaded.map((g) => g.caption));
    return [...uploaded, ...bundledGallery.filter((g) => !bundledSources.has(g.caption) && !uploadedCaptions.has(g.caption))];
  }, [uploaded, bundledSources]);

  // Grouped by category, in a fixed reading order, regardless of upload order —
  // this is what keeps "all the garden photos together, all the food together"
  // instead of an interleaved feed.
  const sections = useMemo(() => {
    return SECTION_ORDER.map((category) => ({
      category,
      photos: gallery.filter((g) => g.category === category),
    })).filter((s) => s.photos.length > 0);
  }, [gallery]);

  const shownSections = useMemo(
    () => filter === "All" ? sections : sections.filter((s) => s.category === filter),
    [sections, filter],
  );

  const spanFor = (localIndex: number) => {
    const pattern = localIndex % 7;
    return pattern === 0 ? "lg:col-span-2 lg:row-span-2" : pattern === 4 ? "col-span-2 lg:col-span-2 lg:row-span-1" : "";
  };

  return (
    <>
      <PageHeader eyebrow="Gallery" title="The garden, the plates, the evening" intro="The garden, the grounds, the plates and the people — as they really are." image={craftImg} imageAlt="Carved mask, woven basket and clay pot" />
      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} type="button" onClick={() => setFilter(c)} aria-pressed={filter === c} className={cn("eyebrow border px-5 py-3 transition-colors", filter === c ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary")}>{c}</button>
            ))}
          </div>

          <div className="mt-12 space-y-16">
            {shownSections.map((section) => (
              <div key={section.category}>
                {filter === "All" ? (
                  <p className="eyebrow rule-ochre mb-6 text-primary">{section.category}</p>
                ) : null}
                <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:auto-rows-[220px]">
                  {section.photos.map((img, i) => (
                    <GalleryCard
                      key={`${img.caption}-${i}`}
                      img={img}
                      spanClass={spanFor(i)}
                      delay={(i % 4) * 70}
                      onOpen={() => setIndex(gallery.indexOf(img))}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Lightbox images={gallery.map((g) => ({ src: g.src, alt: g.alt, caption: g.caption }))} index={index} onClose={() => setIndex(null)} onIndexChange={setIndex} />
    </>
  );
}
