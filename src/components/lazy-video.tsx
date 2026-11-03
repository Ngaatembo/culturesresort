import { forwardRef, useEffect, useRef, useState, type VideoHTMLAttributes } from "react";
import { canPlayAmbientVideo } from "@/lib/media-prefs";

type LazyVideoProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  "src" | "preload" | "autoPlay"
> & {
  src: string;
  poster: string;
  /** How far outside the viewport to start fetching. */
  rootMargin?: string;
};

/**
 * Ambient video that downloads nothing until it is about to scroll into view.
 *
 * Until then (and permanently under reduced-motion / data-saver / 2G-3G) it
 * is just a `<video preload="none" poster>` — the poster paints in the same
 * box, so layout never shifts and nothing is fetched except the poster.
 * Once near the viewport the source is attached and playback starts.
 */
export const LazyVideo = forwardRef<HTMLVideoElement, LazyVideoProps>(function LazyVideo(
  { src, poster, rootMargin = "0px", ...rest },
  forwardedRef,
) {
  const innerRef = useRef<HTMLVideoElement | null>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = innerRef.current;
    if (!el || !canPlayAmbientVideo() || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (!load) return;
    const el = innerRef.current;
    if (!el) return;
    // React's `muted` attribute does not always reach the DOM property before
    // the autoplay check, so set it explicitly.
    el.muted = rest.muted ?? true;
    el.play().catch(() => {
      /* autoplay blocked: the poster remains visible */
    });
  }, [load, rest.muted]);

  return (
    <video
      {...rest}
      ref={(node) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      src={load ? src : undefined}
      poster={poster}
      preload={load ? "auto" : "none"}
      autoPlay={load}
      playsInline
    />
  );
});
