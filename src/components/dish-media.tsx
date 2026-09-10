import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A dish photo that swaps to a short, silent, looping video clip on
 * hover/focus when one is available (e.g. sizzling on the grill, steam
 * off a fresh plate) — falls back to the plain photo everywhere else
 * (touch devices, no clip uploaded yet). The video element is only
 * mounted while hovered/focused so each play starts fresh from frame one
 * and nothing downloads until a guest actually lingers on the card.
 */
export function DishMedia({
  imageSrc,
  videoSrc,
  alt,
  className,
  imgClassName,
}: {
  imageSrc: string;
  videoSrc?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const [active, setActive] = useState(false);

  return (
    <div
      className={cn("img-zoom relative", className)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        className={cn("img-zoom-target h-full w-full object-cover", imgClassName)}
      />
      {videoSrc && active ? (
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
    </div>
  );
}
