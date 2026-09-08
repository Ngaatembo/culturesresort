import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { useOrder } from "@/lib/order";
import { business } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function OrderDrawer() {
  const { open, closeDrawer, lines, count, setQty, remove, clear, whatsappHref, placeOrder, placing } = useOrder();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [placed, setPlaced] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  // Reset the "order placed" confirmation once the guest starts a new cart.
  useEffect(() => {
    if (lines.length > 0) setPlaced(null);
  }, [lines.length]);

  const handlePlaceOrder = async () => {
    setError(null);
    if (!name.trim() || !phone.trim()) {
      setError("Please add your name and phone number.");
      return;
    }
    try {
      const result = await placeOrder({ name, phone });
      setPlaced(result.orderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place the order. Please try again.");
    }
  };

  return (
    <>
      <div
        onClick={closeDrawer}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-[90] bg-ink/60 backdrop-blur-sm transition-opacity duration-400",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal={open}
        aria-label="Your order enquiry"
        aria-hidden={!open}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[95] flex max-h-[88vh] flex-col bg-background transition-transform duration-500 ease-out sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[26rem]",
          open ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full",
        )}
      >
        <div className="pattern-band h-1.5 w-full shrink-0" aria-hidden="true" />
        <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border px-5 py-5">
          <div className="min-w-0">
            <p className="eyebrow text-primary">Enquiry list</p>
            <h2 className="mt-2 font-display text-2xl">Items you want to ask about</h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close enquiry list"
            className="shrink-0 border border-border p-3"
            tabIndex={open ? 0 : -1}
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          {placed !== null ? (
            <div className="border border-dashed border-leaf px-6 py-14 text-center">
              <p className="font-display text-2xl">Order sent — #{placed}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The kitchen has your order. You can also send it on WhatsApp so they see it right away.
              </p>
              <Link
                to="/menu"
                onClick={closeDrawer}
                className="eyebrow mt-8 inline-block bg-primary px-6 py-4 text-primary-foreground"
                tabIndex={open ? 0 : -1}
              >
                Order something else
              </Link>
            </div>
          ) : lines.length === 0 ? (
            <div className="border border-dashed border-border px-6 py-14 text-center">
              <p className="font-display text-2xl">Nothing here yet</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Browse the food and beverage lists and add what you'd like. You can place it as a real order below,
                or just ask about it on WhatsApp first.
              </p>
              <Link
                to="/menu"
                onClick={closeDrawer}
                className="eyebrow mt-8 inline-block bg-primary px-6 py-4 text-primary-foreground"
                tabIndex={open ? 0 : -1}
              >
                Browse the menu
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {lines.map((l) => (
                <li key={l.id} className="border-b border-dashed border-border pb-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-lg leading-tight">{l.name}</p>
                      <p className="eyebrow mt-1 text-muted-foreground">{l.category}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{l.price}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQty(l.id, l.qty - 1)}
                        aria-label={`Fewer ${l.name}`}
                        className="border border-border p-2"
                        tabIndex={open ? 0 : -1}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm" aria-live="polite">
                        {l.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(l.id, l.qty + 1)}
                        aria-label={`More ${l.name}`}
                        className="border border-border p-2"
                        tabIndex={open ? 0 : -1}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(l.id)}
                    className="eyebrow mt-3 text-muted-foreground underline"
                    tabIndex={open ? 0 : -1}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="shrink-0 border-t border-border bg-secondary px-5 py-5">
          {lines.length > 0 && placed === null ? (
            <div className="mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  aria-label="Your name"
                  className="border border-input bg-background px-3 py-3 text-sm"
                  tabIndex={open ? 0 : -1}
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  aria-label="Phone number"
                  className="border border-input bg-background px-3 py-3 text-sm"
                  tabIndex={open ? 0 : -1}
                />
              </div>
              {error ? <p className="text-xs text-destructive">{error}</p> : null}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placing}
                className="eyebrow w-full bg-primary px-6 py-4 text-primary-foreground disabled:opacity-60"
                tabIndex={open ? 0 : -1}
              >
                {placing ? "Placing order…" : `Place order — ${count} item${count === 1 ? "" : "s"}`}
              </button>
            </div>
          ) : null}

          <p className="text-xs leading-relaxed text-muted-foreground">
            Placing an order sends it straight to the kitchen queue. You can also send it on WhatsApp so the team
            sees it right away.
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="eyebrow mt-4 flex items-center justify-center gap-3 bg-leaf px-6 py-4 text-bone"
            tabIndex={open ? 0 : -1}
          >
            <WhatsAppIcon className="h-4 w-4" />
            {lines.length ? `Send ${count} item${count === 1 ? "" : "s"} on WhatsApp` : "Ask on WhatsApp"}
          </a>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <a href={business.phoneHref} className="eyebrow border border-border px-4 py-4 text-center">
              Call
            </a>
            {lines.length ? (
              <button type="button" onClick={clear} className="eyebrow border border-border px-4 py-4" tabIndex={open ? 0 : -1}>
                Clear list
              </button>
            ) : (
              <Link to="/reservations" onClick={closeDrawer} className="eyebrow border border-border px-4 py-4 text-center">
                Book a table
              </Link>
            )}
          </div>
        </footer>
      </aside>
    </>
  );
}
