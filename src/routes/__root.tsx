import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { OrderDrawer } from "@/components/order-drawer";
import { OrderProvider } from "@/lib/order";
import { siteSettingsQueryOptions } from "@/lib/site-settings-query";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow text-primary">404</p>
        <h1 className="mt-4 font-display text-4xl">This page isn't on the menu</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link to="/" className="eyebrow bg-primary px-6 py-4 text-primary-foreground">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl">This page didn't load</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Something went wrong on our end. You can try again or head back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="eyebrow bg-primary px-6 py-4 text-primary-foreground"
          >
            Try again
          </button>
          <a href="/" className="eyebrow border border-border px-6 py-4">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async ({ context }) => {
    // Best-effort prefetch so there's usually no loading flash. Never lets
    // a failure here reach the router — useSiteSettings() has its own
    // static fallback for exactly this case, so a DB hiccup during SSR
    // must not crash the whole site over a non-critical prefetch.
    try {
      await context.queryClient.ensureQueryData(siteSettingsQueryOptions);
    } catch {
      // Swallowed on purpose — see comment above.
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cultures Resort | Traditional African Restaurant in Harare" },
      {
        name: "description",
        content:
          "Cultures Resort is a traditional African restaurant and cultural dining destination in Hillside, Harare, Zimbabwe.",
      },
      { property: "og:site_name", content: "Cultures Resort" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_ZW" },
      {
        property: "og:image",
        content: "https://culturesresort.ngaatendwew.workers.dev/og-image.jpg",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content: "https://culturesresort.ngaatendwew.workers.dev/og-image.jpg",
      },
      { name: "theme-color", content: "#2a1d13" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..700&family=DM+Sans:ital,wght@0,300..700;1,300..500&family=Manrope:wght@400..800&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: "Cultures Resort",
          servesCuisine: "Traditional African",
          telephone: "+263772951308",
          email: "culturesresortzimbabwe@gmail.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Corner Chiremba Road & Southey Road, Hillside",
            addressLocality: "Harare",
            addressCountry: "ZW",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      {isAdmin ? (
        /* Required: nested routes render here. */
        <Outlet />
      ) : (
        <OrderProvider>
          <a
            href="#main"
            className="eyebrow sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main">
            <Outlet />
          </main>
          <SiteFooter />
          {/* Bottom bar covers the last strip of the page on mobile. */}
          <div className="h-16 lg:hidden" aria-hidden="true" />
          <MobileActionBar />
          <WhatsAppFab />
          <OrderDrawer />
        </OrderProvider>
      )}
    </QueryClientProvider>
  );
}
