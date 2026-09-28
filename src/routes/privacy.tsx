import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/reveal";
import { useSiteSettings } from "@/lib/site-settings-query";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Cultures Resort, Harare" },
      {
        name: "description",
        content:
          "How Cultures Resort collects, uses and protects the details you share when you make a reservation, enquiry or order.",
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  const { business } = useSiteSettings();

  return (
    <section className="bg-background pb-20 pt-32 lg:pb-28 lg:pt-40">
      <div className="mx-auto max-w-3xl px-5 lg:px-10">
        <Reveal>
          <p className="eyebrow rule-ochre text-primary">Privacy Policy</p>
          <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.25rem)] leading-tight">
            How we look after your details
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: 28 September 2026</p>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            This page explains, in plain language, what Cultures Resort does with the details you
            share through this website. We only ask for what we need to look after your request.
          </p>
        </Reveal>

        <div className="mt-10 space-y-10 text-base leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-2xl text-foreground">Who we are</h2>
            <p className="mt-3">
              This website is run by Cultures Resort, a restaurant at {business.addressLine}. In
              this policy, "we" and "us" mean Cultures Resort.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">What we collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Reservation and event requests:</strong> your
                name, phone number, email address (optional), date, number of guests and any message
                you add.
              </li>
              <li>
                <strong className="text-foreground">Enquiries:</strong> your name, phone number and
                email address (both optional) and your message.
              </li>
              <li>
                <strong className="text-foreground">Orders:</strong> your name, phone number, the
                items you order and any notes you add.
              </li>
            </ul>
            <p className="mt-3">
              We do not ask for payment card details, ID numbers or anything else on this website.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Why we collect it</h2>
            <p className="mt-3">
              Only to respond to what you asked for: to confirm a booking, answer an enquiry, or
              prepare and confirm an order. We do not sell your details and we do not use them for
              advertising.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Who can see it</h2>
            <p className="mt-3">
              Our staff who handle bookings, enquiries and orders, through the restaurant's admin
              area of this website. The website is run with the help of a professional web hosting
              provider, which stores the website's data and handles it only to keep the website
              running. We do not share your details with anyone else.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">How long we keep it</h2>
            <p className="mt-3">
              Only for as long as we need it to deal with your request, and for a short time
              afterwards in case you have a follow-up question.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Cookies and tracking</h2>
            <p className="mt-3">
              This website does not use advertising or analytics trackers. The only cookie we use is
              a sign-in cookie for our own staff to log in to the admin area, which visitors never
              receive.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">WhatsApp and phone calls</h2>
            <p className="mt-3">
              If you contact us on WhatsApp or by phone instead of using a form, the message or call
              goes straight to the restaurant and is not stored on this website. WhatsApp handles
              messages under its own privacy terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Your choices</h2>
            <p className="mt-3">
              You can ask us to show you the details we hold about you, correct them, or delete
              them. Just contact us using the details below and we will help.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Contact us about your details</h2>
            <address className="mt-3 space-y-1 not-italic">
              <a href={`mailto:${business.email}`} className="block text-primary underline">
                {business.email}
              </a>
              <a href={business.phoneHref} className="block text-primary underline">
                {business.phoneDisplay}
              </a>
              <span className="block">{business.addressLine}</span>
            </address>
            <p className="mt-4">
              We handle personal information with reference to Zimbabwe's Cyber and Data Protection
              Act. If you are not happy with how your details have been handled, you can also raise
              it with the Postal and Telecommunications Regulatory Authority of Zimbabwe (POTRAZ).
            </p>
          </section>

          <p className="text-sm">
            <Link to="/" className="text-primary underline">
              Back to the homepage
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
