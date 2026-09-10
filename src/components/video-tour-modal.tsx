import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Fullscreen lightbox for the "Take a 1-min tour" hero button. Unlike the
 * ambient background loops (which stay muted and looping), this is a
 * deliberate watch — the guest opened it on purpose, so it plays with
 * native controls and sound.
 */
export function VideoTourModal({
  open,
  onClose,
  src,
  poster,
}: {
  open: boolean;
  onClose: () => void;
  src: string;
  poster?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="A one-minute visual tour of Cultures Resort"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink/96 p-4 sm:p-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close tour video"
        autoFocus
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-bone/25 text-bone transition-colors hover:bg-bone/10 sm:right-8 sm:top-8"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
      <video
        src={src}
        poster={poster}
        controls
        autoPlay
        playsInline
        className="max-h-[85svh] w-full max-w-4xl rounded-2xl shadow-lift"
      />
    </div>
  );
}
