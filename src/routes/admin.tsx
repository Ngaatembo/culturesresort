import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/shell";
import { getDashboardStats, type DashboardStats } from "@/lib/data/dashboard";
import { getAdminSession } from "@/lib/auth/functions";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/setup"]);

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard | Cultures Resort" },
      { name: "description", content: "Owner dashboard for Cultures Resort." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  beforeLoad: async ({ location }) => {
    if (PUBLIC_ADMIN_PATHS.has(location.pathname)) return;
    // A misconfigured SESSION_SECRET (or a migration that hasn't run yet)
    // must never crash the page — fail safe by sending the visitor to
    // login, where the real error surfaces as a readable inline message
    // instead of the generic error boundary.
    let session: Awaited<ReturnType<typeof getAdminSession>> | null = null;
    try {
      session = await getAdminSession();
    } catch {
      session = null;
    }
    if (!session) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminLayout,
});

/**
 * Layout route for everything under /admin. Owns the shell (sidebar +
 * topbar) and the one shared poll for sidebar badge counts; each child
 * route fetches its own page data independently via Outlet.
 *
 * /admin/login and /admin/setup render their own full-page layout and are
 * exempt from both the auth check above and the shell below — they're how
 * you get a session in the first place.
 */
function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublicPage = PUBLIC_ADMIN_PATHS.has(pathname);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (isPublicPage) return;
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
  }, [isPublicPage]);

  if (isPublicPage) {
    return <Outlet />;
  }

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
