import { useEffect, useState } from "react";
import {
  getMenuAdmin,
  setMenuItemAvailability,
  setMenuItemPrice,
  type MenuItemRow,
  type MenuKind,
} from "@/lib/data/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EmptyState,
  ErrorState,
  LoadingRows,
  PageHeader,
  SectionCard,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";

/**
 * Shared by /admin/menu and /admin/beverages — same real backend
 * (menu_items in D1, filtered by `kind`), same editor. Prices and
 * availability save straight to the live public menu.
 */
export function MenuAdminPage({ kind, noun }: { kind: MenuKind; noun: string }) {
  const [items, setItems] = useState<MenuItemRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);

  const load = () => {
    setError(null);
    getMenuAdmin()
      .then((all) => setItems(all.filter((i) => i.kind === kind)))
      .catch((err) => setError(err instanceof Error ? err.message : `Couldn't load the ${noun} list.`));
  };
  useEffect(load, [kind]);

  const categories = items
    ? Array.from(new Map(items.map((i) => [i.category_slug, i.category_title])).entries())
    : [];

  const savePrice = async (item: MenuItemRow) => {
    const raw = drafts[item.id] ?? (item.price_cents > 0 ? (item.price_cents / 100).toFixed(2) : "");
    const price = raw.trim() === "" ? 0 : Number(raw);
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price (or leave blank for On request).");
      return;
    }
    setSavingId(item.id);
    setError(null);
    try {
      await setMenuItemPrice({ data: { id: item.id, price } });
      setItems((prev) =>
        prev!.map((i) => (i.id === item.id ? { ...i, price_cents: Math.round(price * 100) } : i)),
      );
      setSavedId(item.id);
      setTimeout(() => setSavedId((id) => (id === item.id ? null : id)), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the price.");
    } finally {
      setSavingId(null);
    }
  };

  const toggleAvailable = async (item: MenuItemRow) => {
    const next = !item.available;
    setItems((prev) => prev!.map((i) => (i.id === item.id ? { ...i, available: next ? 1 : 0 } : i)));
    try {
      await setMenuItemAvailability({ data: { id: item.id, available: next } });
    } catch {
      load();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={kind === "food" ? "Food Menu" : "Beverages"}
        description="Prices and availability save straight to the live public menu."
      />

      {error ? <ErrorState message={error} onRetry={load} /> : null}

      {!items ? (
        <LoadingRows rows={6} />
      ) : items.length === 0 ? (
        <EmptyState title={`No ${noun}s yet`} description="Items will appear here once they're seeded into the menu." />
      ) : (
        <div className="space-y-6">
          {categories.map(([slug, title]) => (
            <SectionCard key={slug} title={title}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-4">Item</th>
                      <th className="py-2 pr-4">Description</th>
                      <th className="py-2 pr-4">Price ($)</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      .filter((i) => i.category_slug === slug)
                      .map((item) => (
                        <tr key={item.id} className="border-b border-border/60 align-top">
                          <td className="py-3.5 pr-4 font-semibold text-foreground">{item.name}</td>
                          <td className="max-w-xs py-3.5 pr-4 text-muted-foreground">
                            {item.description}
                          </td>
                          <td className="py-3.5 pr-4">
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="On request"
                              defaultValue={item.price_cents > 0 ? (item.price_cents / 100).toFixed(2) : ""}
                              onChange={(e) => setDrafts((d) => ({ ...d, [item.id]: e.target.value }))}
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
                              <Button size="sm" disabled={savingId === item.id} onClick={() => savePrice(item)}>
                                {savingId === item.id ? "Saving…" : savedId === item.id ? "Saved ✓" : "Save"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => toggleAvailable(item)}>
                                {item.available ? "Mark sold out" : "Mark available"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
