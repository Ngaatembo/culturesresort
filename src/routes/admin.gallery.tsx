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

const CATEGORIES = ["People", "Food", "Fire", "Garden", "Culture", "Details"] as const;
type Category = (typeof CATEGORIES)[number];

type PendingUpload = {
  file: File;
  category: Category;
  caption: string;
  alt: string;
};

// Curated copy for the 15 supplied resort photos. Matching by filename means
// the admin can select the whole set at once without having to retype the copy.
const CURATED_BY_FILENAME: Record<string, Omit<PendingUpload, "file">> = {
  "1000324688.jpg": { category: "Food", caption: "A vibrant layered blue, citrus and red cocktail served in a tall glass.", alt: "A vibrant layered blue, citrus and red cocktail served in a tall glass." },
  "1000324689.jpg": { category: "Food", caption: "A generous platter of flame-grilled meat cuts garnished with fresh rosemary.", alt: "A platter of grilled meat cuts garnished with rosemary." },
  "1000324690.jpg": { category: "Food", caption: "A rustic platter of grilled meat cuts, prepared over open heat and finished with rosemary.", alt: "A rustic platter of grilled meat cuts with rosemary." },
  "1000324691.jpg": { category: "Food", caption: "A hearty selection of grilled meats served with fresh rosemary.", alt: "A selection of grilled meats served with rosemary." },
  "1000324692.jpg": { category: "Garden", caption: "Garden grounds featuring playful wildlife sculptures and landscaped greenery.", alt: "Landscaped resort garden with wildlife sculptures." },
  "1000324693.jpg": { category: "Food", caption: "Traditional-style grilled meat served with sadza and fresh greens.", alt: "Grilled meat served with sadza and fresh greens." },
  "1000324694.jpg": { category: "Food", caption: "A serving of seasoned tomato rice with cooked greens and a traditional-style stew.", alt: "Seasoned tomato rice with cooked greens and stew." },
  "1000324695.jpg": { category: "Food", caption: "Char-grilled ribs and meat cuts served on a black platter with rosemary.", alt: "Char-grilled ribs and meat cuts on a platter with rosemary." },
  "1000324696.jpg": { category: "Fire", caption: "Meat and ribs roasting over glowing charcoal for a smoky grilled finish.", alt: "Meat and ribs roasting over glowing charcoal." },
  "1000324697.jpg": { category: "Food", caption: "Sadza served with fresh cooked leafy greens, a comforting traditional-style accompaniment.", alt: "Sadza served with cooked leafy greens." },
  "1000324698.jpg": { category: "Food", caption: "Tender-looking grilled meat cuts presented on a hot serving platter.", alt: "Grilled meat cuts presented on a serving platter." },
  "1000324699.jpg": { category: "Fire", caption: "Golden-brown grilled ribs and meat cuts prepared over open heat.", alt: "Golden-brown grilled ribs and meat cuts over open heat." },
  "1000324700.jpg": { category: "Details", caption: "Covered deck seating with rustic timber tables and a relaxed outdoor dining atmosphere.", alt: "Covered outdoor dining deck with rustic timber tables." },
  "1000324701.jpg": { category: "Garden", caption: "Colorful children’s play area set within the resort garden.", alt: "Colorful children’s play area in the resort garden." },
  "1000324702.jpg": { category: "Food", caption: "A hearty selection of grilled meat served as part of the resort dining experience.", alt: "Grilled meat served as part of the resort dining experience." },
};

