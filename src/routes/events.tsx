import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { images } from "@/lib/gallery";
import { createBooking } from "@/lib/data/bookings";
import { business, eventRequirements, eventTypes, visitDetails } from "@/lib/site-data";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Functions | Cultures Resort, Harare" },
      {
        name: "description",
        content:
          "Enquire about birthdays, family gatherings, business lunches and functions at Cultures Resort, Corner Chiremba & Southey Road, Hillside, Harare.",
      },
      { property: "og:title", content: "Events & Functions | Cultures Resort" },
      {
        property: "og:description",
        content: "Group bookings and celebrations in an African garden setting in Harare.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Events,
});

const steps = [
  {
    n: "01",
    title: "Send your enquiry",
    body: "Tell us the occasion, the date you have in mind and roughly how many people.",
  },
  {
    n: "02",
    title: "The team replies",
    body: "Cultures Resort confirms what is possible for that date, seating and food.",
  },
  {
    n: "03",
    title: "Confirm by phone",
    body: "Nothing is held until the restaurant confirms it with you directly.",
  },
];

function Events() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Events & functions"
        title="Gatherings under the trees"
        intro="Birthdays, family gatherings, outings with friends or a business lunch. Tell us what you have in mind and the team will come back to you directly."
        image={images.drums}
        imageAlt="Guests gathered around a cultural performance in the courtyard"
      />

      <section className="bg-background py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <Reveal>
            <p className="eyebrow rule-ochre text-primary">How planning works</p>
          </Reveal>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 90} className="border-t border-border pt-6">
                <span className="eyebrow text-ochre">{s.n}</span>
                <h2 className="mt-3 font-display text-2xl">{s.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-background pb-20 lg:pb-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-12 lg:px-10">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow rule-ochre text-primary">What we can host</p>
            <ul className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
              {eventTypes.map((t) => (
                <li
                  key={t}
                  className="border-b border-border pb-4 font-display text-lg text-foreground"
                >
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <p className="eyebrow rule-ochre text-primary">Practical details</p>
              <dl className="mt-6 space-y-3 text-sm">
                {visitDetails.map((d) => (
                  <div
                    key={d.label}
                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-border pb-3"
                  >
                    <dt className="text-muted-foreground">{d.label}</dt>
                    <dd className="shrink-0 text-foreground">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-10 border border-border bg-secondary p-6 text-sm leading-relaxed text-muted-foreground">
              <p className="eyebrow text-foreground">No published calendar or packages</p>
              <p className="mt-3">
                We don't list dates, prices or set packages here, because those change and we won't
                guess them. Send an enquiry or call and the restaurant will confirm what's possible.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={business.phoneHref}
                className="eyebrow border border-border px-7 py-4"
              >
                Call {business.phoneDisplay}
              </a>
              <a
                href={business.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="eyebrow flex items-center justify-center gap-2 bg-leaf px-7 py-4 text-bone"
              >
                WhatsApp
              </a>
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-6 lg:col-start-7">
            <div className="border border-border bg-card p-8 lg:p-10">
              <h2 className="font-display text-3xl">Event enquiry</h2>
              {sent ? (
                <div className="mt-8 border-l-2 border-ochre bg-secondary p-6">
                  <p className="eyebrow text-primary">Enquiry received</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    Thank you — your event enquiry has been saved and the team will confirm with you
                    directly. To reach them sooner, call{" "}
                    <a href={business.phoneHref} className="text-primary underline">
                      {business.phoneDisplay}
                    </a>{" "}
                    or email{" "}
                    <a
                      href={`mailto:${business.email}`}
                      className="break-all text-primary underline"
                    >
                      {business.email}
                    </a>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="eyebrow mt-6 border border-border px-5 py-3"
                  >
                    Send another enquiry
                  </button>
                </div>
              ) : (
                <form
                  className="mt-8 space-y-5"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const data = new FormData(e.currentTarget);
                    const name = String(data.get("name") ?? "").trim();
                    const phone = String(data.get("phone") ?? "").trim();
                    if (name.length < 2 || phone.length < 6) {
                      setError("Please add your name and a phone number we can reach you on.");
                      return;
                    }
                    setError(null);
                    setSubmitting(true);
                    try {
                      await createBooking({
                        data: {
                          eventType: String(data.get("type") ?? eventTypes[0]),
                          guestName: name,
                          guestPhone: phone,
                          guestEmail: String(data.get("email") ?? "").trim() || undefined,
                          eventDate: String(data.get("date") ?? "") || undefined,
                          guests: data.get("guests") ? Number(data.get("guests")) : undefined,
                          requirements: data.getAll("requirements").join(", ") || undefined,
                          message: String(data.get("message") ?? "").trim() || undefined,
                        },
                      });
                      setSent(true);
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Could not send the enquiry. Please try again.",
                      );
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  <Field label="Your name" name="name" required maxLength={100} />
                  <Field label="Phone" name="phone" type="tel" required maxLength={30} />
                  <Field label="Email (optional)" name="email" type="email" maxLength={255} />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="eyebrow text-muted-foreground">Type of event</span>
                      <select
                        name="type"
                        className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm"
                      >
                        {eventTypes.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                    <Field label="Approx. guests" name="guests" type="number" min={1} max={500} />
                  </div>
                  <Field label="Preferred date" name="date" type="date" />

                  <fieldset>
                    <legend className="eyebrow text-muted-foreground">
                      Anything you need? (optional)
                    </legend>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {eventRequirements.map((r) => (
                        <label
                          key={r}
                          className="flex items-start gap-3 border border-border p-3 text-sm"
                        >
                          <input
                            type="checkbox"
                            name="requirements"
                            value={r}
                            className="mt-1 accent-[var(--ochre)]"
                          />
                          <span className="text-muted-foreground">{r}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

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
                  <button
                    type="submit"
                    disabled={submitting}
                    className="eyebrow w-full bg-primary px-7 py-5 text-primary-foreground disabled:opacity-60"
                  >
                    {submitting ? "Sending…" : "Send enquiry"}
                  </button>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Your enquiry is saved and the team will confirm with you directly by phone or
                    email.
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
