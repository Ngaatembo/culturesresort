import { useEffect, useState } from "react";
import logoFull from "@/assets/logo-full.png";

const SESSION_KEY = "cultures-logo-intro-shown";

/**
 * Plays the Cultures Resort mark once per browser session on first
 * homepage load: fades in on a black backdrop, pulses briefly, fades
 * out to reveal the hero underneath. Then it's gone — it does not
 * replay on remount, scroll, or return visits within the same
 * session, and it never repeats inside the ambient background loop
 * (that loop stays pure scenery; see garden-loop.mp4 / WhySection
 * comments). Skips entirely under prefers-reduced-motion or if the
 * session flag is already set, rather than showing a static logo in
 * its place — the mark already lives in the header.
 */
export function LogoIntroOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadyShown = sessionStorage.getItem(SESSION_KEY) === "1";
    if (reduceMotion || alreadyShown) return;

    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-ink logo-intro"
      onAnimationEnd={() => setVisible(false)}
    >
      <img
        src={logoFull}
        alt=""
        width={1254}
        height={1254}
        className="h-[42vh] w-[42vh] max-w-[70vw] object-contain"
      />
    </div>
  );
}
