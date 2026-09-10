import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The "premium image entrance" from the brief: starts slightly scaled
 * down and translated, settles into place with a slow, smooth ease.
 * Same IntersectionObserver + prefers-reduced-motion approach as Reveal
 * (see reveal.tsx) — this is the image-specific sibling of it, since an
 * image wants a scale component that plain text/cards don't.
 */
export function ImageReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-1000 [transition-timing-function:var(--ease-premium)]",
        shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-[0.96] opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
