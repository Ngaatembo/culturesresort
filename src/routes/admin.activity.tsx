import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listOrders, type OrderWithItems } from "@/lib/data/orders";
import { listBookings, type BookingRow } from "@/lib/data/bookings";
import { listEnquiries, type EnquiryRow } from "@/lib/data/enquiries";
import {
  EmptyState,
  ErrorState,
  formatDateTime,
  formatMoney,
  LoadingRows,
  PageHeader,
  SectionCard,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/activity")({
  component: ActivityPage,
});

type Entry = { key: string; time: string; title: string; detail: string; href: string };

function build(orders: OrderWithItems[], bookings: BookingRow[], enquiries: EnquiryRow[]): Entry[] {
  const entries: Entry[] = [
    ...orders.map((o) => ({
      key: `order-${o.id}`,
      time: o.created_at,
      title: `Order #${o.id} placed`,
      detail: `${o.customer_name} · ${formatMoney(o.total_cents)}`,
      href: "/admin/orders",
    })),
    ...bookings.map((b) => ({
      key: `booking-${b.id}`,
      time: b.created_at,
      title:
        b.event_type === "Table reservation"
          ? "New reservation requested"
          : `New ${b.event_type} enquiry`,
      detail: `${b.guest_name} · ${b.guests ?? "?"} guests`,
      href: b.event_type === "Table reservation" ? "/admin/reservations" : "/admin/events",
    })),
    ...enquiries.map((e) => ({
      key: `enquiry-${e.id}`,
      time: e.created_at,
      title: "New contact-form enquiry",
      detail: e.name,
      href: "/admin/enquiries",
    })),
  ];
  return entries.sort((a, b) => b.time.localeCompare(a.time));
}

function ActivityPage() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    Promise.all([listOrders(), listBookings(), listEnquiries()])
      .then(([orders, bookings, enquiries]) => setEntries(build(orders, bookings, enquiries)))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Couldn't load the activity log."),
      );
  };
  useEffect(load, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Every order, reservation and enquiry as it came in — built from real timestamps, not a separate audit table yet."
      />

      <SectionCard>
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !entries ? (
          <LoadingRows rows={8} />
        ) : entries.length === 0 ? (
          <EmptyState
            title="Nothing yet"
            description="Activity will appear here as guests place orders, book tables or send enquiries."
          />
        ) : (
          <ul className="divide-y divide-border">
            {entries.map((a) => (
              <li key={a.key}>
                <Link
                  to={a.href}
                  className="-mx-2 flex items-center justify-between gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-secondary"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.detail}</p>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">{formatDateTime(a.time)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
