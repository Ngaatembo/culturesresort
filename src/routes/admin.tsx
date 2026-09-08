import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  beverages,
  business,
  eventRequirements,
  eventTypes,
  menu,
  openingHours,
  visitDetails,
} from "@/lib/site-data";
import { gallery } from "@/lib/gallery";
import { getDashboardStats, type DashboardStats } from "@/lib/data/dashboard";
import {
  listOrders,
  updateOrderStatus,
  type OrderStatus,
  type OrderWithItems,
} from "@/lib/data/orders";
import {
  listBookings,
  updateBookingStatus,
  type BookingRow,
  type BookingStatus,
} from "@/lib/data/bookings";
import {
  listEnquiries,
  updateEnquiryStatus,
  type EnquiryRow,
  type EnquiryStatus,
} from "@/lib/data/enquiries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard | Cultures Resort" },
      { name: "description", content: "Content dashboard preview for Cultures Resort." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Admin,
});

const sections = [
  "Overview",
  "Orders",
  "Food menu",
  "Beverages",
  "Gallery",
  "Events & functions",
  "Reservations",
  "Enquiries",
  "Hours",
  "Visit details",
  "Contact & links",
] as const;
type Section = (typeof sections)[number];

function Admin() {
  const [section, setSection] = useState<Section>("Overview");

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="border-b border-border bg-ink px-5 py-6 text-bone lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-6 lg:py-10">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:block">
          <div className="min-w-0">
            <p className="font-display text-xl">Cultures Resort</p>
            <p className="eyebrow mt-1 text-bone/50">Owner dashboard</p>
          </div>
          <Link to="/" className="eyebrow shrink-0 text-ochre lg:mt-6 lg:block">
            View site →
          </Link>
        </div>
        <nav
          className="mt-6 flex gap-2 overflow-x-auto lg:mt-10 lg:flex-col lg:overflow-visible"
          aria-label="Dashboard"
        >
          {sections.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSection(s)}
              aria-current={section === s}
              className={cn(
                "eyebrow shrink-0 px-4 py-3 text-left transition-colors lg:w-full",
                section === s ? "bg-ochre text-ink" : "text-bone/70 hover:bg-bone/10",
              )}
            >
              {s}
            </button>
          ))}
        </nav>
        <p className="mt-8 hidden text-xs leading-relaxed text-bone/40 lg:block">
          Preview only. Nothing saves yet — logins and storage can be switched on later.
        </p>
      </aside>

      <div className="min-w-0 flex-1 px-5 py-10 lg:px-12 lg:py-14">
        <Banner />
        <h1 className="mt-8 font-display text-4xl">{section}</h1>

        <div className="mt-10">
          {section === "Overview" && <Overview />}
          {section === "Orders" && <OrdersAdmin />}
          {section === "Food menu" && <MenuAdmin kind="food" />}
          {section === "Beverages" && <MenuAdmin kind="beverages" />}
          {section === "Gallery" && <GalleryAdmin />}
          {section === "Events & functions" && <EventsAdmin />}
          {section === "Reservations" && <ReservationsAdmin />}
          {section === "Enquiries" && <EnquiriesAdmin />}
          {section === "Hours" && <HoursAdmin />}
          {section === "Visit details" && <VisitAdmin />}
          {section === "Contact & links" && <ContactAdmin />}
        </div>
      </div>
    </div>
  );
}

function Banner() {
  return (
    <div className="border-l-2 border-ochre bg-secondary p-5 text-sm leading-relaxed text-muted-foreground">
      <strong className="text-foreground">Orders, reservations and enquiries are now live</strong> —
      they save to the database and show up below as guests submit them. The menu, gallery, hours
      and contact sections are still a working preview; say the word and editing there can be
      switched on too.
    </div>
  );
}

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso.replace(" ", "T") + "Z").toLocaleString();
  } catch {
    return iso;
  }
}

