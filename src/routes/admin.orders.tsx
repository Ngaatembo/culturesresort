import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { listOrders, updateOrderStatus, type OrderStatus, type OrderWithItems } from "@/lib/data/orders";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  EmptyState,
  ErrorState,
  formatDateTime,
  formatMoney,
  LoadingRows,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

const ORDER_STATUSES: OrderStatus[] = ["pending", "preparing", "completed", "cancelled"];

const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
  pending: { label: "Start preparing", next: "preparing" },
  preparing: { label: "Mark completed", next: "completed" },
};

function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [active, setActive] = useState<OrderWithItems | null>(null);

  const load = () => {
    setError(null);
    listOrders()
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load orders."));
  };
  useEffect(load, []);

  const setStatus = async (id: number, status: OrderStatus) => {
    setOrders((prev) => (prev ? prev.map((o) => (o.id === id ? { ...o, status } : o)) : prev));
    setActive((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    try {
      await updateOrderStatus({ data: { id, status } });
    } catch {
      load();
    }
  };

  const filtered = useMemo(() => {
    if (!orders) return null;
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.toLowerCase().includes(q) ||
        String(o.id).includes(q)
      );
    });
  }, [orders, query, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Real orders placed from the cart. Update status as the kitchen works through them."
      />

      <SectionCard>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by customer, phone or order #"
              className="pl-9"
              aria-label="Search orders"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | "all")}>
            <SelectTrigger className="w-full sm:w-48" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !filtered ? (
          <LoadingRows rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={orders?.length ? "No orders match" : "No orders yet"}
            description={
              orders?.length
                ? "Try a different search or status filter."
                : "They'll appear here as soon as a guest checks out from the cart."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4">Order</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Items</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Placed</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr
                    key={o.id}
                    className="cursor-pointer border-b border-border/60 align-top hover:bg-secondary/60"
                    onClick={() => setActive(o)}
                  >
                    <td className="py-3.5 pr-4 font-semibold">#{o.id}</td>
                    <td className="py-3.5 pr-4">
                      <p>{o.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                    </td>
                    <td className="max-w-xs truncate py-3.5 pr-4 text-muted-foreground">
                      {o.items.map((i) => `${i.qty} × ${i.name}`).join(", ")}
                    </td>
                    <td className="py-3.5 pr-4 font-medium">{formatMoney(o.total_cents)}</td>
                    <td className="py-3.5 pr-4 text-xs text-muted-foreground">
                      {formatDateTime(o.created_at)}
                    </td>
                    <td className="py-3.5 pr-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3.5 text-right">
                      {NEXT_ACTION[o.status] ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatus(o.id, NEXT_ACTION[o.status]!.next);
                          }}
                        >
                          {NEXT_ACTION[o.status]!.label}
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <Drawer open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DrawerContent>
          {active ? (
            <div className="mx-auto w-full max-w-lg">
              <DrawerHeader>
                <DrawerTitle>Order #{active.id}</DrawerTitle>
                <DrawerDescription>{formatDateTime(active.created_at)}</DrawerDescription>
              </DrawerHeader>
              <div className="space-y-5 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{active.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{active.customer_phone}</p>
                  </div>
                  <StatusBadge status={active.status} />
                </div>
                <div className="rounded-lg border border-border">
                  <ul className="divide-y divide-border">
                    {active.items.map((i) => (
                      <li key={i.id} className="flex items-center justify-between px-3 py-2.5 text-sm">
                        <span>
                          {i.qty} × {i.name}
                        </span>
                        <span className="text-muted-foreground">
                          {formatMoney(i.price_cents * i.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between border-t border-border px-3 py-2.5 text-sm font-semibold">
                    <span>Total</span>
                    <span>{formatMoney(active.total_cents)}</span>
                  </div>
                </div>
                {active.notes ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Notes
                    </p>
                    <p className="mt-1 text-sm text-foreground">{active.notes}</p>
                  </div>
                ) : null}
              </div>
              <DrawerFooter className="flex-row flex-wrap gap-2">
                {ORDER_STATUSES.filter((s) => s !== active.status).map((s) => (
                  <Button
                    key={s}
                    variant={s === "cancelled" ? "destructive" : s === "completed" ? "success" : "secondary"}
                    size="sm"
                    onClick={() => setStatus(active.id, s)}
                    className="capitalize"
                  >
                    Mark {s}
                  </Button>
                ))}
                <DrawerClose asChild>
                  <Button variant="outline" size="sm">
                    Close
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
