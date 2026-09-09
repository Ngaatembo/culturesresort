import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  listBookings,
  updateBookingStatus,
  type BookingRow,
  type BookingStatus,
} from "@/lib/data/bookings";
import { eventRequirements, eventTypes } from "@/lib/site-data";
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

export const Route = createFileRoute("/admin/events")({
  component: EventsPage,
});

const STATUSES: BookingStatus[] = ["pending", "confirmed", "declined", "completed", "cancelled"];

function EventsPage() {
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [active, setActive] = useState<BookingRow | null>(null);

  const load = () => {
    setError(null);
    listBookings()
      .then((all) => setBookings(all.filter((b) => b.event_type !== "Table reservation")))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Couldn't load event enquiries."),
      );
  };
  useEffect(load, []);

  const setStatus = async (id: number, status: BookingStatus) => {
    setBookings((prev) => (prev ? prev.map((b) => (b.id === id ? { ...b, status } : b)) : prev));
    setActive((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    try {
      await updateBookingStatus({ data: { id, status } });
    } catch {
      load();
    }
  };

  const filtered = useMemo(() => {
    if (!bookings) return null;
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!q) return true;
      return b.guest_name.toLowerCase().includes(q) || b.event_type.toLowerCase().includes(q);
    });
  }, [bookings, query, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events & Functions"
        description="Function and event enquiries, saved directly from the /events page as guests submit them."
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
              placeholder="Search by guest name or event type"
              className="pl-9"
              aria-label="Search event enquiries"
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
            title={bookings?.length ? "No enquiries match" : "No event enquiries yet"}
            description={
              bookings?.length
                ? "Try a different search or status filter."
                : "Birthday, function and event enquiries will show up here."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4">Guest</th>
                  <th className="py-2 pr-4">Event type</th>
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
                    aria-label={`View enquiry from ${b.guest_name}`}
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
                    <td className="py-3.5 pr-4">{b.event_type}</td>
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

      <SectionCard
        title="Enquiry form options"
        description="The choices guests see on the events page. Set in code (src/lib/site-data.ts) — not yet editable from here."
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Types of event
            </p>
            <ul className="mt-3 divide-y divide-border">
              {eventTypes.map((t) => (
                <li key={t} className="py-2.5 text-sm text-foreground">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Requests guests can tick
            </p>
            <ul className="mt-3 divide-y divide-border">
              {eventRequirements.map((t) => (
                <li key={t} className="py-2.5 text-sm text-foreground">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      <Drawer open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DrawerContent>
          {active ? (
            <div className="mx-auto w-full max-w-lg">
              <DrawerHeader>
                <DrawerTitle>{active.guest_name}</DrawerTitle>
                <DrawerDescription>
                  {active.event_type} · Requested {formatDateTime(active.created_at)}
                </DrawerDescription>
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
                      Phone
                    </p>
                    <p className="mt-1 font-medium text-foreground">{active.guest_phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={active.status} />
                    </div>
                  </div>
                </div>
                {(active.requirements || active.message) && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Notes
                    </p>
                    <p className="mt-1 text-foreground">
                      {[active.requirements, active.message].filter(Boolean).join(" — ")}
                    </p>
                  </div>
                )}
              </div>
              <DrawerFooter className="flex-row flex-wrap gap-2">
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