function Card({
  title,
  children,
  note,
}: {
  title: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <section className="border border-border bg-card p-6 lg:p-8">
      <h2 className="font-display text-2xl">{title}</h2>
      {note ? <p className="mt-2 text-sm text-muted-foreground">{note}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Btn({
  children,
  tone = "quiet",
}: {
  children: React.ReactNode;
  tone?: "solid" | "quiet";
}) {
  return (
    <button
      type="button"
      disabled
      title="Not connected yet"
      className={cn(
        "eyebrow px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60",
        tone === "solid" ? "bg-primary text-primary-foreground" : "border border-border",
      )}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="border border-border bg-card p-6">
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="mt-3 font-display text-3xl">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load dashboard stats."),
      );
  }, []);

  return (
    <div className="space-y-8">
      {error ? (
        <div className="border border-dashed border-destructive p-6 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Today's orders"
          value={stats ? String(stats.todaysOrders) : "…"}
          hint="Placed today, excluding cancelled"
        />
        <Stat
          label="Pending orders"
          value={stats ? String(stats.pendingOrders) : "…"}
          hint="Waiting to be started"
        />
        <Stat
          label="Being prepared"
          value={stats ? String(stats.beingPrepared) : "…"}
          hint="In the kitchen now"
        />
        <Stat
          label="Today's revenue"
          value={stats ? formatMoney(stats.todaysRevenueCents) : "…"}
          hint="From today's orders"
        />
        <Stat
          label="Pending bookings"
          value={stats ? String(stats.pendingBookings) : "…"}
          hint="Events & reservations"
        />
        <Stat
          label="New enquiries"
          value={stats ? String(stats.newEnquiries) : "…"}
          hint="Contact form messages"
        />
        <Stat
          label="Menu items"
          value={stats ? String(stats.menuItemsCount) : "…"}
          hint="Currently available"
        />
        <Stat
          label="Unavailable items"
          value={stats ? String(stats.unavailableItems) : "…"}
          hint="Marked sold out"
        />
      </div>
      <Card title="Set-up checklist" note="What still needs the restaurant's own information.">
        <ul className="space-y-4 text-sm">
          {[
            "Upload real photography of the garden, food and events",
            "Load the real food menu, dish descriptions and prices",
            "Load the real beverage list and prices",
            "Answer the practical visit details (parking, group size, payments)",
            "Confirm trading hours for each day",
            "Add social media links (none have been invented)",
          ].map((t) => (
            <li key={t} className="flex items-start gap-3 border-b border-border pb-4">
              <span className="mt-1 h-3 w-3 shrink-0 border border-ochre" aria-hidden="true" />
              <span className="text-muted-foreground">{t}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

const ORDER_STATUSES: OrderStatus[] = ["pending", "preparing", "completed", "cancelled"];

function OrdersAdmin() {
  const [orders, setOrders] = useState<OrderWithItems[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    listOrders()
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load orders."));
  };

  useEffect(load, []);

  return (
    <Card
      title="Orders"
      note="Real orders placed from the cart. Update the status as the kitchen works through them."
    >
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!orders ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No orders yet. They'll appear here as soon as a guest checks out from the cart.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                {["#", "Customer", "Items", "Total", "Placed", "Status"].map((h) => (
                  <th key={h} scope="col" className="eyebrow py-3 pr-4 text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border/60 align-top">
                  <td className="py-4 pr-4 font-display">#{o.id}</td>
                  <td className="py-4 pr-4">
                    <p>{o.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                  </td>
                  <td className="max-w-xs py-4 pr-4 text-muted-foreground">
                    {o.items.map((i) => `${i.qty} × ${i.name}`).join(", ")}
                  </td>
                  <td className="py-4 pr-4">{formatMoney(o.total_cents)}</td>
                  <td className="py-4 pr-4 text-xs text-muted-foreground">
                    {formatDate(o.created_at)}
                  </td>
                  <td className="py-4">
                    <select
                      value={o.status}
                      onChange={async (e) => {
                        const status = e.target.value as OrderStatus;
                        setOrders((prev) =>
                          prev!.map((x) => (x.id === o.id ? { ...x, status } : x)),
                        );
                        try {
                          await updateOrderStatus({ data: { id: o.id, status } });
                        } catch {
                          load();
                        }
                      }}
                      className="border border-input bg-background px-3 py-2 text-sm capitalize"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function MenuAdmin({ kind }: { kind: "food" | "beverages" }) {
  const list = kind === "food" ? menu : beverages;
  const noun = kind === "food" ? "dish" : "drink";
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <Btn tone="solid">Add category</Btn>
        <Btn>Add {noun}</Btn>
        <Btn>Reorder</Btn>
      </div>
      <p className="text-sm text-muted-foreground">
        Every {noun} name, description and price below is a placeholder. Nothing has been invented —
        load the restaurant&apos;s real list here.
      </p>
      {list.map((c) => (
        <Card key={c.slug} title={c.title} note={c.intro}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Item", "Description", "Price", "Signature", "Status", ""].map((h) => (
                    <th key={h} scope="col" className="eyebrow py-3 pr-4 text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.items.map((item) => (
                  <tr key={item.name} className="border-b border-border/60">
                    <td className="py-4 pr-4 font-display text-base">{item.name}</td>
                    <td className="max-w-xs py-4 pr-4 text-muted-foreground">{item.description}</td>
                    <td className="py-4 pr-4">{item.price}</td>
                    <td className="py-4 pr-4">{item.featured ? "Yes" : "—"}</td>
                    <td className="py-4 pr-4">
                      <span className="eyebrow bg-secondary px-2 py-1">Available</span>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <Btn>Edit</Btn>
                        <Btn>Sold out</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}

function GalleryAdmin() {
  return (
    <Card
      title="Gallery images"
      note="Upload the restaurant's own photographs to replace these placeholders."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Btn tone="solid">Upload images</Btn>
        <Btn>Reorder</Btn>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((g, i) => (
          <li key={`${g.caption}-${i}`} className="border border-border">
            <img
              src={g.src}
              alt={g.alt}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="p-4">
              <p className="eyebrow text-ochre">{g.category}</p>
              <p className="mt-2 text-sm text-muted-foreground">{g.caption}</p>
              <div className="mt-4 flex gap-2">
                <Btn>Replace</Btn>
                <Btn>Remove</Btn>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function EventsAdmin() {
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    listBookings()
      .then((all) => setBookings(all.filter((b) => b.event_type !== "Table reservation")))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load event enquiries."),
      );
  };
  useEffect(load, []);

  const onStatusChange = async (id: number, status: BookingStatus) => {
    setBookings((prev) => prev!.map((b) => (b.id === id ? { ...b, status } : b)));
    try {
      await updateBookingStatus({ data: { id, status } });
    } catch {
      load();
    }
  };

  return (
    <div className="space-y-8">
      <Card
        title="Event enquiries"
        note="Saved directly from the /events page as guests submit them."
      >
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {!bookings ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : bookings.length === 0 ? (
          <div className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No event enquiries yet.
          </div>
        ) : (
          <BookingsTable bookings={bookings} onStatusChange={onStatusChange} />
        )}
      </Card>
      <Card
        title="Enquiry form options"
        note="These are the choices guests see on the events page."
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-muted-foreground">Types of event</p>
            <ul className="mt-4 space-y-3 text-sm">
              {eventTypes.map((t) => (
                <li
                  key={t}
                  className="flex items-center justify-between gap-4 border-b border-border pb-3"
                >
                  <span className="text-muted-foreground">{t}</span>
                  <Btn>Edit</Btn>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-muted-foreground">Requests guests can tick</p>
            <ul className="mt-4 space-y-3 text-sm">
              {eventRequirements.map((t) => (
                <li
                  key={t}
                  className="flex items-center justify-between gap-4 border-b border-border pb-3"
                >
                  <span className="text-muted-foreground">{t}</span>
                  <Btn>Edit</Btn>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6">
          <Btn tone="solid">Save options</Btn>
        </div>
      </Card>
    </div>
  );
}

function VisitAdmin() {
  return (
    <Card
      title="Visit details"
      note="These answers show on the menu and events pages. All are unconfirmed until the restaurant fills them in."
    >
      <ul className="space-y-5">
        {visitDetails.map((d) => (
          <li
            key={d.label}
            className="grid gap-3 sm:grid-cols-[14rem_minmax(0,1fr)] sm:items-center"
          >
            <span className="eyebrow text-muted-foreground">{d.label}</span>
            <input
              defaultValue={d.value}
              aria-label={d.label}
              className="w-full border border-input bg-background px-4 py-3 text-sm"
            />
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Btn tone="solid">Save details</Btn>
      </div>
    </Card>
  );
}

const BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "declined",
  "completed",
  "cancelled",
];

function BookingsTable({
  bookings,
  onStatusChange,
}: {
  bookings: BookingRow[];
  onStatusChange: (id: number, status: BookingStatus) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {["Guest", "Phone", "Type", "Date", "Guests", "Request", "Status"].map((h) => (
              <th key={h} scope="col" className="eyebrow py-3 pr-4 text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b border-border/60 align-top">
              <td className="py-4 pr-4">{b.guest_name}</td>
              <td className="py-4 pr-4">{b.guest_phone}</td>
              <td className="py-4 pr-4">{b.event_type}</td>
              <td className="py-4 pr-4">{b.event_date ?? "—"}</td>
              <td className="py-4 pr-4">{b.guests ?? "—"}</td>
              <td className="max-w-xs py-4 pr-4 text-muted-foreground">
                {[b.requirements, b.message].filter(Boolean).join(" — ") || "—"}
              </td>
              <td className="py-4">
                <select
                  value={b.status}
                  onChange={(e) => onStatusChange(b.id, e.target.value as BookingStatus)}
                  className="border border-input bg-background px-3 py-2 text-sm capitalize"
                >
                  {BOOKING_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReservationsAdmin() {
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    listBookings()
      .then((all) => setBookings(all.filter((b) => b.event_type === "Table reservation")))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load reservations."),
      );
  };
  useEffect(load, []);

  const onStatusChange = async (id: number, status: BookingStatus) => {
    setBookings((prev) => prev!.map((b) => (b.id === id ? { ...b, status } : b)));
    try {
      await updateBookingStatus({ data: { id, status } });
    } catch {
      load();
    }
  };

  return (
    <Card
      title="Reservation requests"
      note="Statuses: Pending, Confirmed, Declined, Completed, Cancelled."
    >
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!bookings ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : bookings.length === 0 ? (
        <div className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No reservation requests yet.
        </div>
      ) : (
        <BookingsTable bookings={bookings} onStatusChange={onStatusChange} />
      )}
    </Card>
  );
}

function EnquiriesAdmin() {
  const [enquiries, setEnquiries] = useState<EnquiryRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    listEnquiries()
      .then(setEnquiries)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load enquiries."));
  };
  useEffect(load, []);

  const statuses: EnquiryStatus[] = ["new", "read", "responded", "closed"];

  return (
    <Card
      title="Contact enquiries"
      note="Statuses: New, Read, Responded, Closed. Guest details stay private."
    >
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!enquiries ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : enquiries.length === 0 ? (
        <div className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No enquiries yet. The contact form saves directly here.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Name", "Contact", "Message", "Received", "Status"].map((h) => (
                  <th key={h} scope="col" className="eyebrow py-3 pr-4 text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <tr key={e.id} className="border-b border-border/60 align-top">
                  <td className="py-4 pr-4">{e.name}</td>
                  <td className="py-4 pr-4 text-muted-foreground">
                    {[e.phone, e.email].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="max-w-sm py-4 pr-4 text-muted-foreground">{e.message}</td>
                  <td className="py-4 pr-4 text-xs text-muted-foreground">
                    {formatDate(e.created_at)}
                  </td>
                  <td className="py-4">
                    <select
                      value={e.status}
                      onChange={async (ev) => {
                        const status = ev.target.value as EnquiryStatus;
                        setEnquiries((prev) =>
                          prev!.map((x) => (x.id === e.id ? { ...x, status } : x)),
                        );
                        try {
                          await updateEnquiryStatus({ data: { id: e.id, status } });
                        } catch {
                          load();
                        }
                      }}
                      className="border border-input bg-background px-3 py-2 text-sm capitalize"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function HoursAdmin() {
  return (
    <Card title="Opening hours" note="These appear on the contact page and in the footer.">
      <ul className="space-y-4">
        {openingHours.map((h) => (
          <li
            key={h.day}
            className="grid gap-3 border-b border-border pb-4 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-center"
          >
            <span className="eyebrow text-muted-foreground">{h.day}</span>
            <input
              defaultValue={h.hours}
              aria-label={`${h.day} hours`}
              className="w-full border border-input bg-background px-4 py-3 text-sm"
            />
            <span className="eyebrow text-muted-foreground">Closed toggle</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Btn tone="solid">Save hours</Btn>
      </div>
    </Card>
  );
}

function ContactAdmin() {
  const fields: Array<[string, string, boolean]> = [
    ["Phone", business.phoneDisplay, true],
    ["Email", business.email, true],
    ["Address", business.addressLine, true],
    ["Google Maps link", business.mapsHref, true],
    ["WhatsApp number", business.phoneDisplay, true],
    ["Instagram", "Not provided — add if the restaurant has one", false],
    ["Facebook", "Not provided — add if the restaurant has one", false],
    ["TikTok", "Not provided — add if the restaurant has one", false],
  ];
  return (
    <Card
      title="Contact & links"
      note="Verified details are pre-filled. Social links are empty — none were invented."
    >
      <ul className="space-y-5">
        {fields.map(([label, value, verified]) => (
          <li key={label}>
            <span className="eyebrow flex items-center gap-3 text-muted-foreground">
              {label}
              {verified ? <em className="not-italic text-ochre">verified</em> : null}
            </span>
            <input
              defaultValue={verified ? value : ""}
              placeholder={verified ? undefined : value}
              aria-label={label}
              className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm"
            />
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Btn tone="solid">Save details</Btn>
      </div>
    </Card>
  );
}
