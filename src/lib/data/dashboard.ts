import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./cf";
import { authMiddleware } from "@/lib/auth/functions";

export type DashboardStats = {
  todaysOrders: number;
  todaysRevenueCents: number;
  pendingOrders: number;
  beingPrepared: number;
  completedOrders: number;
  pendingBookings: number;
  newEnquiries: number;
  menuItemsCount: number;
  unavailableItems: number;
};

/** Powers the admin Overview cards (today's orders, revenue, pending bookings, etc). */
export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async (): Promise<DashboardStats> => {
    const db = getDb();

    const [today, pending, preparing, completed, bookings, enquiries, items, unavailable] =
      await Promise.all([
        db
          .prepare(
            "SELECT COUNT(*) as n, COALESCE(SUM(total_cents),0) as revenue FROM orders WHERE date(created_at) = date('now') AND status != 'cancelled'",
          )
          .first<{ n: number; revenue: number }>(),
        db
          .prepare("SELECT COUNT(*) as n FROM orders WHERE status = 'pending'")
          .first<{ n: number }>(),
        db
          .prepare("SELECT COUNT(*) as n FROM orders WHERE status = 'preparing'")
          .first<{ n: number }>(),
        db
          .prepare(
            "SELECT COUNT(*) as n FROM orders WHERE status = 'completed' AND date(created_at) = date('now')",
          )
          .first<{ n: number }>(),
        db
          .prepare("SELECT COUNT(*) as n FROM bookings WHERE status = 'pending'")
          .first<{ n: number }>(),
        db
          .prepare("SELECT COUNT(*) as n FROM enquiries WHERE status = 'new'")
          .first<{ n: number }>(),
        db
          .prepare("SELECT COUNT(*) as n FROM menu_items WHERE available = 1")
          .first<{ n: number }>(),
        db
          .prepare("SELECT COUNT(*) as n FROM menu_items WHERE available = 0")
          .first<{ n: number }>(),
      ]);

    return {
      todaysOrders: today?.n ?? 0,
      todaysRevenueCents: today?.revenue ?? 0,
      pendingOrders: pending?.n ?? 0,
      beingPrepared: preparing?.n ?? 0,
      completedOrders: completed?.n ?? 0,
      pendingBookings: bookings?.n ?? 0,
      newEnquiries: enquiries?.n ?? 0,
      menuItemsCount: items?.n ?? 0,
      unavailableItems: unavailable?.n ?? 0,
    };
  });
