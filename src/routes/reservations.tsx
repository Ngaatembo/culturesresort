import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { images } from "@/lib/gallery";
import { createBooking } from "@/lib/data/bookings";
import { business } from "@/lib/site-data";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Reserve a Table | Cultures Resort, Harare" },
      {
        name: "description",
        content:
          "Request a table at Cultures Resort, Hillside, Harare. Reservation requests are confirmed by the restaurant by phone — call +263 77 295 1308.",
      },
      { property: "og:title", content: "Reserve a Table | Cultures Resort" },
      {
        property: "og:description",
        content: "Request a table in the garden at Cultures Resort, Harare.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: Reservations,
});

type Values = {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: string;
  request: string;
};

const empty: Values = {
  name: "",
  phone: "",
  email: "",
  date: "",
  time: "",
  guests: "2",
  request: "",
};

function Reservations() {
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [submitted, setSubmitted] = useState<Values | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set =
    (k: keyof Values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [k]: e.target.value }));

  function validate(v: Values) {
    const next: Partial<Record<keyof Values, string>> = {};
    if (v.name.trim().length < 2) next.name = "Please enter your full name.";
    if (v.phone.trim().replace(/\D/g, "").length < 8)
      next.phone = "Please enter a phone number we can reach you on.";
    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
      next.email = "That email doesn't look right.";
    if (!v.date) next.date = "Please choose a date.";
    if (!v.time) next.time = "Please choose a time.";
    const g = Number(v.guests);
    if (!Number.isFinite(g) || g < 1 || g > 40) next.guests = "Enter between 1 and 40 guests.";
    if (v.request.length > 500) next.request = "Please keep this under 500 characters.";
    return next;
  }

  if (submitted) {
    return (
      <>
        <PageHeader
          eyebrow="Reservations"
          title="Request received"
          image={images.garden}
          imageAlt="Life-size zebra, giraffe and elephant sculptures on the lawn among picnic tables"
        />
        <section className="bg-background py-20 lg:py-28">
          <div className="mx-auto max-w-2xl px-5 lg:px-10">
            <div className="border border-border bg-card p-8 lg:p-12">
              <p className="eyebrow text-primary">Request saved</p>
              <h2 className="mt-5 font-display text-3xl leading-tight">
                Your table is not booked until the restaurant confirms it
              </h2>
              <p className="mt-6 leading-relaxed text-muted-foreground">
                Your reservation request has been saved and the team will confirm it with you
                directly. To speed things up, you can also call or message the restaurant with the
                details below.
              </p>

              <dl className="mt-10 grid gap-5 border-y border-border py-8 sm:grid-cols-2">
                <Row label="Name" value={submitted.name} />
                <Row label="Phone" value={submitted.phone} />
                <Row label="Date" value={submitted.date} />
                <Row label="Time" value={submitted.time} />
                <Row label="Guests" value={submitted.guests} />
                {submitted.email ? <Row label="Email" value={submitted.email} /> : null}
                {submitted.request ? <Row label="Notes" value={submitted.request} /> : null}
              </dl>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={business.phoneHref}
                  className="eyebrow border border-border px-7 py-4"
                >
                  Call {business.phoneDisplay}
                </a>
                <a
                  href={`${business.whatsappHref}?text=${encodeURIComponent(
                    `Hello Cultures Resort, I'd like to request a table for ${submitted.guests} on ${submitted.date} at ${submitted.time}. Name: ${submitted.name}.`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="eyebrow flex items-center justify-center gap-2 bg-leaf px-7 py-4 text-bone"
                >
                  Send on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setSubmitted(null)}
                  className="eyebrow border border-border px-7 py-4"
                >
                  Change details
                </button>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Reservations"
        title="Request a table"
        intro="Tell us when you'd like to come. The restaurant confirms every booking personally."
        image={images.garden}
        imageAlt="Life-size zebra, giraffe and elephant sculptures on the lawn among picnic tables"
      />

      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-12 lg:px-10">
          <Reveal className="lg:col-span-7">
            <form
              className="border border-border bg-card p-8 lg:p-12"
              noValidate
              onSubmit={async (e) => {
                e.preventDefault();
                const next = validate(values);
                setErrors(next);
                if (Object.keys(next).length > 0) return;
                setSubmitError(null);
                setSubmitting(true);
                try {
                  await createBooking({
                    data: {
                      eventType: "Table reservation",
                      guestName: values.name,
                      guestPhone: values.phone,
                      guestEmail: values.email || undefined,
                      eventDate: values.date,
                      guests: Number(values.guests),
                      requirements: values.time ? `Time: ${values.time}` : undefined,
                      message: values.request || undefined,
                    },
                  });
                  setSubmitted(values);
                } catch (err) {
                  setSubmitError(
                    err instanceof Error
                      ? err.message
                      : "Could not send the request. Please try again.",
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <h2 className="font-display text-3xl">Your details</h2>

              <div className="mt-8 space-y-5">
                <Input
                  label="Full name"
                  value={values.name}
                  onChange={set("name")}
                  error={errors.name}
                  maxLength={100}
                  autoComplete="name"
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Phone"
                    type="tel"
                    value={values.phone}
                    onChange={set("phone")}
                    error={errors.phone}
                    maxLength={30}
                    autoComplete="tel"
                  />
                  <Input
                    label="Email (optional)"
                    type="email"
                    value={values.email}
                    onChange={set("email")}
                    error={errors.email}
                    maxLength={255}
                    autoComplete="email"
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-3">
                  <Input
                    label="Date"
                    type="date"
                    value={values.date}
                    onChange={set("date")}
                    error={errors.date}
                  />
                  <Input
                    label="Time"
                    type="time"
                    value={values.time}
                    onChange={set("time")}
                    error={errors.time}
                  />
                  <Input
                    label="Guests"
                    type="number"
                    min={1}
                    max={40}
                    value={values.guests}
                    onChange={set("guests")}
                    error={errors.guests}
                  />
                </div>
                <label className="block">
                  <span className="eyebrow text-muted-foreground">Special requests (optional)</span>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={values.request}
                    onChange={set("request")}
                    className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm"
                    placeholder="Highchairs, seating preference, celebration…"
                  />
                  {errors.request ? (
                    <span role="alert" className="mt-2 block text-sm text-destructive">
                      {errors.request}
                    </span>
                  ) : null}
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="eyebrow mt-9 w-full bg-primary px-7 py-5 text-primary-foreground disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Request this table"}
              </button>
              {submitError ? (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  {submitError}
                </p>
              ) : null}
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Submitting saves your request and shows you how to confirm with the restaurant
                directly.
              </p>
            </form>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-4 lg:col-start-9">
            <div className="border border-border bg-secondary p-8">
              <p className="eyebrow rule-ochre text-primary">How booking works</p>
              <ol className="mt-6 space-y-6 text-sm leading-relaxed text-muted-foreground">
                <li>
                  <span className="eyebrow block text-ochre">Step one</span>
                  Send your request with date, time and party size.
                </li>
                <li>
                  <span className="eyebrow block text-ochre">Step two</span>
                  Call or WhatsApp the restaurant to confirm — this is the step that secures your
                  table.
                </li>
                <li>
                  <span className="eyebrow block text-ochre">Step three</span>
                  Arrive and be seated in the garden.
                </li>
              </ol>
              <div className="mt-8 border-t border-border pt-6 text-sm">
                <a
                  href={business.phoneHref}
                  className="block font-display text-lg hover:text-primary"
                >
                  {business.phoneDisplay}
                </a>
                <a
                  href={`mailto:${business.email}`}
                  className="mt-2 block break-all text-muted-foreground hover:text-primary"
                >
                  {business.email}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}

function Input({
  label,
  error,
  ...rest
}: { label: string; error?: string | undefined } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input
        {...rest}
        aria-invalid={Boolean(error)}
        className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm"
      />
      {error ? (
        <span role="alert" className="mt-2 block text-sm text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  );
}
