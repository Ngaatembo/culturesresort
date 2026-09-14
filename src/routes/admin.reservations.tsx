import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { MessageCircle } from "lucide-react";
import {
  listBookings,
  updateReservationStatus,
  type BookingRow,
  type BookingStatus,
} from "@/lib/data/bookings";
import { customerWhatsAppLink } from "@/lib/whatsapp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  EmptyState,
  ErrorState,
  formatDateTime,
  LoadingRows,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/reservations")({
  component: ReservationsPage,
});

const STATUSES: BookingStatus[] = ["pending", "confirmed", "declined", "completed", "cancelled"];

const RESERVATION_STATUS_MESSAGE: Record<BookingStatus, (b: BookingRow) => string> = {
  pending: (b) =>
    `Hi ${b.guest_name}, this is Cultures Resort. We've received your table reservation request${b.event_date ? ` for ${b.event_date}` : ""} and will confirm shortly.`,
  confirmed: (b) =>
    `Hi ${b.guest_name}, your table reservation at Cultures Resort${b.event_date ? ` for ${b.event_date}` : ""} is confirmed — we'll see you then!`,
  declined: (b) =>
    `Hi ${b.guest_name}, unfortunately we're unable to accommodate your reservation request${b.event_date ? ` for ${b.event_date}` : ""}. Please get in touch so we can find another time.`,
  completed: (b) =>
    `Hi ${b.guest_name}, thank you for dining with us at Cultures Resort — hope to see you again soon!`,
  cancelled: (b) =>
    `Hi ${b.guest_name}, your reservation at Cultures Resort has been cancelled. Let us know if you'd like to rebook.`,
};

/** The reservation form stores the requested time as "Time: HH:MM" in the
 * shared `requirements` column (event enquiries use that same column for a
 * comma-separated list of requirements instead — this parse only applies
 * here, on the Table reservation view). Pulling it out into its own
 * field/column matters in practice: without it, staff had to open every
 * single reservation to find out what time the guest is arriving. */
function parseRequestedTime(requirements: string | null): string | null {
  if (!requirements) return null;
  const match = requirements.match(/^Time:\s*(.+)$/);
  return match?.[1] ?? null;
}

function ReservationsPage() {
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [active, setActive] = useState<BookingRow | null>(null);

  const load = () => {
    setError(null);
    listBookings()
      .then((all) => setBookings(all.filter((b) => b.event_type === "Table reservation")))
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load reservations."));
  };
  useEffect(load, []);

  const setStatus = async (id: number, status: BookingStatus) => {
    setBookings((prev) => (prev ? prev.map((b) => (b.id === id ? { ...b, status } : b)) : prev));
    setActive((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    try {
      await updateReservationStatus({ data: { id, status } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update that status.");
      load();
    }
  };

  const filtered = useMemo(() => {
    if (!bookings) return null;
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!q) return true;
      return b.guest_name.toLowerCase().includes(q) || b.guest_phone.toLowerCase().includes(q);
    });
  }, [bookings, query, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservations"
        description="Table reservation requests, saved directly from the site as guests submit them."
      />

      <SectionCard>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by guest name or phone"
              className="pl-9"
              aria-label="Search reservations"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as BookingStatus | "all")}
          >
            <SelectTrigger className="w-full sm:w-48" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !filtered ? (
          <LoadingRows rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={bookings?.length ? "No reservations match" : "No reservations yet"}
            description={
              bookings?.length
                ? "Try a different search or status filter."
                : "There are no reservation requests scheduled yet."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4">Guest</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">Guests</th>
                  <th className="py-2 pr-4">Requested</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`View reservation for ${b.guest_name}`}
                    className="cursor-pointer border-b border-border/60 align-top outline-none hover:bg-secondary/60 focus-visible:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => setActive(b)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActive(b);
                      }
                    }}
                  >
                    <td className="py-3.5 pr-4">
                      <p className="font-semibold">{b.guest_name}</p>
                      <p className="text-xs text-muted-foreground">{b.guest_phone}</p>
                    </td>
                    <td className="py-3.5 pr-4">{b.event_date ?? "—"}</td>
                    <td className="py-3.5 pr-4 font-medium">
                      {parseRequestedTime(b.requirements) ?? "—"}
                    </td>
                    <td className="py-3.5 pr-4">{b.guests ?? "—"}</td>
                    <td className="py-3.5 pr-4 text-xs text-muted-foreground">
                      {formatDateTime(b.created_at)}
                    </td>
                    <td className="py-3.5 pr-4">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <Drawer open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DrawerContent>
          {active ? (
            <div className="mx-auto w-full max-w-lg">
              <DrawerHeader>
                <DrawerTitle>{active.guest_name}</DrawerTitle>
                <DrawerDescription>Requested {formatDateTime(active.created_at)}</DrawerDescription>
              </DrawerHeader>
              <div className="space-y-4 px-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Guests
                    </p>
                    <p className="mt-1 font-medium text-foreground">{active.guests ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Requested date
                    </p>
                    <p className="mt-1 font-medium text-foreground">{active.event_date ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Requested time
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      {parseRequestedTime(active.requirements) ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Phone
                    </p>
                    <p className="mt-1 font-medium text-foreground">{active.guest_phone}</p>
                  </div>
                  {active.guest_email ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Email
                      </p>
                      <p className="mt-1 font-medium text-foreground">{active.guest_email}</p>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={active.status} />
                    </div>
                  </div>
                </div>
                {active.message ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Notes
                    </p>
                    <p className="mt-1 text-foreground">{active.message}</p>
                  </div>
                ) : null}
              </div>
              <DrawerFooter className="flex-row flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <a
                    href={customerWhatsAppLink(
                      active.guest_phone,
                      RESERVATION_STATUS_MESSAGE[active.status](active),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    Message on WhatsApp
                  </a>
                </Button>
                {STATUSES.filter((s) => s !== active.status).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={
                      s === "declined" || s === "cancelled"
                        ? "destructive"
                        : s === "confirmed" || s === "completed"
                          ? "success"
                          : "secondary"
                    }
                    className="capitalize"
                    onClick={() => setStatus(active.id, s)}
                  >
                    Mark {s}
                  </Button>
                ))}
                <DrawerClose asChild>
                  <Button variant="outline" size="sm">
                    Close
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
