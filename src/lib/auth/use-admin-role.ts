import { useEffect, useState } from "react";
import { getAdminSession } from "@/lib/auth/functions";
import type { AdminRole } from "@/lib/auth/admin-users";

/**
 * Roles that are allowed to see monetary figures (order totals, line-item
 * prices, revenue stats) in the admin panel. Kitchen and general staff
 * accounts can still manage orders/reservations day-to-day, they just don't
 * see the money attached to them.
 */
const ROLES_WITH_MONEY_ACCESS: AdminRole[] = ["owner", "manager"];

export function useAdminRole() {
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAdminSession().then((s) => {
      if (cancelled) return;
      setRole(s?.role ?? null);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    role,
    loaded,
    isOwner: role === "owner",
    // Defaults to false until the session loads, so amounts never flash
    // on screen for a restricted role before the check resolves.
    canViewAmounts: loaded && role ? ROLES_WITH_MONEY_ACCESS.includes(role) : false,
  };
}
