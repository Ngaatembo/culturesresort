import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/reveal";
import { useSiteSettings } from "@/lib/site-settings-query";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use | Cultures Resort, Harare" },
      {
        name: "description",
        content:
          "Simple terms for using the Cultures Resort website, making reservation requests and placing orders.",
      },
    ],
  }),
  component: Terms,
});

function Terms() {
  const { business } = useSiteSettings();

  return (
    <section className="bg-background pb-20 pt-32 lg:pb-28 lg:pt-40">
      <div className="mx-auto max-w-3xl px-5 lg:px-10">
        <Reveal>
          <p className="eyebrow rule-ochre text-primary">Terms of Use</p>
          <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.25rem)] leading-tight">
            Using this website
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: 28 September 2026</p>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            These are the simple ground rules for using the Cultures Resort website. By using it,
            you agree to them. If anything is unclear, just ask us.
          </p>
        </Reveal>

        <div className="mt-10 space-y-10 text-base leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-2xl text-foreground">About this website</h2>
            <p className="mt-3">
              This website is run by Cultures Resort, a restaurant at {business.addressLine}. It
              gives information about the restaurant, its menu, grounds and events, and lets you
              send us reservation requests, enquiries and orders.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Reservation requests</h2>
            <p className="mt-3">
              A reservation request sent through this website is a request, not a confirmed booking.
              Your table or event is only confirmed once the restaurant confirms it with you. If
              your plans change, please tell us as early as you can.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Orders</h2>
            <p className="mt-3">
              Orders sent through this website go to the restaurant's kitchen. Payment is made to
              the restaurant directly. The website does not take card payments. If you need to be
              sure about an item, its price or how long it will take, please check with the
              restaurant.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Menu, prices and availability</h2>
            <p className="mt-3">
              We do our best to keep the menu, prices, opening hours and event details on this
              website up to date, but they can change and some dishes may not be available on a
              given day. Where this website and the restaurant differ, the restaurant's answer
              applies.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Allergies and dietary needs</h2>
            <p className="mt-3">
              This website does not list every ingredient. If you have an allergy or a dietary
              requirement, please tell our staff when you book or order so they can advise you.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Photos and content</h2>
            <p className="mt-3">
              The photos, text and logo on this website belong to Cultures Resort or are used with
              permission. Please don't copy or reuse them commercially without asking us first. Some
              links on this site lead to other websites, such as Google, Facebook or Instagram,
              which have their own rules and which we don't control.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Using the website fairly</h2>
            <p className="mt-3">
              Please use the website only for its intended purpose. Don't send false or abusive
              requests, and don't try to interfere with the website or the staff area.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Limits</h2>
            <p className="mt-3">
              We take care to keep this website running and accurate, but we can't promise it will
              always be available or free of mistakes. To the extent the law allows, Cultures Resort
              isn't responsible for losses caused by using the website or by relying on information
              on it that turned out to be out of date.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Your details</h2>
            <p className="mt-3">
              How we handle the details you send us is explained in our{" "}
              <Link to="/privacy" className="text-primary underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Changes and questions</h2>
            <p className="mt-3">
              We may update these terms from time to time, and the date above will change when we
              do. These terms are governed by the laws of Zimbabwe. Questions? Contact us:
            </p>
            <address className="mt-3 space-y-1 not-italic">
              <a href={`mailto:${business.email}`} className="block text-primary underline">
                {business.email}
              </a>
              <a href={business.phoneHref} className="block text-primary underline">
                {business.phoneDisplay}
              </a>
            </address>
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