function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhotoRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bucketMissing, setBucketMissing] = useState(false);
  const [filter, setFilter] = useState<"All" | Category>("All");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

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

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setUploadResult(null);
    setError(null);
    setPending(
      files.map((file) => {
        const curated = CURATED_BY_FILENAME[file.name];
        return {
          file,
          category: curated?.category ?? "Details",
          caption: curated?.caption ?? "",
          alt: curated?.alt ?? "",
        };
      }),
    );
  };

  const updatePending = (index: number, field: keyof Omit<PendingUpload, "file">, value: string) => {
    setPending((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const removePending = (index: number) => {
    setPending((current) => current.filter((_, i) => i !== index));
  };

  const onBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pending.length) return;
    setError(null);
    setUploadResult(null);
    setUploading(true);
    let uploaded = 0;
    let failed = 0;

    try {
      for (const item of pending) {
        try {
          const form = new FormData();
          form.set("file", item.file);
          form.set("alt", item.alt);
          form.set("caption", item.caption);
          form.set("category", item.category);
          await uploadGalleryPhoto({ data: form });
          uploaded++;
        } catch {
          failed++;
        }
      }
      setUploadResult(
        `Uploaded ${uploaded} photo${uploaded === 1 ? "" : "s"}` +
          (failed ? `, ${failed} failed` : "") +
          ".",
      );
      setPending([]);
      if (fileRef.current) fileRef.current.value = "";
      load();
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
          {importResult ? <p className="mb-3 text-sm text-muted-foreground">{importResult}</p> : null}
          <Button type="button" onClick={onImport} disabled={importing}>
            <Download className="h-4 w-4" />
            {importing ? "Importing…" : `Import the ${remainingBundled.length} launch photos`}
          </Button>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Add photos in bulk"
        description="Select several images at once. The supplied Cultures Resort photos are recognised by filename and get curated category, caption and accessibility text automatically."
      >
        <form onSubmit={onBulkUpload} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Image files</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onFilesSelected}
              required
              className="block w-full text-sm text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
            />
            <p className="text-xs text-muted-foreground">Images must be under 8MB each. Uploads run one at a time to keep R2 requests reliable.</p>
          </div>

          {uploadResult ? <p className="text-sm text-muted-foreground">{uploadResult}</p> : null}

          {pending.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">{pending.length} photo{pending.length === 1 ? "" : "s"} ready to upload</p>
              {pending.map((item, index) => (
                <div key={`${item.file.name}-${index}`} className="grid gap-3 rounded-2xl border border-border bg-card p-3 sm:grid-cols-[96px_1fr_auto]">
                  <img
                    src={URL.createObjectURL(item.file)}
                    alt=""
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <p className="truncate text-xs font-medium text-muted-foreground">{item.file.name}</p>
                      <Select
                        value={item.category}
                        onValueChange={(value) => updatePending(index, "category", value)}
                      >
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input value={item.caption} onChange={(e) => updatePending(index, "caption", e.target.value)} placeholder="Caption" />
                    <Input className="sm:col-span-2" value={item.alt} onChange={(e) => updatePending(index, "alt", e.target.value)} placeholder="Alt text" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePending(index)}
                    aria-label={`Remove ${item.file.name}`}
                    className="self-start rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button type="submit" disabled={uploading}>
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading…" : `Upload ${pending.length} photo${pending.length === 1 ? "" : "s"}`}
              </Button>
            </div>
          ) : null}
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
            <SectionCard title="Photos" description="Editable and deletable — these live in the database.">
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shownUploaded.map((p) => (
                  <li key={p.id} className="space-y-2 rounded-2xl border border-border bg-card p-3">
                    <img src={`/gallery-image/${p.r2_key}`} alt={p.alt} loading="lazy" className="aspect-[4/3] w-full rounded-lg object-cover" />
                    <Input value={p.caption} onChange={(e) => onEditField(p.id, "caption", e.target.value)} onBlur={() => onSaveMeta(p)} placeholder="Caption" />
                    <Input value={p.alt} onChange={(e) => onEditField(p.id, "alt", e.target.value)} onBlur={() => onSaveMeta(p)} placeholder="Alt text" />
                    <div className="flex items-center justify-between gap-2">
                      <Select value={p.category} onValueChange={(v) => { onEditField(p.id, "category", v); onSaveMeta({ ...p, category: v }); }}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                      <button type="button" onClick={() => onDelete(p.id)} aria-label={`Delete "${p.caption || "this photo"}"`} className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ) : null}

          {shownBundled.length > 0 ? (
            <SectionCard title="Launch photos (not yet imported)" description="Import them above to make these editable and deletable too.">
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shownBundled.map((g, i) => (
                  <li key={`${g.caption}-${i}`} className="overflow-hidden rounded-2xl border border-border bg-card opacity-75">
                    <img src={g.src} alt={g.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    <div className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">{g.category}</p>
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
