import { useEffect, useRef, useState } from "react";
import {
  clearMenuItemImage,
  clearMenuItemVideo,
  createMenuItem,
  deleteMenuItem,
  getMenuAdmin,
  getMenuOptionsAdmin,
  saveMenuItem,
  setMenuItemAvailability,
  setMenuItemImage,
  setMenuItemVideo,
  type MenuItemAdmin,
  type MenuItemOptionRow,
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
import { dishPhotos } from "@/lib/dish-photos";

type Draft = { name?: string; description?: string; price?: string };
type NewItemDraft = { name: string; description: string; price: string };
type OptionDraft = { label: string; price: string };
/** Unsaved portion changes for one menu item. Nothing here is written until that item's Save. */
type PortionEdits = {
  edits: Record<number, OptionDraft>;
  removed: number[];
  added: OptionDraft[];
  pending: OptionDraft;
};

const emptyPortionEdits = (): PortionEdits => ({
  edits: {},
  removed: [],
  added: [],
  pending: { label: "", price: "" },
});

const money = (cents: number) => (cents / 100).toFixed(2);

/**
 * Shared by /admin/menu and /admin/beverages (the Bar) — same real backend
 * (menu_items + menu_item_options in D1, filtered by `kind`), same editor.
 *
 * Each row has ONE Save button that writes the name, description, price and
 * every portion change together through saveMenuItem(). The row only shows
 * "Saved ✓" once the server has written and read the values back, and the
 * screen then shows exactly those stored values.
 */
export function MenuAdminPage({ kind, noun }: { kind: MenuKind; noun: string }) {
  const [items, setItems] = useState<MenuItemAdmin[] | null>(null);
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
  const [options, setOptions] = useState<Record<number, MenuItemOptionRow[]>>({});
  const [portionEdits, setPortionEdits] = useState<Record<number, PortionEdits>>({});
  const [addingSlug, setAddingSlug] = useState<string | null>(null);
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});
  const videoInputs = useRef<Record<number, HTMLInputElement | null>>({});

  /** Loads the stored rows from the database, discarding every unsaved edit. */
  const load = () => {
    setError(null);
    setItems(null);
    Promise.all([getMenuAdmin(), getMenuOptionsAdmin()])
      .then(([all, optionRows]) => {
        setItems(all.filter((i) => i.kind === kind));
        const grouped: Record<number, MenuItemOptionRow[]> = {};
        for (const row of optionRows) (grouped[row.menu_item_id] ??= []).push(row);
        setOptions(grouped);
        setDrafts({});
        setPortionEdits({});
      })
      .catch((err) => {
        console.error("[menu-admin] load failed", err);
        setError(err instanceof Error ? err.message : `Couldn't load the ${noun} list.`);
      });
  };
  useEffect(load, [kind]);

  const portionsFor = (itemId: number) => portionEdits[itemId] ?? emptyPortionEdits();
  const updatePortions = (itemId: number, fn: (p: PortionEdits) => PortionEdits) =>
    setPortionEdits((all) => ({ ...all, [itemId]: fn(all[itemId] ?? emptyPortionEdits()) }));

  const isDirty = (item: MenuItemAdmin) => {
    const d = drafts[item.id];
    const p = portionEdits[item.id];
    const textDirty =
      !!d &&
      ((d.name !== undefined && d.name !== item.name) ||
        (d.description !== undefined && d.description !== item.description) ||
        (d.price !== undefined &&
          d.price !== (item.price_cents > 0 ? money(item.price_cents) : "")));
    const portionDirty =
      !!p &&
      (p.removed.length > 0 ||
        p.added.length > 0 ||
        Object.entries(p.edits).some(([id, e]) => {
          const o = (options[item.id] ?? []).find((x) => x.id === Number(id));
          return !o || e.label !== o.label || e.price !== money(o.price_cents);
        }));
    return textDirty || portionDirty;
  };

  const anyDirty = !!items?.some(isDirty);
  useEffect(() => {
    if (!anyDirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [anyDirty]);

  const categories = items
    ? Array.from(new Map(items.map((i) => [i.category_slug, i.category_title])).entries())
    : [];

  const draftFor = (item: MenuItemAdmin): Required<Draft> => ({
    name: drafts[item.id]?.name ?? item.name,
    description: drafts[item.id]?.description ?? item.description,
    price: drafts[item.id]?.price ?? (item.price_cents > 0 ? money(item.price_cents) : ""),
  });

  const parsePrice = (raw: string, what: string): number => {
    const trimmed = raw.trim();
    const n = Number(trimmed);
    if (trimmed === "" || !Number.isFinite(n) || n < 0) {
      throw new Error(`Enter a valid price for ${what}.`);
    }
    return n;
  };

  const saveItem = async (item: MenuItemAdmin) => {
    const draft = draftFor(item);
    const p = portionsFor(item.id);
    const current = options[item.id] ?? [];
    let payload: Parameters<typeof saveMenuItem>[0]["data"];
    try {
      if (!draft.name.trim()) throw new Error("The name can't be empty.");
      const priceRaw = draft.price.trim();
      const price = priceRaw === "" ? 0 : Number(priceRaw);
      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Enter a valid price (or leave blank for On request).");
      }
      // Send every remaining portion with its current on-screen value, so nothing typed is lost.
      const kept = current.filter((o) => !p.removed.includes(o.id));
      const optionUpdates = kept.map((o) => {
        const e = p.edits[o.id] ?? { label: o.label, price: money(o.price_cents) };
        if (!e.label.trim()) throw new Error(`Every portion of ${draft.name} needs a label.`);
        return {
          id: o.id,
          label: e.label,
          price: parsePrice(e.price, `${draft.name} — ${e.label}`),
        };
      });
      const added = [...p.added];
      // A portion typed into the "add" boxes but not yet added still counts.
      if (p.pending.label.trim() || p.pending.price.trim()) added.push(p.pending);
      const newOptions = added.map((a) => {
        if (!a.label.trim()) throw new Error(`Give the new portion of ${draft.name} a label.`);
        return { label: a.label, price: parsePrice(a.price, `${draft.name} — ${a.label}`) };
      });
      payload = {
        id: item.id,
        expectedUpdatedAt: item.updated_at,
        name: draft.name,
        description: draft.description,
        price,
        options: optionUpdates,
        newOptions,
        removeOptionIds: p.removed,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check the values and try again.");
      return;
    }

    setSavingId(item.id);
    setSavedId(null);
    setError(null);
    try {
      const saved = await saveMenuItem({ data: payload });
      // Show exactly what the database returned — never the local draft.
      setItems((prev) => prev!.map((i) => (i.id === item.id ? saved.item : i)));
      setOptions((prev) => ({ ...prev, [item.id]: saved.options }));
      setDrafts((d) => {
        const { [item.id]: _drop, ...rest } = d;
        return rest;
      });
      setPortionEdits((all) => {
        const { [item.id]: _drop, ...rest } = all;
        return rest;
      });
      setSavedId(item.id);
      setTimeout(() => setSavedId((id) => (id === item.id ? null : id)), 2500);
    } catch (err) {
      console.error("[menu-admin] save failed", { id: item.id, err });
      setError(
        err instanceof Error
          ? `Not saved: ${err.message}`
          : "Not saved: couldn't save those changes. Your edits are still on screen — try again.",
      );
    } finally {
      setSavingId(null);
    }
  };

  const discardItem = (item: MenuItemAdmin) => {
    setDrafts((d) => {
      const { [item.id]: _drop, ...rest } = d;
      return rest;
    });
    setPortionEdits((all) => {
      const { [item.id]: _drop, ...rest } = all;
      return rest;
    });
  };

  const patchUpdatedAt = (id: number, patch: Partial<MenuItemAdmin>) =>
    setItems((prev) => prev!.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const toggleAvailable = async (item: MenuItemAdmin) => {
    const next = !item.available;
    setError(null);
    try {
      const res = await setMenuItemAvailability({ data: { id: item.id, available: next } });
      if (res.item) patchUpdatedAt(item.id, res.item);
    } catch (err) {
      console.error("[menu-admin] availability failed", err);
      setError(err instanceof Error ? err.message : "Couldn't update availability.");
    }
  };

  const removeItem = async (item: MenuItemAdmin) => {
    if (!window.confirm(`Remove "${item.name}" from the menu? This can't be undone.`)) return;
    setDeletingId(item.id);
    setError(null);
    try {
      await deleteMenuItem({ data: { id: item.id } });
      setItems((prev) => prev!.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error("[menu-admin] delete failed", err);
      setError(err instanceof Error ? err.message : "Couldn't remove that item.");
    } finally {
      setDeletingId(null);
    }
  };

  const onPickPhoto = (item: MenuItemAdmin, file: File | undefined) => {
    if (!file) return;
    setImageError(null);
    setImageBusyId(item.id);
    const form = new FormData();
    form.set("id", String(item.id));
    form.set("file", file);
    setMenuItemImage({ data: form })
      .then(({ imageUrl, updatedAt }) => {
        patchUpdatedAt(item.id, { image_url: imageUrl, updated_at: updatedAt });
      })
      .catch((err) => {
        console.error("[menu-admin] photo upload failed", err);
        setImageError(err instanceof Error ? err.message : "Couldn't upload that photo.");
      })
      .finally(() => {
        setImageBusyId(null);
        const input = fileInputs.current[item.id];
        if (input) input.value = "";
      });
  };

  const removePhoto = async (item: MenuItemAdmin) => {
    setImageError(null);
    setImageBusyId(item.id);
    try {
      const { updatedAt } = await clearMenuItemImage({ data: { id: item.id } });
      patchUpdatedAt(item.id, { image_url: null, updated_at: updatedAt });
    } catch (err) {
      console.error("[menu-admin] photo removal failed", err);
      setImageError(err instanceof Error ? err.message : "Couldn't remove that photo.");
    } finally {
      setImageBusyId(null);
    }
  };

  const onPickVideo = (item: MenuItemAdmin, file: File | undefined) => {
    if (!file) return;
    setVideoError(null);
    setVideoBusyId(item.id);
    const form = new FormData();
    form.set("id", String(item.id));
    form.set("file", file);
    setMenuItemVideo({ data: form })
      .then(({ videoUrl, updatedAt }) => {
        patchUpdatedAt(item.id, { video_url: videoUrl, updated_at: updatedAt });
      })
      .catch((err) => {
        console.error("[menu-admin] clip upload failed", err);
        setVideoError(err instanceof Error ? err.message : "Couldn't upload that clip.");
      })
      .finally(() => {
        setVideoBusyId(null);
        const input = videoInputs.current[item.id];
        if (input) input.value = "";
      });
  };

  const removeVideo = async (item: MenuItemAdmin) => {
    setVideoError(null);
    setVideoBusyId(item.id);
    try {
      const { updatedAt } = await clearMenuItemVideo({ data: { id: item.id } });
      patchUpdatedAt(item.id, { video_url: null, updated_at: updatedAt });
    } catch (err) {
      console.error("[menu-admin] clip removal failed", err);
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
      const { item } = await createMenuItem({
        data: {
          kind,
          category_slug: slug,
          category_title: title,
          name: draft.name,
          description: draft.description,
          price,
        },
      });
      setItems((prev) => [...(prev ?? []), item]);
      setNewDrafts((d) => ({ ...d, [slug]: { name: "", description: "", price: "" } }));
    } catch (err) {
      console.error("[menu-admin] add failed", err);
      setError(err instanceof Error ? err.message : `Couldn't add that ${noun}.`);
    } finally {
      setAddingSlug(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={kind === "food" ? "Food Menu" : "Bar & Beverages"}
        description={
          kind === "food"
            ? "Edit a dish, then press its Save button. Prices and portions save straight to the live public menu."
            : "The bar side of the menu. Edit a drink, then press its Save button — it saves straight to the live public menu."
        }
        actions={
          <Button type="button" variant="outline" onClick={load}>
            Reload from database
          </Button>
        }
      />

      {anyDirty ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
          You have unsaved changes (highlighted). Press <strong>Save</strong> on each highlighted
          row — nothing is saved until you do.
        </div>
      ) : null}
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
                      <th className="py-2 pr-4">Portions</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      .filter((i) => i.category_slug === slug)
                      .map((item) => {
                        const draft = draftFor(item);
                        const dirty = isDirty(item);
                        const itemOptions = options[item.id] ?? [];
                        const p = portionsFor(item.id);
                        const hasPortions =
                          itemOptions.filter((o) => !p.removed.includes(o.id)).length +
                            p.added.length >
                          0;
                        return (
                          <tr
                            key={item.id}
                            className={cn(
                              "border-b border-border/60 align-top",
                              dirty && "bg-amber-500/10",
                            )}
                          >
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
                                {item.image_url || dishPhotos[item.name] ? (
                                  <img
                                    src={
                                      item.image_url
                                        ? `/gallery-image/${item.image_url}`
                                        : dishPhotos[item.name]
                                    }
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
                              {hasPortions ? (
                                <p className="w-28 text-xs text-muted-foreground">
                                  Priced by portions →
                                  <br />
                                  shown as “From” the cheapest
                                </p>
                              ) : (
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
                              )}
                            </td>
                            <td className="py-3.5 pr-4">
                              <div className="min-w-[15rem] space-y-2">
                                {itemOptions.map((option) => {
                                  const removed = p.removed.includes(option.id);
                                  const edit = p.edits[option.id] ?? {
                                    label: option.label,
                                    price: money(option.price_cents),
                                  };
                                  return (
                                    <div
                                      key={option.id}
                                      className={cn(
                                        "flex items-center gap-2",
                                        removed && "opacity-50",
                                      )}
                                    >
                                      <Input
                                        value={edit.label}
                                        disabled={removed}
                                        onChange={(e) =>
                                          updatePortions(item.id, (x) => ({
                                            ...x,
                                            edits: {
                                              ...x.edits,
                                              [option.id]: { ...edit, label: e.target.value },
                                            },
                                          }))
                                        }
                                        className={cn("w-28", removed && "line-through")}
                                        aria-label={`${item.name} portion label`}
                                      />
                                      <Input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={edit.price}
                                        disabled={removed}
                                        onChange={(e) =>
                                          updatePortions(item.id, (x) => ({
                                            ...x,
                                            edits: {
                                              ...x.edits,
                                              [option.id]: { ...edit, price: e.target.value },
                                            },
                                          }))
                                        }
                                        className="w-24"
                                        aria-label={`${item.name} ${option.label} price`}
                                      />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        type="button"
                                        title={
                                          removed
                                            ? "Keep this portion"
                                            : "Remove this portion (on Save)"
                                        }
                                        onClick={() =>
                                          updatePortions(item.id, (x) => ({
                                            ...x,
                                            removed: removed
                                              ? x.removed.filter((id) => id !== option.id)
                                              : [...x.removed, option.id],
                                          }))
                                        }
                                      >
                                        {removed ? "Undo" : "×"}
                                      </Button>
                                    </div>
                                  );
                                })}
                                {p.added.map((a, idx) => (
                                  <div key={`new-${idx}`} className="flex items-center gap-2">
                                    <span className="w-28 truncate text-sm font-medium">
                                      {a.label}
                                    </span>
                                    <span className="w-24 text-sm">${a.price}</span>
                                    <span className="text-xs text-amber-600">new</span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      type="button"
                                      onClick={() =>
                                        updatePortions(item.id, (x) => ({
                                          ...x,
                                          added: x.added.filter((_, i) => i !== idx),
                                        }))
                                      }
                                    >
                                      ×
                                    </Button>
                                  </div>
                                ))}
                                <div className="flex items-center gap-2">
                                  <Input
                                    placeholder="Portion"
                                    value={p.pending.label}
                                    onChange={(e) =>
                                      updatePortions(item.id, (x) => ({
                                        ...x,
                                        pending: { ...x.pending, label: e.target.value },
                                      }))
                                    }
                                    className="w-28"
                                    aria-label={`New portion label for ${item.name}`}
                                  />
                                  <Input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    placeholder="Price"
                                    value={p.pending.price}
                                    onChange={(e) =>
                                      updatePortions(item.id, (x) => ({
                                        ...x,
                                        pending: { ...x.pending, price: e.target.value },
                                      }))
                                    }
                                    className="w-24"
                                    aria-label={`New portion price for ${item.name}`}
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                      const n = Number(p.pending.price);
                                      if (
                                        !p.pending.label.trim() ||
                                        p.pending.price.trim() === "" ||
                                        !Number.isFinite(n) ||
                                        n < 0
                                      ) {
                                        setError("Enter a portion label and a valid price.");
                                        return;
                                      }
                                      updatePortions(item.id, (x) => ({
                                        ...x,
                                        added: [...x.added, x.pending],
                                        pending: { label: "", price: "" },
                                      }));
                                    }}
                                  >
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5">
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  disabled={savingId === item.id}
                                  onClick={() => saveItem(item)}
                                  className={cn(dirty && "ring-2 ring-amber-500")}
                                >
                                  {savingId === item.id
                                    ? "Saving…"
                                    : savedId === item.id && !dirty
                                      ? "Saved ✓"
                                      : "Save"}
                                </Button>
                                {dirty && savingId !== item.id ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    type="button"
                                    onClick={() => discardItem(item)}
                                  >
                                    Discard
                                  </Button>
                                ) : null}
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
