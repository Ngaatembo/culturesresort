import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listOrders, type OrderWithItems } from "@/lib/data/orders";
import { listBookings, type BookingRow } from "@/lib/data/bookings";
import { listEnquiries, type EnquiryRow } from "@/lib/data/enquiries";
import { listAdminActivityLog, type AdminActivityLogRow } from "@/lib/data/activity-log";
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

type Entry = { key: string; time: string; title: string; detail: string; href?: string };

function build(
  orders: OrderWithItems[],
  bookings: BookingRow[],
  enquiries: EnquiryRow[],
  audit: AdminActivityLogRow[],
): Entry[] {
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
    // Real who-did-what admin actions — staff account changes, business
    // settings, deletions. This is the part that answers "did someone
    // tamper with anything": these rows record which admin account made
    // the change, not just that something changed.
    ...audit.map((a) => ({
      key: `audit-${a.id}`,
      time: a.created_at,
      title: a.action,
      detail: `${a.actor_email} (${a.actor_role})${a.details ? ` · ${a.details}` : ""}`,
    })),
  ];
  return entries.sort((a, b) => b.time.localeCompare(a.time));
}

function ActivityPage() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    Promise.all([listOrders(), listBookings(), listEnquiries(), listAdminActivityLog()])
      .then(([orders, bookings, enquiries, audit]) =>
        setEntries(build(orders, bookings, enquiries, audit)),
      )
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Couldn't load the activity log."),
      );
  };
  useEffect(load, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Every order, reservation and enquiry as it came in, plus a record of sensitive admin actions — staff accounts, roles and business settings — so you can see who changed what."
      />

      <SectionCard>
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !entries ? (
          <LoadingRows rows={8} />
        ) : entries.length === 0 ? (
          <EmptyState
            title="Nothing yet"
            description="Activity will appear here as guests place orders, book tables or send enquiries — and as admin actions happen."
          />
        ) : (
          <ul className="divide-y divide-border">
            {entries.map((a) => {
              const row = (
                <div className="-mx-2 flex items-center justify-between gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-secondary">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.detail}</p>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">{formatDateTime(a.time)}</p>
                </div>
              );
              return <li key={a.key}>{a.href ? <Link to={a.href}>{row}</Link> : row}</li>;
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
