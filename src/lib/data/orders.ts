import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./cf";
import { authMiddleware } from "@/lib/auth/functions";

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

/** Recent orders for the admin dashboard, most recent first. */
export const listOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
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

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: number; status: OrderStatus }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    await db
      .prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(data.status, data.id)
      .run();
    return { ok: true };
  });
