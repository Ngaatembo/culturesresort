import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

const MUTE_KEY = "cr_admin_alerts_muted";

type AudioCtor = typeof AudioContext;

function getAudioCtor(): AudioCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Alert chime for the admin area. Browsers only allow sound after the person
 * has interacted with the page once, so the audio context is created on the
 * first tap/click/key press — `ready` tells the UI whether that has happened.
 * Only ever used inside /admin, so it only reaches signed-in staff.
 */
export function useAlertSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMuted(readMuted());
    const Ctor = getAudioCtor();
    if (!Ctor) return;
    const unlock = () => {
      if (!ctxRef.current) ctxRef.current = new Ctor();
      void ctxRef.current.resume().then(() => setReady(ctxRef.current?.state === "running"));
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      } catch {
        /* preference just won't persist */
      }
      return next;
    });
  }, []);

  const play = useCallback(() => {
    const ctx = ctxRef.current;
    if (muted || !ctx || ctx.state !== "running") return;
    const now = ctx.currentTime;
    [
      [880, 0],
      [1174.66, 0.2],
      [880, 0.6],
      [1174.66, 0.8],
    ].forEach(([freq, offset]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq!;
      gain.gain.setValueAtTime(0.0001, now + offset!);
      gain.gain.exponentialRampToValueAtTime(0.3, now + offset! + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset! + 0.45);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + offset!);
      osc.stop(now + offset! + 0.5);
    });
  }, [muted]);

  return { muted, ready, toggleMuted, play };
}

/**
 * Remembers the newest id it has seen per kind and reports only genuinely
 * newer arrivals. The first reading is the baseline, so opening the admin
 * never chimes for things that were already waiting.
 */
export function useNewArrivals() {
  const seen = useRef<Record<string, number>>({});
  return useCallback((latest: Record<string, number>): string[] => {
    const fresh: string[] = [];
    for (const [kind, id] of Object.entries(latest)) {
      const prev = seen.current[kind];
      if (prev !== undefined && id > prev) fresh.push(kind);
      seen.current[kind] = prev === undefined ? id : Math.max(prev, id);
    }
    return fresh;
  }, []);
}

/** Small bottom-corner control: mute switch, "tap to enable" hint, and the latest alert message. */
export function AlertControl({
  muted,
  ready,
  onToggle,
  message,
}: {
  muted: boolean;
  ready: boolean;
  onToggle: () => void;
  message: string | null;
}) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {message ? (
        <div
          role="status"
          className="pointer-events-auto rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg"
        >
          {message}
        </div>
      ) : null}
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={!muted}
        className={cn(
          "pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-foreground shadow-md",
        )}
      >
        {muted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        {muted
          ? "Alert sound off"
          : ready
            ? "Alert sound on"
            : "Tap anywhere to enable alert sound"}
      </button>
    </div>
  );
}
