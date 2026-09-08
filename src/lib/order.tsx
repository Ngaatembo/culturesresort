import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { whatsappLink, whatsappMessages } from "@/lib/site-data";

/**
 * A guest's list of items they want to ask about. This is an ENQUIRY list, not
 * an order: nothing is charged, stored or sent to a kitchen. The only outbound
 * action is opening WhatsApp with the list written out for the guest to send.
 */
export type OrderLine = {
  id: string;
  name: string;
  category: string;
  price: string;
  qty: number;
};

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
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [open, setOpen] = useState(false);

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
      qty <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback((id: string) => setLines((prev) => prev.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setLines([]), []);

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
      whatsappHref: whatsappLink(body),
    };
  }, [lines, open, add, setQty, remove, clear]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside OrderProvider");
  return ctx;
}
