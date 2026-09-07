import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { business, navLinks } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled || open
          ? "bg-background/95 border-b border-border backdrop-blur"
          : "bg-gradient-to-b from-ink/70 to-transparent",
      )}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 lg:px-10">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className={cn(
            "min-w-0 leading-none transition-colors",
            scrolled || open ? "text-foreground" : "text-bone",
          )}
          aria-label={`${business.name} — home`}
        >
          <span className="block font-display text-lg tracking-tight sm:text-xl">Cultures Resort</span>
          <span className="eyebrow mt-1 block text-[0.6rem] opacity-70">Harare · Zimbabwe</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className={cn(
                "eyebrow transition-opacity hover:opacity-100",
                scrolled ? "text-foreground/80" : "text-bone/85",
              )}
              activeProps={{ className: "!opacity-100 underline decoration-ochre decoration-2 underline-offset-8" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/reservations"
            className="eyebrow bg-primary px-5 py-3 text-primary-foreground transition-colors hover:bg-ember"
          >
            Reserve a table
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className={cn(
            "relative h-11 w-11 lg:hidden",
            scrolled || open ? "text-foreground" : "text-bone",
          )}
        >
          <span
            className={cn(
              "absolute left-1/2 block h-px w-6 -translate-x-1/2 bg-current transition-all duration-300",
              open ? "top-1/2 rotate-45" : "top-[38%]",
            )}
          />
          <span
            className={cn(
              "absolute left-1/2 top-1/2 block h-px w-6 -translate-x-1/2 bg-current transition-all duration-300",
              open ? "opacity-0" : "opacity-100",
            )}
          />
          <span
            className={cn(
              "absolute left-1/2 block h-px w-6 -translate-x-1/2 bg-current transition-all duration-300",
              open ? "top-1/2 -rotate-45" : "top-[62%]",
            )}
          />
        </button>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "grid overflow-hidden bg-background transition-[max-height,opacity] duration-500 lg:hidden",
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="flex flex-col px-5 pb-8 pt-2" aria-label="Mobile">
          {navLinks.map((l, i) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: `${i * 40}ms` }}
              className={cn(
                "border-b border-border py-4 font-display text-2xl transition-all duration-500",
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              )}
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/reservations"
            onClick={() => setOpen(false)}
            className="eyebrow mt-6 bg-primary px-5 py-4 text-center text-primary-foreground"
          >
            Reserve a table
          </Link>
          <a
            href={business.mapsHref}
            target="_blank"
            rel="noreferrer"
            className="eyebrow mt-3 border border-border px-5 py-4 text-center"
          >
            Get directions
          </a>
        </nav>
      </div>
    </header>
  );
}
