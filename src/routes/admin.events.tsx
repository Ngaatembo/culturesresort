import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, Star, Trash2 } from "lucide-react";
import {
  listBookings,
  updateBookingStatus,
  type BookingRow,
  type BookingStatus,
} from "@/lib/data/bookings";
import { getSiteSettings, updateSiteSetting } from "@/lib/data/settings";
import {
  createSiteEvent,
  deleteSiteEvent,
  listSiteEventsAdmin,
  updateSiteEvent,
  type SiteEventRow,
  type SiteEventStatus,
} from "@/lib/data/site-events";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { cn } from "@/lib/utils";

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
  const [eventTypes, setEventTypes] = useState<string[] | null>(null);
  const [eventRequirements, setEventRequirements] = useState<string[] | null>(null);
  const [savingList, setSavingList] = useState<"eventTypes" | "eventRequirements" | null>(null);
  const [savedList, setSavedList] = useState<"eventTypes" | "eventRequirements" | null>(null);
  const [siteEvents, setSiteEvents] = useState<SiteEventRow[] | null>(null);
  const [siteEventsError, setSiteEventsError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<SiteEventRow | "new" | null>(null);

  const loadSiteEvents = () => {
    setSiteEventsError(null);
    listSiteEventsAdmin()
      .then((rows) => setSiteEvents(rows))
      .catch((err) =>
        setSiteEventsError(err instanceof Error ? err.message : "Couldn't load events."),
      );
  };

  const load = () => {
    setError(null);
    listBookings()
      .then((all) => setBookings(all.filter((b) => b.event_type !== "Table reservation")))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Couldn't load event enquiries."),
      );
    getSiteSettings()
      .then((s) => {
        setEventTypes(s.eventTypes);
        setEventRequirements(s.eventRequirements);
      })
      .catch(() => {
        // The bookings table above already surfaces a load error; the
        // options lists just stay in their loading state if this fails.
      });
    loadSiteEvents();
  };
  useEffect(load, []);

  const saveList = async (key: "eventTypes" | "eventRequirements", value: string[]) => {
    setSavingList(key);
    try {
      await updateSiteSetting({ data: { key, value } });
      setSavedList(key);
      setTimeout(() => setSavedList(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that list.");
    } finally {
      setSavingList(null);
    }
  };

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

      <SectionCard
        title="Upcoming events & specials"
        description="What you post here shows up on the public /events page immediately — for things like a Mother's Day special, a live music night, or a holiday menu."
      >
        {siteEventsError ? <ErrorState message={siteEventsError} onRetry={loadSiteEvents} /> : null}

        <div className="mb-4">
          <Button type="button" onClick={() => setEditingEvent("new")}>
            <Plus className="h-4 w-4" /> Post an event
          </Button>
        </div>

        {!siteEvents ? (
          <LoadingRows rows={3} />
        ) : siteEvents.length === 0 ? (
          <EmptyState
            title="Nothing posted yet"
            description="Post your first event or special and it'll appear on the site right away."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {siteEvents.map((e) => (
              <li key={e.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                {e.image_key ? (
                  <img
                    src={`/gallery-image/${e.image_key}`}
                    alt={e.title}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center bg-secondary text-xs text-muted-foreground">
                    No image
                  </div>
                )}
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-foreground">{e.title}</p>
                    {e.featured ? (
                      <Star
                        className="h-4 w-4 shrink-0 fill-accent text-accent"
                        aria-label="Featured"
                      />
                    ) : null}
                  </div>
                  {e.event_date ? (
                    <p className="text-xs text-muted-foreground">{e.event_date}</p>
                  ) : null}
                  <span
                    className={cn(
                      "inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                      e.status === "cancelled"
                        ? "bg-destructive/10 text-destructive"
                        : e.status === "past"
                          ? "bg-secondary text-muted-foreground"
                          : "bg-success/15 text-success",
                    )}
                  >
                    {e.status}
                  </span>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => setEditingEvent(e)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={async () => {
                        setSiteEvents((prev) => (prev ? prev.filter((x) => x.id !== e.id) : prev));
                        try {
                          await deleteSiteEvent({ data: { id: e.id } });
                        } catch {
                          loadSiteEvents();
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

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
        description="The choices guests see on the events page — changes here go live immediately."
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <EditableStringList
            heading="Types of event"
            items={eventTypes}
            onChange={setEventTypes}
            onSave={(v) => saveList("eventTypes", v)}
            saving={savingList === "eventTypes"}
            saved={savedList === "eventTypes"}
          />
          <EditableStringList
            heading="Requests guests can tick"
            items={eventRequirements}
            onChange={setEventRequirements}
            onSave={(v) => saveList("eventRequirements", v)}
            saving={savingList === "eventRequirements"}
            saved={savedList === "eventRequirements"}
          />
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

      <Drawer open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DrawerContent>
          {editingEvent ? (
            <SiteEventEditor
              event={editingEvent === "new" ? null : editingEvent}
              onDone={() => {
                setEditingEvent(null);
                loadSiteEvents();
              }}
              onError={(msg) => setSiteEventsError(msg)}
            />
          ) : null}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function SiteEventEditor({
  event,
  onDone,
  onError,
}: {
  event: SiteEventRow | null;
  onDone: () => void;
  onError: (message: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [eventDate, setEventDate] = useState(event?.event_date ?? "");
  const [status, setStatus] = useState<SiteEventStatus>(event?.status ?? "upcoming");
  const [featured, setFeatured] = useState(!!event?.featured);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      if (event) form.set("id", String(event.id));
      form.set("title", title);
      form.set("description", description);
      form.set("event_date", eventDate);
      form.set("status", status);
      form.set("featured", String(featured));
      const file = fileRef.current?.files?.[0];
      if (file) form.set("file", file);

      if (event) {
        await updateSiteEvent({ data: form });
      } else {
        await createSiteEvent({ data: form });
      }
      onDone();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't save that event.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-lg">
      <DrawerHeader>
        <DrawerTitle>{event ? "Edit event" : "Post an event"}</DrawerTitle>
        <DrawerDescription>Shows on the public /events page as soon as you save.</DrawerDescription>
      </DrawerHeader>
      <div className="space-y-4 px-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mother's Day Special"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="What's on, what's included, anything guests should know"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Date (free text)</label>
          <Input
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            placeholder="e.g. Sunday, 10 May 2026, or 'Every Sunday'"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as SiteEventStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Featured
            </label>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {event?.image_key ? "Replace image (optional)" : "Image (optional)"}
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="block w-full text-sm text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
          />
        </div>
      </div>
      <DrawerFooter className="flex-row flex-wrap gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <DrawerClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </form>
  );
}

function EditableStringList({
  heading,
  items,
  onChange,
  onSave,
  saving,
  saved,
}: {
  heading: string;
  items: string[] | null;
  onChange: (items: string[]) => void;
  onSave: (items: string[]) => void;
  saving: boolean;
  saved: boolean;
}) {
  if (!items) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {heading}
        </p>
        <div className="mt-3 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 animate-pulse rounded-lg bg-secondary" />
          ))}
        </div>
      </div>
    );
  }

  const setAt = (i: number, value: string) => onChange(items.map((t, j) => (j === i ? value : t)));
  const removeAt = (i: number) => onChange(items.filter((_, j) => j !== i));
  const add = () => onChange([...items, ""]);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {heading}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((t, i) => (
          <li key={i} className="flex items-center gap-2">
            <Input value={t} onChange={(e) => setAt(i, e.target.value)} />
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label={`Remove "${t || "this item"}"`}
              className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4" /> Add option
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={saving}
          onClick={() => onSave(items.filter((t) => t.trim() !== ""))}
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </Button>
      </div>
    </div>
  );
}
