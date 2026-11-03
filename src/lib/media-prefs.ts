/**
 * Whether decorative (ambient, muted, looping) video may load and autoplay.
 * False for prefers-reduced-motion, data-saver and 2G/3G connections, in
 * which case callers keep showing the poster image. Client-only: returns
 * false during SSR.
 */
export function canPlayAmbientVideo(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  if (conn?.saveData === true) return false;
  if (conn?.effectiveType && ["slow-2g", "2g", "3g"].includes(conn.effectiveType)) return false;
  return true;
}
