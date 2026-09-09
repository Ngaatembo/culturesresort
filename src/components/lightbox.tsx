import { useCallback, useEffect } from "react";

export type LightboxImage = { src: string; alt: string; caption?: string };

export function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const open = index !== null;

  const step = useCallback(
    (dir: number) => {
      if (index === null) return;
      onIndexChange((index + dir + images.length) % images.length);
    },
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, step]);

  const image = index === null ? undefined : images[index];
  if (!open || !image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.caption ?? image.alt}
      className="fixed inset-0 z-[100] flex flex-col bg-ink/96 p-4 sm:p-8"
    >
      <div className="flex items-center justify-between gap-4 text-bone">
        <p className="eyebrow text-bone/60">
          {index + 1} / {images.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="eyebrow px-3 py-2 hover:text-ochre"
          autoFocus
        >
          Close ✕
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous image"
          className="shrink-0 px-2 py-6 text-2xl text-bone/70 hover:text-ochre"
        >
          ‹
        </button>
        <img
          src={image.src}
          alt={image.alt}
          className="max-h-full min-h-0 w-auto max-w-full object-contain"
        />
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next image"
          className="shrink-0 px-2 py-6 text-2xl text-bone/70 hover:text-ochre"
        >
          ›
        </button>
      </div>

      {image.caption ? (
        <p className="pt-4 text-center text-sm text-bone/70">{image.caption}</p>
      ) : null}
    </div>
  );
}
