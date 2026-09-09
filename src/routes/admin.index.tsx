import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag, CalendarCheck2, MessageSquare, DollarSign, ArrowRight } from "lucide-react";
import { getDashboardStats, type DashboardStats } from "@/lib/data/dashboard";
import { listOrders, type OrderWithItems } from "@/lib/data/orders";
import { listBookings, type BookingRow } from "@/lib/data/bookings";
import { listEnquiries, type EnquiryRow } from "@/lib/data/enquiries";
import {
  EmptyState,
  ErrorState,
  formatMoney,
  formatTimeAgo,
  LoadingRows,
  PageHeader,
  SectionCard,
  StatCard,
  StatusDot,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

type ActivityEntry = {
  key: string;
  time: string;
  title: string;
  detail: string;
  href: string;
};

function buildActivity(
  orders: OrderWithItems[],
  bookings: BookingRow[],
  enquiries: EnquiryRow[],
): ActivityEntry[] {
  const entries: ActivityEntry[] = [
    ...orders.map((o) => ({
      key: `order-${o.id}`,
      time: o.created_at,
      title: `Order #${o.id}`,
      detail: `${o.customer_name} · ${formatMoney(o.total_cents)}`,
      href: "/admin/orders",
    })),
    ...bookings.map((b) => ({
      key: `booking-${b.id}`,
      time: b.created_at,
      title: b.event_type === "Table reservation" ? "New reservation" : `New ${b.event_type} enquiry`,
      detail: `${b.guest_name} · ${b.guests ?? "?"} guests`,
      href: b.event_type === "Table reservation" ? "/admin/reservations" : "/admin/events",
    })),
    ...enquiries.map((e) => ({
      key: `enquiry-${e.id}`,
      time: e.created_at,
      title: "New enquiry",
      detail: e.name,
      href: "/admin/enquiries",
    })),
  ];
  return entries.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 8);
}

function Overview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    Promise.all([getDashboardStats(), listOrders(), listBookings(), listEnquiries()])
      .then(([s, orders, bookings, enquiries]) => {
        setStats(s);
        setActivity(buildActivity(orders.slice(0, 8), bookings.slice(0, 8), enquiries.slice(0, 8)));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load the dashboard."));
  };

  useEffect(load, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, Cultures 👋`}
        description="Here's what's happening across Cultures Resort today."
      />

      {error ? <ErrorState message={error} onRetry={load} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's orders"
          value={stats ? String(stats.todaysOrders) : "…"}
          hint={stats ? `${stats.pendingOrders} pending · ${stats.beingPrepared} in kitchen` : undefined}
        />
        <StatCard
          label="Reservations"
          value={stats ? String(stats.pendingBookings) : "…"}
          hint="Awaiting confirmation"
        />
        <StatCard
          label="New enquiries"
          value={stats ? String(stats.newEnquiries) : "…"}
          hint="From the contact form"
        />
        <StatCard
          label="Today's revenue"
          value={stats ? formatMoney(stats.todaysRevenueCents) : "…"}
          hint="From today's orders"
          tone="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Today's activity" className="lg:col-span-2">
          {!activity ? (
            <LoadingRows rows={5} />
          ) : activity.length === 0 ? (
            <EmptyState
              title="Nothing yet today"
              description="New orders, reservations and enquiries will show up here as guests submit them."
            />
          ) : (
            <ul className="divide-y divide-border">
              {activity.map((a) => (
                <li key={a.key}>
                  <Link
                    to={a.href}
                    className="-mx-2 flex items-center justify-between gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-secondary"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{a.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.detail}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      {formatTimeAgo(a.time)}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="System status">
            <div className="space-y-3">
              <StatusDot tone={error ? "off" : stats ? "ok" : "warn"}>
                {error ? "Database unreachable" : stats ? "Database connected" : "Connecting…"}
              </StatusDot>
              <StatusDot tone="ok">Orders, reservations & enquiries — live</StatusDot>
              <StatusDot tone="warn">Gallery, hours & contact — setup required</StatusDot>
            </div>
          </SectionCard>

          <SectionCard title="Quick links">
            <div className="grid gap-2">
              {[
                { to: "/admin/orders", label: "View orders", icon: ShoppingBag },
                { to: "/admin/reservations", label: "View reservations", icon: CalendarCheck2 },
                { to: "/admin/enquiries", label: "View enquiries", icon: MessageSquare },
                { to: "/admin/menu", label: "Update menu prices", icon: DollarSign },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <span className="flex items-center gap-2">
                    <l.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    {l.label}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
