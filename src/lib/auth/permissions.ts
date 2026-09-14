import type { AdminRole } from "./admin-users";

/**
 * Single source of truth for who can see which /admin page.
 *
 * This only decides page-level *visibility* (nav items + route redirects).
 * The real enforcement — the layer a malicious user can't bypass by editing
 * the URL or calling a server function directly — lives on the server
 * functions themselves (see the `requireRole`-based middlewares in
 * ./functions.ts and how each src/lib/data/*.ts file applies them). Treat
 * this file as UI convenience, never as the security boundary.
 */
export const ROLE_LABELS: Record<AdminRole, string> = {
  owner: "Owner",
  manager: "Manager",
  staff: "Staff",
  kitchen: "Kitchen",
};

/** Every role that isn't `kitchen` gets the normal multi-section admin shell. */
export const ADMIN_ROLES: AdminRole[] = ["owner", "manager", "staff", "kitchen"];

const OWNER: AdminRole[] = ["owner"];
const MANAGER_UP: AdminRole[] = ["owner", "manager"];
const STAFF_UP: AdminRole[] = ["owner", "manager", "staff"];
const ORDERS_VIEW: AdminRole[] = ["owner", "manager", "staff", "kitchen"];
const KITCHEN_UP: AdminRole[] = ["owner", "manager", "kitchen"];

/**
 * pathname -> roles allowed to view that page. Checked in `/admin`'s
 * `beforeLoad`, which runs for every child route, so this is enforced in
 * exactly one place rather than copy-pasted into 15 route files.
 *
 * Anything not listed here defaults to owner-only (fail closed) — see
 * `getAllowedRoles`.
 */
export const ROUTE_ROLES: Record<string, AdminRole[]> = {
  "/admin": STAFF_UP, // Overview — kitchen gets its own queue page instead
  "/admin/orders": ORDERS_VIEW,
  "/admin/kitchen": KITCHEN_UP,
  "/admin/reservations": STAFF_UP,
  "/admin/enquiries": STAFF_UP,
  "/admin/menu": MANAGER_UP,
  "/admin/beverages": MANAGER_UP,
  "/admin/gallery": MANAGER_UP,
  "/admin/events": MANAGER_UP,
  "/admin/hours": OWNER,
  "/admin/visit-details": OWNER,
  "/admin/contact": OWNER,
  "/admin/staff": OWNER,
  "/admin/settings": OWNER,
  "/admin/activity": MANAGER_UP, // owner + manager can review staff actions
  "/admin/account": ADMIN_ROLES, // every role manages their own password here
};

export function getAllowedRoles(pathname: string): AdminRole[] {
  return ROUTE_ROLES[pathname] ?? OWNER;
}

export function canAccessRoute(role: AdminRole | null | undefined, pathname: string): boolean {
  if (!role) return false;
  return getAllowedRoles(pathname).includes(role);
}

/** Where to send a role after login, or after it's bounced off a page it can't see. */
export function defaultRouteForRole(role: AdminRole): string {
  switch (role) {
    case "kitchen":
      return "/admin/kitchen";
    case "staff":
      return "/admin/orders";
    case "manager":
    case "owner":
    default:
      return "/admin";
  }
}
