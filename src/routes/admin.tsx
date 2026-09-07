import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { business, menu, openingHours } from "@/lib/site-data";
import { gallery } from "@/lib/gallery";
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
  "Menu",
  "Gallery",
  "Events",
  "Reservations",
  "Enquiries",
  "Hours",
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
        <nav className="mt-6 flex gap-2 overflow-x-auto lg:mt-10 lg:flex-col lg:overflow-visible" aria-label="Dashboard">
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
          {section === "Menu" && <MenuAdmin />}
          {section === "Gallery" && <GalleryAdmin />}
          {section === "Events" && <EventsAdmin />}
          {section === "Reservations" && <ReservationsAdmin />}
          {section === "Enquiries" && <EnquiriesAdmin />}
          {section === "Hours" && <HoursAdmin />}
          {section === "Contact & links" && <ContactAdmin />}
        </div>
      </div>
    </div>
  );
}

function Banner() {
  return (
    <div className="border-l-2 border-ochre bg-secondary p-5 text-sm leading-relaxed text-muted-foreground">
      <strong className="text-foreground">This dashboard is a working preview.</strong> Every field and table below shows
      exactly what you'll be able to edit. Changes aren't saved yet, and there's no login — say the word and both can be
      turned on.
    </div>
  );
}

function Card({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className="border border-border bg-card p-6 lg:p-8">
      <h2 className="font-display text-2xl">{title}</h2>
      {note ? <p className="mt-2 text-sm text-muted-foreground">{note}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Btn({ children, tone = "quiet" }: { children: React.ReactNode; tone?: "solid" | "quiet" }) {
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
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Menu categories" value={String(menu.length)} hint="Editable structure" />
        <Stat label="Menu items" value={String(menu.reduce((n, c) => n + c.items.length, 0))} hint="Placeholder dishes" />
        <Stat label="Gallery images" value={String(gallery.length)} hint="Placeholder photography" />
        <Stat label="Pending requests" value="—" hint="Storage not connected" />
      </div>
      <Card title="Set-up checklist" note="What still needs the restaurant's own information.">
        <ul className="space-y-4 text-sm">
          {[
            "Upload real photography of the garden, food and events",
            "Load the real menu, dish descriptions and prices",
            "Confirm trading hours for each day",
            "Add social media links (none have been invented)",
            "Turn on logins and storage so reservations and enquiries arrive here",
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

function MenuAdmin() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <Btn tone="solid">Add category</Btn>
        <Btn>Add item</Btn>
        <Btn>Reorder</Btn>
      </div>
      {menu.map((c) => (
        <Card key={c.slug} title={c.title} note={c.intro}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Item", "Description", "Price", "Featured", "Status", ""].map((h) => (
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
    <Card title="Gallery images" note="Upload the restaurant's own photographs to replace these placeholders.">
      <div className="mb-6 flex flex-wrap gap-3">
        <Btn tone="solid">Upload images</Btn>
        <Btn>Reorder</Btn>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((g, i) => (
          <li key={`${g.caption}-${i}`} className="border border-border">
            <img src={g.src} alt={g.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
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
  return (
    <Card
      title="Events"
      note="No events have been published — nothing has been invented. Add real dates and details here when ready."
    >
      <div className="flex flex-wrap gap-3">
        <Btn tone="solid">Add event</Btn>
      </div>
      <div className="mt-6 border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No events yet. Fields ready: title, date, time, description, image, ticket or entry note, published toggle.
      </div>
    </Card>
  );
}

function ReservationsAdmin() {
  return (
    <Card
      title="Reservation requests"
      note="Requests will land here once storage is switched on. Statuses: Pending, Confirmed, Declined, Completed, Cancelled."
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Guest", "Phone", "Date", "Time", "Guests", "Request", "Status"].map((h) => (
                <th key={h} scope="col" className="eyebrow py-3 pr-4 text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="py-12 text-center text-muted-foreground">
                No reservation requests are stored. The public form currently tells guests to confirm by phone.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function EnquiriesAdmin() {
  return (
    <Card title="Contact enquiries" note="Statuses: New, Read, Responded, Closed. Guest details stay private.">
      <div className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No enquiries stored yet. The contact and event forms currently direct guests to phone, WhatsApp or email.
      </div>
    </Card>
  );
}

function HoursAdmin() {
  return (
    <Card title="Opening hours" note="These appear on the contact page and in the footer.">
      <ul className="space-y-4">
        {openingHours.map((h) => (
          <li key={h.day} className="grid gap-3 border-b border-border pb-4 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-center">
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
    <Card title="Contact & links" note="Verified details are pre-filled. Social links are empty — none were invented.">
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
