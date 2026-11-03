import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";

/** 1×1 transparent GIF: keeps the <img> a valid, empty box until it loads. */
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

type LazyImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "loading"> & {
  /** How far outside the viewport to start fetching (≈ one screen ahead). */
  rootMargin?: string;
};

/**
 * Below-the-fold photo that is not requested until it is about to scroll into
 * view. Native `loading="lazy"` still fetches anything within Chrome's very
 * generous distance threshold (about 1250–2500 px), which on a phone pulled
 * ~700 KB of below-the-fold photos into the first load and competed with the
 * hero image (the LCP element) for bandwidth.
 *
 * - Width/height (or the caller's aspect-ratio classes) still reserve the box,
 *   so there is no layout shift.
 * - Without JavaScript, the <noscript> copy loads the image normally.
 * - Without IntersectionObserver the image loads immediately.
 */
export function LazyImg({
  src,
  srcSet,
  sizes,
  rootMargin = "500px 0px",
  alt,
  ...rest
}: LazyImgProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <>
      <img
        {...rest}
        ref={ref}
        alt={alt}
        src={near ? src : BLANK}
        srcSet={near ? srcSet : undefined}
        sizes={near ? sizes : undefined}
        decoding="async"
      />
      <noscript>
        <img {...rest} alt={alt} src={src} srcSet={srcSet} sizes={sizes} loading="lazy" />
      </noscript>
    </>
  );
}
