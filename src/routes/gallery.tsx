import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { Lightbox } from "@/components/lightbox";
import { gallery, images } from "@/lib/gallery";
import { cn } from "@/lib/utils";

const categories = ["All", "Garden", "Food", "Culture", "Détail"] as const;

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery | Cultures Resort, Hillside Harare" },
      {
        name: "description",
        content:
          "Photographs of the garden, the food, the craft and the cultural atmosphere at Cultures Resort in Hillside, Harare.",
      },
      { property: "og:title", content: "Gallery | Cultures Resort" },
      { property: "og:description", content: "A look at the garden, the plates and the atmosphere." },
    ],
  }),
  component: Gallery;
});

function Gallery() {
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const [index, setIndex] = useState<number | null>(null);

  const shown = useMemo(
    () => (filter === "All" ? gallery : gallery.filter((g) => g.category === filter)),
    [filter],
  );

  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="The garden, the plates, the evening"
        intro="Placeholder photography stands in until the restaurant's own images are added."
        image={images.craft}
        imageAlt="Carved mask, woven basket and clay pot"
      />

      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                aria-pressed={filter === c}
                className={cn(
                  "eyebrow border px-5 py-3 transition-colors",
                  filter === c ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((img, i) => (
              <Reveal as="li" key={`${img.caption}-${i}`} delay={(i % 3) * 80}>
                <button
                  type="button"
                  onClick={() => setIndex(gallery.indexOf(img))}
                  className="group block w-full overflow-hidden bg-secondary text-left"
                  aria-label={`Open image: ${img.caption}`}
                >
                  <span className={cn("block overflow-hidden", img.tall ? "aspect-[3/4]" : "aspect-[4/3]")}>
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </span>
                  <span className="flex items-center justify-between gap-3 px-4 py-4">
                    <span className="min-w-0 truncate text-sm text-muted-foreground">{img.caption}</span>
                    <span className="eyebrow shrink-0 text-ochre">{img.category}</span>
                  </span>
                </button>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <Lightbox
        images={gallery.map((g) => ({ src: g.src, alt: g.alt, caption: g.caption }))}
        index={index}
        onClose={() => setIndex(null)}
        onIndexChange={setIndex}
      />
    </>
  );
}
