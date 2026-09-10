import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Subtle vertical drift as a large image scrolls through view — the
 * "the page is responding to my movement" effect from the brief, used
 * sparingly on hero/banner images only.
 *
 * Deliberately NOT React state: the scroll handler writes `transform`
 * directly to the DOM node (rAF-throttled), so a mid-speed scroll never
 * triggers a single React re-render. Disabled outright below 768px and
 * under prefers-reduced-motion, per the brief's mobile/performance rules
 * — parallax is the first thing to cut on a small screen.
 */
export function ParallaxImage({
  children,
  strength = 40,
  className,
}: {
  children: ReactNode;
  /** Max px of vertical drift from top of viewport to bottom. Keep small. */
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 767px)").matches
    ) {
      return;
    }

    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when the element's center is at the viewport's center, ranging
      // roughly -1..1 as it moves from below to above the fold.
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      const offset = Math.max(-1, Math.min(1, progress)) * strength;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [strength]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
