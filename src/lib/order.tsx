import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { whatsappLink, whatsappMessages } from "@/lib/site-data";
import { useSiteSettings } from "@/lib/site-settings-query";
import { placeOrder as placeOrderServerFn } from "@/lib/data/orders";

/**
 * A guest's cart line. Adding an item both opens the WhatsApp-prefilled
 * enquiry (for guests who'd rather just ask) and can be submitted as a real
 * order, saved to the restaurant's order queue and visible in the admin
 * dashboard.
 */
export type OrderLine = {
  id: string;
  name: string;
  category: string;
  price: string;
  qty: number;
};

/** "$4.50" -> 450. Placeholder prices like "On request" become 0. */
function priceToCents(price: string): number {
  const match = price.match(/[\d.]+/);
  if (!match) return 0;
  return Math.round(parseFloat(match[0]) * 100);
}

type PlaceOrderResult = { orderId: number; totalCents: number };

type OrderContextValue = {
  lines: OrderLine[];
  count: number;
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (item: { id: string; name: string; category: string; price: string }) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  whatsappHref: string;
  /** Same text as whatsappHref, before URL-encoding — used to also log the enquiry. */
  whatsappBody: string;
  /** Submits the cart as a real order. Throws on failure — caller shows the message. */
  placeOrder: (customer: {
    name: string;
    phone: string;
    notes?: string;
  }) => Promise<PlaceOrderResult>;
  placing: boolean;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { business } = useSiteSettings();
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [open, setOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  const add = useCallback((item: { id: string; name: string; category: string; price: string }) => {
    setLines((prev) => {
      const found = prev.find((l) => l.id === item.id);
      if (found) return prev.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { ...item, qty: 1 }];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback(
    (id: string) => setLines((prev) => prev.filter((l) => l.id !== id)),
    [],
  );
  const clear = useCallback(() => setLines([]), []);

  const placeOrder = useCallback(
    async (customer: { name: string; phone: string; notes?: string }) => {
      setPlacing(true);
      try {
        const result = await placeOrderServerFn({
          data: {
            customerName: customer.name,
            customerPhone: customer.phone,
            notes: customer.notes,
            lines: lines.map((l) => ({
              name: l.name,
              priceCents: priceToCents(l.price),
              qty: l.qty,
            })),
          },
        });
        setLines([]);
        return result;
      } finally {
        setPlacing(false);
      }
    },
    [lines],
  );

  const value = useMemo<OrderContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const body = lines.length
      ? `${whatsappMessages.order}\n${lines.map((l) => `• ${l.qty} × ${l.name} (${l.category})`).join("\n")}\n\nCould you confirm availability and pricing, please?`
      : whatsappMessages.menu;

    return {
      lines,
      count,
      open,
      openDrawer: () => setOpen(true),
      closeDrawer: () => setOpen(false),
      add,
      setQty,
      remove,
      clear,
      has: (id: string) => lines.some((l) => l.id === id),
      whatsappHref: whatsappLink(body, business.whatsappNumber),
      whatsappBody: body,
      placeOrder,
      placing,
    };
  }, [lines, open, add, setQty, remove, clear, placeOrder, placing, business.whatsappNumber]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside OrderProvider");
  return ctx;
}
