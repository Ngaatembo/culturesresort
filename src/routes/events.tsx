import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { images } from "@/lib/gallery";
import { business } from "@/lib/site-data";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Functions | Cultures Resort, Harare" },
      {
        name: "description",
        content:
          "Enquire about group bookings, celebrations and functions at Cultures Resort, Corner Chiremba & Southey Road, Hillside, Harare.",
      },
      { property: "og:title", content: "Events & Functions | Cultures Resort" },
      {
        property: "og:description",
        content: "Group bookings and celebrations in an African garden setting in Harare.",
      },
    ],
  }),
  component: Events,
});

const eventTypes = [
  "Birthday or celebration",
  "Family gathering",
  "Corporate or team function",
  "Cultural event",
  "Something else",
];

function Events() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        eyebrow="Events & functions"
        title="Gatherings under the trees"
        intro="Tell us what you have in mind and the team will come back to you directly."
        image={images.drums}
        imageAlt="Guests gathered around a cultural performance in the courtyard"
      />

      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-12 lg:px-10">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow rule-ochre text-primary">What we can host</p>
            <ul className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
              {eventTypes.map((t) => (
                <li key={t} className="border-b border-border pb-4 font-display text-lg text-foreground">
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-10 border border-border bg-secondary p-6 text-sm leading-relaxed text-muted-foreground">
              <p className="eyebrow text-foreground">No published event calendar</p>
              <p className="mt-3">
                We don't list dates or packages here, because those change and we won't guess them. Send an enquiry or
                call and the restaurant will confirm what's possible.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={business.phoneHref} className="eyebrow bg-primary px-7 py-4 text-primary-foreground">
                Call {business.phoneDisplay}
              </a>
              <a href={business.whatsappHref} target="_blank" rel="noreferrer" className="eyebrow border border-border px-7 py-4">
                WhatsApp
              </a>
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-6 lg:col-start-7">
            <div className="border border-border bg-card p-8 lg:p-10">
              <h2 className="font-display text-3xl">Event enquiry</h2>
              {sent ? (
                <div className="mt-8 border-l-2 border-ochre bg-secondary p-6">
                  <p className="eyebrow text-primary">Enquiry not yet sent</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    This form isn't connected to the restaurant's inbox yet, so nothing was delivered. To reach the team
                    now, please call{" "}
                    <a href={business.phoneHref} className="text-primary underline">
                      {business.phoneDisplay}
                    </a>{" "}
                    or email{" "}
                    <a href={`mailto:${business.email}`} className="break-all text-primary underline">
                      {business.email}
                    </a>
                    .
                  </p>
                  <button type="button" onClick={() => setSent(false)} className="eyebrow mt-6 border border-border px-5 py-3">
                    Edit enquiry
                  </button>
                </div>
              ) : (
                <form
                  className="mt-8 space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const data = new FormData(e.currentTarget);
                    const name = String(data.get("name") ?? "").trim();
                    const contact = String(data.get("phone") ?? "").trim();
                    if (name.length < 2 || contact.length < 6) {
                      setError("Please add your name and a phone number we can reach you on.");
                      return;
                    }
                    setError(null);
                    setSent(true);
                  }}
                >
                  <Field label="Your name" name="name" required maxLength={100} />
                  <Field label="Phone" name="phone" type="tel" required maxLength={30} />
                  <Field label="Email (optional)" name="email" type="email" maxLength={255} />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="eyebrow text-muted-foreground">Type of event</span>
                      <select name="type" className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm">
                        {eventTypes.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                    <Field label="Approx. guests" name="guests" type="number" min={1} max={500} />
                  </div>
                  <Field label="Preferred date" name="date" type="date" />
                  <label className="block">
                    <span className="eyebrow text-muted-foreground">Tell us more</span>
                    <textarea
                      name="message"
                      rows={4}
                      maxLength={1000}
                      className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm"
                    />
                  </label>
                  {error ? (
                    <p role="alert" className="text-sm text-destructive">
                      {error}
                    </p>
                  ) : null}
                  <button type="submit" className="eyebrow w-full bg-primary px-7 py-5 text-primary-foreground">
                    Send enquiry
                  </button>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    This form is not yet connected to the restaurant's inbox — you'll be shown how to reach them
                    directly after submitting.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...rest
}: { label: string; name: string; type?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        {...rest}
        className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm"
      />
    </label>
  );
}
