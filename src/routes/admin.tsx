import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AdminShell, KitchenShell } from "@/components/admin/shell";
import { getDashboardStats, type DashboardStats } from "@/lib/data/dashboard";
import { getAdminSession } from "@/lib/auth/functions";
import { canAccessRoute, defaultRouteForRole } from "@/lib/auth/permissions";
import type { AdminRole } from "@/lib/auth/admin-users";
import { AlertControl, useAlertSound, useNewArrivals } from "@/lib/admin-alerts";

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
    const role = session.role;
    if (!role) {
      throw redirect({ to: "/admin/login" });
    }
    // Page-level role gate. This only decides whether the page is allowed
    // to render for this role — every server function the page then calls
    // re-checks the role for itself (see requireRole in lib/auth/functions.ts),
    // so this redirect is a courtesy, not the security boundary: a role
    // that got here by editing the URL still can't get real data out of a
    // page it doesn't belong on, because the underlying server functions
    // reject it independently.
    if (!canAccessRoute(role, location.pathname)) {
      throw redirect({ to: defaultRouteForRole(role) });
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
 *
 * Kitchen accounts get a deliberately minimal shell (see KitchenShell) —
 * they only ever see the kitchen queue, so the full multi-section sidebar
 * would just be clutter (and a way to discover pages they can't open
 * anyway).
 */
function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublicPage = PUBLIC_ADMIN_PATHS.has(pathname);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const sound = useAlertSound();
  const arrivals = useNewArrivals();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const playRef = useRef(sound.play);
  playRef.current = sound.play;

  useEffect(() => {
    getAdminSession().then((s) => setRole(s?.role ?? null));
  }, []);

  useEffect(() => {
    if (isPublicPage || role === "kitchen") return;
    let cancelled = false;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const labels: Record<string, string> = {
      order: "New order",
      booking: "New reservation request",
      enquiry: "New enquiry",
    };
    // Anything still waiting gets a gentle repeat chime every 2 minutes, so a missed alert is not lost.
    let lastReminder = Date.now();
    const load = () => {
      getDashboardStats()
        .then((s) => {
          if (cancelled) return;
          setStats(s);
          const waiting = s.pendingOrders + s.pendingBookings + s.newEnquiries;
          if (waiting > 0 && Date.now() - lastReminder > 120_000) {
            lastReminder = Date.now();
            playRef.current();
          }
          const fresh = arrivals({
            order: s.latestOrderId,
            booking: s.latestBookingId,
            enquiry: s.latestEnquiryId,
          });
          if (fresh.length > 0) {
            playRef.current();
            setAlertMessage(fresh.map((k) => labels[k]).join(" · "));
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => setAlertMessage(null), 10000);
          }
        })
        .catch(() => {
          /* sidebar badges just stay as they were if this fails — non-critical */
        });
    };
    load();
    const id = setInterval(load, 25000);
    return () => {
      cancelled = true;
      clearInterval(id);
      clearTimeout(hideTimer);
    };
  }, [isPublicPage, role, arrivals]);

  // Show how many things are waiting in the browser tab, e.g. "(3) Owner Dashboard | Cultures Resort".
  const waitingCount = stats ? stats.pendingOrders + stats.pendingBookings + stats.newEnquiries : 0;
  useEffect(() => {
    if (isPublicPage) return;
    const base = document.title.replace(/^\(\d+\) /, "");
    document.title = waitingCount > 0 ? `(${waitingCount}) ${base}` : base;
    return () => {
      document.title = base;
    };
  }, [waitingCount, isPublicPage]);

  if (isPublicPage) {
    return <Outlet />;
  }

  if (role === "kitchen") {
    return (
      <KitchenShell>
        <Outlet />
      </KitchenShell>
    );
  }

  return (
    <AdminShell
      role={role}
      counts={{
        orders: stats ? stats.pendingOrders + stats.beingPrepared : undefined,
        kitchen: stats ? stats.pendingOrders + stats.beingPrepared : undefined,
        reservations: stats?.pendingBookings,
        enquiries: stats?.newEnquiries,
      }}
    >
      <Outlet />
      <AlertControl
        muted={sound.muted}
        ready={sound.ready}
        onToggle={sound.toggleMuted}
        message={alertMessage}
      />
    </AdminShell>
  );
}
