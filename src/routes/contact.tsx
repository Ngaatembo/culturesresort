import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { images } from "@/lib/gallery";
import { business, openingHours, whatsappLink, whatsappMessages } from "@/lib/site-data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Directions | Cultures Resort, Hillside Harare" },
      {
        name: "description",
        content:
          "Cultures Resort, Corner Chiremba Road & Southey Road, Hillside, Harare. Call +263 77 295 1308 or email culturesresortzimbabwe@gmail.com.",
      },
      { property: "og:title", content: "Contact Cultures Resort, Harare" },
      {
        property: "og:description",
        content: "Find us on the corner of Chiremba and Southey Road, Hillside, Harare.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Corner Chiremba & Southey Road"
        intro="Hillside, Harare, Zimbabwe."
        image={images.garden}
        imageAlt="Garden dining area at Cultures Resort at dusk"
      />

      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-12 lg:px-10">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow rule-ochre text-primary">Reach us</p>
            <dl className="mt-8 space-y-7">
              <div>
                <dt className="eyebrow text-muted-foreground">Address</dt>
                <dd className="mt-2">
                  <a
                    href={business.mapsHref}
                    target="_blank"
                    rel="noreferrer"
                    className="font-display text-xl leading-snug hover:text-primary"
                  >
                    {business.addressLine}
                  </a>
                  <span className="mt-2 block text-xs text-muted-foreground">Opens in Google Maps</span>
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-muted-foreground">Phone</dt>
                <dd className="mt-2">
                  <a href={business.phoneHref} className="font-display text-xl hover:text-primary">
                    {business.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-muted-foreground">Email</dt>
                <dd className="mt-2">
                  <a href={`mailto:${business.email}`} className="break-all font-display text-xl hover:text-primary">
                    {business.email}
                  </a>
                  <span className="mt-2 block text-xs text-muted-foreground">
                    Also listed publicly as {business.emailAlt}
                  </span>
                </dd>
              </div>
            </dl>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <a href={business.phoneHref} className="eyebrow bg-primary px-5 py-4 text-center text-primary-foreground">
                Call
              </a>
              <a
                href={whatsappLink(whatsappMessages.general)}
                target="_blank"
                rel="noreferrer"
                className="eyebrow flex items-center justify-center gap-2 bg-leaf px-5 py-4 text-bone"
              >
                WhatsApp
              </a>
              <a href={business.mapsHref} target="_blank" rel="noreferrer" className="eyebrow border border-border px-5 py-4 text-center">
                Directions
              </a>
            </div>

            <div className="mt-8 border border-border">
              <iframe
                src={business.mapsEmbedHref}
                title="Map showing Cultures Resort, Hillside, Harare"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full"
              />
            </div>

            <div className="mt-12 border border-border bg-secondary p-6">
              <h2 className="eyebrow text-foreground">Opening hours</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {openingHours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-6 border-b border-border/60 pb-2">
                    <span>{h.day}</span>
                    <span className="text-muted-foreground">{h.hours}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Hours have not been published yet — they are editable from the owner dashboard. Please call to confirm
                before travelling.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-6 lg:col-start-7">
            <div className="border border-border bg-card p-8 lg:p-10">
              <h2 className="font-display text-3xl">Send an enquiry</h2>
              {sent ? (
                <div className="mt-8 border-l-2 border-ochre bg-secondary p-6">
                  <p className="eyebrow text-primary">Message not yet sent</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    This form isn't connected to the restaurant's inbox yet, so nothing was delivered. Please call{" "}
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
                    Edit message
                  </button>
                </div>
              ) : (
                <form
                  className="mt-8 space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const data = new FormData(e.currentTarget);
                    const name = String(data.get("name") ?? "").trim();
                    const message = String(data.get("message") ?? "").trim();
                    if (name.length < 2 || message.length < 5) {
                      setError("Please add your name and a short message.");
                      return;
                    }
                    setError(null);
                    setSent(true);
                  }}
                >
                  <label className="block">
                    <span className="eyebrow text-muted-foreground">Your name</span>
                    <input name="name" required maxLength={100} className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm" />
                  </label>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="eyebrow text-muted-foreground">Phone</span>
                      <input name="phone" type="tel" maxLength={30} className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm" />
                    </label>
                    <label className="block">
                      <span className="eyebrow text-muted-foreground">Email</span>
                      <input name="email" type="email" maxLength={255} className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="eyebrow text-muted-foreground">Subject</span>
                    <input name="subject" maxLength={120} className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm" />
                  </label>
                  <label className="block">
                    <span className="eyebrow text-muted-foreground">Message</span>
                    <textarea name="message" rows={5} maxLength={1000} required className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm" />
                  </label>
                  {error ? (
                    <p role="alert" className="text-sm text-destructive">
                      {error}
                    </p>
                  ) : null}
                  <button type="submit" className="eyebrow w-full bg-primary px-7 py-5 text-primary-foreground">
                    Send message
                  </button>
                </form>
              )}
            </div>

            <div className="mt-6 border border-border bg-secondary p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Booking a table instead?{" "}
                <Link to="/reservations" className="text-primary underline">
                  Request a reservation
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
