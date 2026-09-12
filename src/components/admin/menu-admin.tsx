import { useEffect, useRef, useState } from "react";
import {
  clearMenuItemImage,
  clearMenuItemVideo,
  createMenuItem,
  deleteMenuItem,
  getMenuAdmin,
  setMenuItemAvailability,
  setMenuItemDetails,
  setMenuItemImage,
  setMenuItemPrice,
  setMenuItemVideo,
  type MenuItemRow,
  type MenuKind,
} from "@/lib/data/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  EmptyState,
  ErrorState,
  LoadingRows,
  PageHeader,
  SectionCard,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type Draft = { name?: string; description?: string; price?: string };
type NewItemDraft = { name: string; description: string; price: string };

/**
 * Shared by /admin/menu and /admin/beverages — same real backend
 * (menu_items in D1, filtered by `kind`), same editor. Name, description,
 * price and availability all save straight to the live public menu, as do
 * brand-new items added per category.
 */
export function MenuAdminPage({ kind, noun }: { kind: MenuKind; noun: string }) {
  const [items, setItems] = useState<MenuItemRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [imageBusyId, setImageBusyId] = useState<number | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [videoBusyId, setVideoBusyId] = useState<number | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [newDrafts, setNewDrafts] = useState<Record<string, NewItemDraft>>({});
  const [addingSlug, setAddingSlug] = useState<string | null>(null);
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});
  const videoInputs = useRef<Record<number, HTMLInputElement | null>>({});

  const load = () => {
    setError(null);
    getMenuAdmin()
      .then((all) => setItems(all.filter((i) => i.kind === kind)))
      .catch((err) =>
        setError(err instanceof Error ? err.message : `Couldn't load the ${noun} list.`),
      );
  };
  useEffect(load, [kind]);

  const categories = items
    ? Array.from(new Map(items.map((i) => [i.category_slug, i.category_title])).entries())
    : [];

  const draftFor = (item: MenuItemRow): Required<Draft> => ({
    name: drafts[item.id]?.name ?? item.name,
    description: drafts[item.id]?.description ?? item.description,
    price:
      drafts[item.id]?.price ?? (item.price_cents > 0 ? (item.price_cents / 100).toFixed(2) : ""),
  });

  const saveItem = async (item: MenuItemRow) => {
    const draft = draftFor(item);
    const priceRaw = draft.price.trim();
    const price = priceRaw === "" ? 0 : Number(priceRaw);
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price (or leave blank for On request).");
      return;
    }
    if (!draft.name.trim()) {
      setError("The name can't be empty.");
      return;
    }
    setSavingId(item.id);
    setError(null);
    try {
      await Promise.all([
        setMenuItemPrice({ data: { id: item.id, price } }),
        setMenuItemDetails({
          data: { id: item.id, name: draft.name, description: draft.description },
        }),
      ]);
      setItems((prev) =>
        prev!.map((i) =>
          i.id === item.id
            ? {
                ...i,
                price_cents: Math.round(price * 100),
                name: draft.name.trim(),
                description: draft.description.trim(),
              }
            : i,
        ),
      );
      setSavedId(item.id);
      setTimeout(() => setSavedId((id) => (id === item.id ? null : id)), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save those changes.");
    } finally {
      setSavingId(null);
    }
  };

  const toggleAvailable = async (item: MenuItemRow) => {
    const next = !item.available;
    setItems((prev) =>
      prev!.map((i) => (i.id === item.id ? { ...i, available: next ? 1 : 0 } : i)),
    );
    try {
      await setMenuItemAvailability({ data: { id: item.id, available: next } });
    } catch {
      load();
    }
  };

  const removeItem = async (item: MenuItemRow) => {
    if (!window.confirm(`Remove "${item.name}" from the menu? This can't be undone.`)) return;
    setDeletingId(item.id);
    setError(null);
    try {
      await deleteMenuItem({ data: { id: item.id } });
      setItems((prev) => prev!.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't remove that item.");
    } finally {
      setDeletingId(null);
    }
  };

  const onPickPhoto = (item: MenuItemRow, file: File | undefined) => {
    if (!file) return;
    setImageError(null);
    setImageBusyId(item.id);
    const form = new FormData();
    form.set("id", String(item.id));
    form.set("file", file);
    setMenuItemImage({ data: form })
      .then(({ imageUrl }) => {
        setItems((prev) =>
          prev!.map((i) => (i.id === item.id ? { ...i, image_url: imageUrl } : i)),
        );
      })
      .catch((err) => {
        setImageError(err instanceof Error ? err.message : "Couldn't upload that photo.");
      })
      .finally(() => {
        setImageBusyId(null);
        const input = fileInputs.current[item.id];
        if (input) input.value = "";
      });
  };

  const removePhoto = async (item: MenuItemRow) => {
    setImageError(null);
    setImageBusyId(item.id);
    try {
      await clearMenuItemImage({ data: { id: item.id } });
      setItems((prev) => prev!.map((i) => (i.id === item.id ? { ...i, image_url: null } : i)));
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Couldn't remove that photo.");
    } finally {
      setImageBusyId(null);
    }
  };

  const onPickVideo = (item: MenuItemRow, file: File | undefined) => {
    if (!file) return;
    setVideoError(null);
    setVideoBusyId(item.id);
    const form = new FormData();
    form.set("id", String(item.id));
    form.set("file", file);
    setMenuItemVideo({ data: form })
      .then(({ videoUrl }) => {
        setItems((prev) =>
          prev!.map((i) => (i.id === item.id ? { ...i, video_url: videoUrl } : i)),
        );
      })
      .catch((err) => {
        setVideoError(err instanceof Error ? err.message : "Couldn't upload that clip.");
      })
      .finally(() => {
        setVideoBusyId(null);
        const input = videoInputs.current[item.id];
        if (input) input.value = "";
      });
  };

  const removeVideo = async (item: MenuItemRow) => {
    setVideoError(null);
    setVideoBusyId(item.id);
    try {
      await clearMenuItemVideo({ data: { id: item.id } });
      setItems((prev) => prev!.map((i) => (i.id === item.id ? { ...i, video_url: null } : i)));
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : "Couldn't remove that clip.");
    } finally {
      setVideoBusyId(null);
    }
  };

  const newDraftFor = (slug: string): NewItemDraft =>
    newDrafts[slug] ?? { name: "", description: "", price: "" };

  const addItem = async (slug: string, title: string) => {
    const draft = newDraftFor(slug);
    if (!draft.name.trim()) {
      setError(`Enter a name for the new ${noun}.`);
      return;
    }
    const priceRaw = draft.price.trim();
    const price = priceRaw === "" ? 0 : Number(priceRaw);
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price for the new item (or leave blank for On request).");
      return;
    }
    setAddingSlug(slug);
    setError(null);
    try {
      const { id } = await createMenuItem({
        data: {
          kind,
          category_slug: slug,
          category_title: title,
          name: draft.name,
          description: draft.description,
          price,
        },
      });
      setItems((prev) => [
        ...(prev ?? []),
        {
          id,
          kind,
          category_slug: slug,
          category_title: title,
          name: draft.name.trim(),
          description: draft.description.trim(),
          price_cents: Math.round(price * 100),
          image_url: null,
          video_url: null,
          featured: 0,
          available: 1,
          sort_order: 9999,
        },
      ]);
      setNewDrafts((d) => ({ ...d, [slug]: { name: "", description: "", price: "" } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : `Couldn't add that ${noun}.`);
    } finally {
      setAddingSlug(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={kind === "food" ? "Food Menu" : "Beverages"}
        description="Name, description, price and availability all save straight to the live public menu."
      />

      {error ? <ErrorState message={error} onRetry={() => setError(null)} /> : null}
      {imageError ? <ErrorState message={imageError} onRetry={() => setImageError(null)} /> : null}
      {videoError ? <ErrorState message={videoError} onRetry={() => setVideoError(null)} /> : null}

      {!items ? (
        <LoadingRows rows={6} />
      ) : items.length === 0 ? (
        <EmptyState
          title={`No ${noun}s yet`}
          description="Items will appear here once they're seeded into the menu."
        />
      ) : (
        <div className="space-y-6">
          {categories.map(([slug, title]) => (
            <SectionCard key={slug} title={title}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Photo</th>
                      <th className="py-2 pr-4">Clip</th>
                      <th className="py-2 pr-4">Description</th>
                      <th className="py-2 pr-4">Price ($)</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      .filter((i) => i.category_slug === slug)
                      .map((item) => {
                        const draft = draftFor(item);
                        return (
                          <tr key={item.id} className="border-b border-border/60 align-top">
                            <td className="py-3.5 pr-4">
                              <Input
                                value={draft.name}
                                onChange={(e) =>
                                  setDrafts((d) => ({
                                    ...d,
                                    [item.id]: { ...d[item.id], name: e.target.value },
                                  }))
                                }
                                className="min-w-[10rem] font-semibold"
                                aria-label={`${item.name} name`}
                              />
                            </td>
                            <td className="py-3.5 pr-4">
                              <div className="flex items-center gap-2">
                                {item.image_url ? (
                                  <img
                                    src={`/gallery-image/${item.image_url}`}
                                    alt={item.name}
                                    className="h-12 w-12 rounded-lg border border-border object-cover"
                                  />
                                ) : (
                                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-border text-[10px] text-muted-foreground">
                                    No photo
                                  </div>
                                )}
                                <div className="flex flex-col gap-1">
                                  <input
                                    ref={(el) => {
                                      fileInputs.current[item.id] = el;
                                    }}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => onPickPhoto(item, e.target.files?.[0])}
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    type="button"
                                    disabled={imageBusyId === item.id}
                                    onClick={() => fileInputs.current[item.id]?.click()}
                                  >
                                    {imageBusyId === item.id
                                      ? "…"
                                      : item.image_url
                                        ? "Change"
                                        : "Upload"}
                                  </Button>
                                  {item.image_url ? (
                                    <button
                                      type="button"
                                      disabled={imageBusyId === item.id}
                                      onClick={() => removePhoto(item)}
                                      className="text-xs text-muted-foreground underline decoration-dotted hover:text-destructive disabled:opacity-50"
                                    >
                                      Remove
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 pr-4">
                              <div className="flex items-center gap-2">
                                {item.video_url ? (
                                  <video
                                    src={`/gallery-image/${item.video_url}`}
                                    muted
                                    loop
                                    playsInline
                                    className="h-12 w-12 rounded-lg border border-border object-cover"
                                  />
                                ) : (
                                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-border text-[10px] text-muted-foreground">
                                    No clip
                                  </div>
                                )}
                                <div className="flex flex-col gap-1">
                                  <input
                                    ref={(el) => {
                                      videoInputs.current[item.id] = el;
                                    }}
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => onPickVideo(item, e.target.files?.[0])}
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    type="button"
                                    disabled={videoBusyId === item.id}
                                    onClick={() => videoInputs.current[item.id]?.click()}
                                  >
                                    {videoBusyId === item.id
                                      ? "…"
                                      : item.video_url
                                        ? "Change"
                                        : "Upload"}
                                  </Button>
                                  {item.video_url ? (
                                    <button
                                      type="button"
                                      disabled={videoBusyId === item.id}
                                      onClick={() => removeVideo(item)}
                                      className="text-xs text-muted-foreground underline decoration-dotted hover:text-destructive disabled:opacity-50"
                                    >
                                      Remove
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                            <td className="max-w-xs py-3.5 pr-4">
                              <Textarea
                                value={draft.description}
                                onChange={(e) =>
                                  setDrafts((d) => ({
                                    ...d,
                                    [item.id]: { ...d[item.id], description: e.target.value },
                                  }))
                                }
                                rows={3}
                                className="min-w-[16rem] text-sm text-muted-foreground"
                                aria-label={`${item.name} description`}
                              />
                            </td>
                            <td className="py-3.5 pr-4">
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="On request"
                                value={draft.price}
                                onChange={(e) =>
                                  setDrafts((d) => ({
                                    ...d,
                                    [item.id]: { ...d[item.id], price: e.target.value },
                                  }))
                                }
                                className="w-28"
                                aria-label={`${item.name} price`}
                              />
                            </td>
                            <td className="py-3.5 pr-4">
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-1 text-xs font-semibold",
                                  item.available
                                    ? "bg-success/15 text-success"
                                    : "bg-destructive/10 text-destructive",
                                )}
                              >
                                {item.available ? "Available" : "Sold out"}
                              </span>
                            </td>
                            <td className="py-3.5">
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  disabled={savingId === item.id}
                                  onClick={() => saveItem(item)}
                                >
                                  {savingId === item.id
                                    ? "Saving…"
                                    : savedId === item.id
                                      ? "Saved ✓"
                                      : "Save"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleAvailable(item)}
                                >
                                  {item.available ? "Mark sold out" : "Mark available"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={deletingId === item.id}
                                  onClick={() => removeItem(item)}
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  {deletingId === item.id ? "Removing…" : "Remove"}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                    {/* Add a new item to this category */}
                    <tr className="align-top">
                      <td className="py-3.5 pr-4">
                        <Input
                          placeholder={`New ${noun} name`}
                          value={newDraftFor(slug).name}
                          onChange={(e) =>
                            setNewDrafts((d) => ({
                              ...d,
                              [slug]: { ...newDraftFor(slug), name: e.target.value },
                            }))
                          }
                          className="min-w-[10rem]"
                          aria-label={`New ${noun} name for ${title}`}
                        />
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-muted-foreground">
                        Add photo after saving
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-muted-foreground">
                        Add clip after saving
                      </td>
                      <td className="max-w-xs py-3.5 pr-4">
                        <Textarea
                          placeholder="Description"
                          value={newDraftFor(slug).description}
                          onChange={(e) =>
                            setNewDrafts((d) => ({
                              ...d,
                              [slug]: { ...newDraftFor(slug), description: e.target.value },
                            }))
                          }
                          rows={3}
                          className="min-w-[16rem]"
                          aria-label={`New ${noun} description for ${title}`}
                        />
                      </td>
                      <td className="py-3.5 pr-4">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="On request"
                          value={newDraftFor(slug).price}
                          onChange={(e) =>
                            setNewDrafts((d) => ({
                              ...d,
                              [slug]: { ...newDraftFor(slug), price: e.target.value },
                            }))
                          }
                          className="w-28"
                          aria-label={`New ${noun} price for ${title}`}
                        />
                      </td>
                      <td className="py-3.5 pr-4" />
                      <td className="py-3.5">
                        <Button
                          size="sm"
                          disabled={addingSlug === slug}
                          onClick={() => addItem(slug, title)}
                        >
                          {addingSlug === slug ? "Adding…" : `Add ${noun}`}
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
