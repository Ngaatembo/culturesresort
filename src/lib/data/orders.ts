import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./cf";
import { ordersViewMiddleware } from "@/lib/auth/functions";
import { sendNotificationEmail } from "./notify";

export type OrderStatus = "pending" | "preparing" | "completed" | "cancelled";

export type PlaceOrderLine = {
  menuItemId?: number;
  name: string;
  priceCents: number;
  qty: number;
};

export type PlaceOrderInput = {
  customerName: string;
  customerPhone: string;
  notes?: string | undefined;
  lines: PlaceOrderLine[];
};

/** Places a real order (persisted, shows up in the admin dashboard). */
export const placeOrder = createServerFn({ method: "POST" })
  .validator((data: PlaceOrderInput) => data)
  .handler(async ({ data }) => {
    const { customerName, customerPhone, notes, lines } = data;
    if (!customerName?.trim() || !customerPhone?.trim()) {
      throw new Error("Name and phone are required.");
    }
    if (!lines?.length) {
      throw new Error("Your order is empty.");
    }

    const db = getDb();
    const totalCents = lines.reduce((sum, l) => sum + l.priceCents * l.qty, 0);

    const orderResult = await db
      .prepare(
        "INSERT INTO orders (customer_name, customer_phone, notes, total_cents) VALUES (?, ?, ?, ?)",
      )
      .bind(customerName.trim(), customerPhone.trim(), notes?.trim() || null, totalCents)
      .run();

    const orderId = orderResult.meta.last_row_id;
    if (!orderId) throw new Error("Could not create the order.");

    for (const line of lines) {
      await db
        .prepare(
          "INSERT INTO order_items (order_id, menu_item_id, name, price_cents, qty) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(orderId, line.menuItemId ?? null, line.name, line.priceCents, line.qty)
        .run();
    }

    await sendNotificationEmail(
      `New order #${orderId} — ${(totalCents / 100).toFixed(2)}`,
      [
        `${customerName} (${customerPhone})`,
        "",
        ...lines.map((l) => `${l.qty} x ${l.name} — $${((l.priceCents * l.qty) / 100).toFixed(2)}`),
        "",
        `Total: $${(totalCents / 100).toFixed(2)}`,
        notes ? `Notes: ${notes}` : null,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    );

    return { orderId, totalCents };
  });

type OrderRow = {
  id: number;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  notes: string | null;
  total_cents: number;
  created_at: string;
};

type OrderItemRow = {
  id: number;
  order_id: number;
  name: string;
  price_cents: number;
  qty: number;
};

export type OrderWithItems = OrderRow & { items: OrderItemRow[] };

/** Recent orders for the admin dashboard, most recent first. Owner, manager
 * and staff get the full operational view; kitchen gets read access too
 * (that's the whole point of the kitchen queue) but see updateOrderStatus
 * below for how their write access is restricted. */
export const listOrders = createServerFn({ method: "GET" })
  .middleware([ordersViewMiddleware])
  .handler(async (): Promise<OrderWithItems[]> => {
    const db = getDb();
    const { results: orders } = await db
      .prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 100")
      .all<OrderRow>();

    if (!orders.length) return [];

    const ids = orders.map((o) => o.id);
    const placeholders = ids.map(() => "?").join(",");
    const { results: items } = await db
      .prepare(`SELECT * FROM order_items WHERE order_id IN (${placeholders})`)
      .bind(...ids)
      .all<OrderItemRow>();

    return orders.map((o) => ({ ...o, items: items.filter((i) => i.order_id === o.id) }));
  });

/**
 * Kitchen accounts only move an order forward through the kitchen
 * workflow (New → Preparing → Ready) — they can't cancel an order, jump
 * straight to "completed" from "pending", or move a status backwards.
 * Everyone else (owner/manager/staff) can set any status, matching the
 * existing Orders page workflow.
 */
const KITCHEN_ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["preparing"],
  preparing: ["completed"],
  completed: [],
  cancelled: [],
};

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([ordersViewMiddleware])
  .validator((data: { id: number; status: OrderStatus }) => data)
  .handler(async ({ data, context }) => {
    const db = getDb();

    if (context.admin?.role === "kitchen") {
      const current = await db
        .prepare("SELECT status FROM orders WHERE id = ?")
        .bind(data.id)
        .first<{ status: OrderStatus }>();
      const allowed = current ? KITCHEN_ALLOWED_TRANSITIONS[current.status] : [];
      if (!current || !allowed.includes(data.status)) {
        throw new Error(
          "Kitchen accounts can only move an order forward: New → Preparing → Ready.",
        );
      }
    }

    await db
      .prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(data.status, data.id)
      .run();
    return { ok: true };
  });
