import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { gallery } from "@/lib/gallery";
import { PageHeader, SectionCard, StatusDot } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/gallery")({
  component: GalleryPage,
});

const CATEGORIES = ["All", "Garden", "Food", "Culture", "Détail"] as const;

function GalleryPage() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All");
  const shown = useMemo(
    () => (filter === "All" ? gallery : gallery.filter((g) => g.category === filter)),
    [filter],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gallery"
        description={`${gallery.length} photos live on the public site right now.`}
      />

      <SectionCard title="Setup required" className="border-accent/40">
        <StatusDot tone="warn">
          Photo upload isn't wired up yet — gallery images are currently bundled with the site's
          code (src/lib/gallery.ts) rather than stored in the database, so there's nothing to
          upload, replace or delete from here yet. Send new photos and I'll add them to the code
          directly until a real media library is built.
        </StatusDot>
      </SectionCard>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              filter === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:bg-secondary",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((g, i) => (
          <li
            key={`${g.caption}-${i}`}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <img
              src={g.src}
              alt={g.alt}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                {g.category}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{g.caption}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
