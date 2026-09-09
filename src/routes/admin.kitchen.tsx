import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listOrders, updateOrderStatus, type OrderStatus, type OrderWithItems } from "@/lib/data/orders";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingRows, PageHeader } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/kitchen")({
  component: KitchenPage,
});

const COLUMNS: { status: OrderStatus; title: string; action?: { label: string; next: OrderStatus } }[] = [
  { status: "pending", title: "New", action: { label: "Start preparing", next: "preparing" } },
  { status: "preparing", title: "Preparing", action: { label: "Mark ready", next: "completed" } },
  { status: "completed", title: "Ready / Done" },
];

function KitchenPage() {
  const [orders, setOrders] = useState<OrderWithItems[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    listOrders()
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load the kitchen queue."));
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, []);

  const setStatus = async (id: number, status: OrderStatus) => {
    setOrders((prev) => (prev ? prev.map((o) => (o.id === id ? { ...o, status } : o)) : prev));
    try {
      await updateOrderStatus({ data: { id, status } });
    } catch {
      load();
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const isToday = (iso: string) => iso.slice(0, 10) === today;

  return (
    <div className="space-y-6">
      <PageHeader title="Kitchen" description="Live order queue — refreshes automatically every 20s." />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !orders ? (
        <LoadingRows rows={6} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((col) => {
            const items = orders.filter(
              (o) => o.status === col.status && (col.status !== "completed" || isToday(o.created_at)),
            );
            return (
              <div key={col.status} className="rounded-2xl border border-border bg-card shadow-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <p className="text-sm font-bold uppercase tracking-wide text-foreground">{col.title}</p>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-3 p-3">
                  {items.length === 0 ? (
                    <p className="px-2 py-6 text-center text-sm text-muted-foreground">Nothing here</p>
                  ) : (
                    items.map((o) => (
                      <div
                        key={o.id}
                        className={cn(
                          "rounded-xl border border-border p-4",
                          col.status === "pending" && "border-accent/60 bg-accent/5",
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <p className="text-lg font-bold text-foreground">#{o.id}</p>
                          <p className="text-xs text-muted-foreground">{o.customer_name}</p>
                        </div>
                        <ul className="mt-2 space-y-1 text-base">
                          {o.items.map((i) => (
                            <li key={i.id} className="font-medium text-foreground">
                              {i.qty} × {i.name}
                            </li>
                          ))}
                        </ul>
                        {col.action ? (
                          <Button
                            className="mt-3 h-11 w-full text-base"
                            size="lg"
                            onClick={() => setStatus(o.id, col.action!.next)}
                          >
                            {col.action.label}
                          </Button>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {orders && orders.length === 0 ? (
        <EmptyState title="No orders yet" description="New orders will appear here the moment they're placed." />
      ) : null}
    </div>
  );
}
