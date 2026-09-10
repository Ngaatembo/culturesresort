import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { gallery as bundledGallery } from "@/lib/gallery";
import {
  deleteGalleryPhoto,
  importBundledGalleryPhotos,
  listGalleryPhotos,
  updateGalleryPhoto,
  uploadGalleryPhoto,
  type GalleryPhotoRow,
} from "@/lib/data/gallery-photos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState, LoadingRows, PageHeader, SectionCard, StatusDot } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/gallery")({
  component: GalleryPage,
});

const CATEGORIES = ["Garden", "Food", "Culture", "Détail"] as const;

function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhotoRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bucketMissing, setBucketMissing] = useState(false);
  const [filter, setFilter] = useState<"All" | (typeof CATEGORIES)[number]>("All");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  // Upload form state
  const fileRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Détail");
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setError(null);
    setBucketMissing(false);
    listGalleryPhotos()
      .then((rows) => setPhotos(rows))
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Couldn't load the gallery.";
        setBucketMissing(message.includes("GALLERY"));
        setError(message);
      });
  };
  useEffect(load, []);

  // Bundled launch photos not yet copied into the database — once a
  // photo's been imported (or manually re-uploaded under the same
  // caption) it's excluded here so nothing ever shows twice.
  const remainingBundled = useMemo(() => {
    const dbCaptions = new Set((photos ?? []).map((p) => p.caption));
    return bundledGallery.filter((g) => !dbCaptions.has(g.caption));
  }, [photos]);

  const shownBundled = useMemo(
    () =>
      filter === "All" ? remainingBundled : remainingBundled.filter((g) => g.category === filter),
    [remainingBundled, filter],
  );
  const shownUploaded = useMemo(
    () => (photos ?? []).filter((p) => filter === "All" || p.category === filter),
    [photos, filter],
  );

  const onImport = async () => {
    setImporting(true);
    setImportResult(null);
    setError(null);
    try {
      const result = await importBundledGalleryPhotos();
      setImportResult(
        `Imported ${result.imported}, skipped ${result.skipped} already-imported` +
          (result.failed.length ? `, ${result.failed.length} failed` : "") +
          ".",
      );
      load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't import the launch photos.";
      setBucketMissing(message.includes("GALLERY"));
      setError(message);
    } finally {
      setImporting(false);
    }
  };

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("alt", alt);
      form.set("caption", caption);
      form.set("category", category);
      await uploadGalleryPhoto({ data: form });
      setAlt("");
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't upload that photo.";
      setBucketMissing(message.includes("GALLERY"));
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id: number) => {
    setPhotos((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
    try {
      await deleteGalleryPhoto({ data: { id } });
    } catch {
      load();
    }
  };

  const onEditField = (id: number, field: "alt" | "caption" | "category", value: string) => {
    setPhotos((prev) =>
      prev ? prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)) : prev,
    );
  };

  const onSaveMeta = async (p: GalleryPhotoRow) => {
    try {
      await updateGalleryPhoto({
        data: { id: p.id, alt: p.alt, caption: p.caption, category: p.category },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that photo's details.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gallery"
        description={`${remainingBundled.length + (photos?.length ?? 0)} photos live on the public site right now.`}
      />

      {bucketMissing ? (
        <SectionCard title="Setup required" className="border-accent/40">
          <StatusDot tone="warn">
            The photo storage bucket hasn't been created in Cloudflare yet. In the Cloudflare
            dashboard: Workers & Pages → R2 → Create bucket → name it exactly{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5">culturesresort-gallery</code> →
            create. No other setup needed — the code is already wired to it, uploads will start
            working the moment the bucket exists.
          </StatusDot>
        </SectionCard>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : null}

      {remainingBundled.length > 0 ? (
        <SectionCard
          title="Make the launch photos fully editable"
          description="Right now the 20 original photos are bundled with the site's code, so they can't be edited or deleted here. This copies them into the database, one time, so every photo — old and new — works the same way."
        >
          {importResult ? (
            <p className="mb-3 text-sm text-muted-foreground">{importResult}</p>
          ) : null}
          <Button type="button" onClick={onImport} disabled={importing}>
            <Download className="h-4 w-4" />
            {importing ? "Importing…" : `Import the ${remainingBundled.length} launch photos`}
          </Button>
        </SectionCard>
      ) : null}

      <SectionCard title="Upload a photo">
        <form onSubmit={onUpload} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">Image file</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              required
              className="block w-full text-sm text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as (typeof CATEGORIES)[number])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Caption</label>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Shown under the photo"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">
              Alt text (for screen readers / accessibility)
            </label>
            <Input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe what's in the photo"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={uploading}>
              <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload photo"}
            </Button>
          </div>
        </form>
      </SectionCard>

      <div className="flex flex-wrap gap-2">
        {(["All", ...CATEGORIES] as const).map((c) => (
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

      {photos === null && !bucketMissing ? (
        <LoadingRows rows={3} />
      ) : (
        <>
          {shownUploaded.length > 0 ? (
            <SectionCard
              title="Photos"
              description="Editable and deletable — these live in the database."
            >
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shownUploaded.map((p) => (
                  <li key={p.id} className="space-y-2 rounded-2xl border border-border bg-card p-3">
                    <img
                      src={`/gallery-image/${p.r2_key}`}
                      alt={p.alt}
                      loading="lazy"
                      className="aspect-[4/3] w-full rounded-lg object-cover"
                    />
                    <Input
                      value={p.caption}
                      onChange={(e) => onEditField(p.id, "caption", e.target.value)}
                      onBlur={() => onSaveMeta(p)}
                      placeholder="Caption"
                    />
                    <Input
                      value={p.alt}
                      onChange={(e) => onEditField(p.id, "alt", e.target.value)}
                      onBlur={() => onSaveMeta(p)}
                      placeholder="Alt text"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <Select
                        value={p.category}
                        onValueChange={(v) => {
                          onEditField(p.id, "category", v);
                          onSaveMeta({ ...p, category: v });
                        }}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button
                        type="button"
                        onClick={() => onDelete(p.id)}
                        aria-label={`Delete "${p.caption || "this photo"}"`}
                        className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ) : null}

          {shownBundled.length > 0 ? (
            <SectionCard
              title="Launch photos (not yet imported)"
              description="Import them above to make these editable and deletable too."
            >
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shownBundled.map((g, i) => (
                  <li
                    key={`${g.caption}-${i}`}
                    className="overflow-hidden rounded-2xl border border-border bg-card opacity-75"
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
            </SectionCard>
          ) : null}
        </>
      )}
    </div>
  );
}
