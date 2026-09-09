import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/shell";
import { getDashboardStats, type DashboardStats } from "@/lib/data/dashboard";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard | Cultures Resort" },
      { name: "description", content: "Owner dashboard for Cultures Resort." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLayout,
});

/**
 * Layout route for everything under /admin. Owns the shell (sidebar +
 * topbar) and the one shared poll for sidebar badge counts; each child
 * route fetches its own page data independently via Outlet.
 */
function AdminLayout() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDashboardStats()
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch(() => {
        /* sidebar badges just stay hidden if this fails — non-critical */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminShell
      counts={{
        orders: stats ? stats.pendingOrders + stats.beingPrepared : undefined,
        kitchen: stats ? stats.pendingOrders + stats.beingPrepared : undefined,
        reservations: stats?.pendingBookings,
        enquiries: stats?.newEnquiries,
      }}
    >
      <Outlet />
    </AdminShell>
  );
}
