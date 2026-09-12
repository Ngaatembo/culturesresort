import { createServerFn } from "@tanstack/react-start";
import { getSecret, setSecret } from "@/lib/auth/secret-store";
import { authMiddleware } from "@/lib/auth/functions";
import { getDb } from "./cf";

const RESEND_KEY_SECRET_NAME = "resend_api_key";
// Resend's own shared testing domain — works with zero setup, but Resend
// only delivers mail sent from it to the account owner's own verified
// address. For reliable delivery to any inbox, verify a real domain in the
// Resend dashboard and switch this to an address on it (e.g.
// notifications@culturesresort.co.zw).
const DEFAULT_FROM = "Cultures Resort <onboarding@resend.dev>";

/**
 * Fire-and-forget email notification via Resend. Never throws — a booking
 * or enquiry must still save even if the email fails to send (missing key,
 * Resend outage, bad address, etc.), so every failure is swallowed here
 * rather than surfaced to the person submitting the form.
 */
export async function sendNotificationEmail(subject: string, text: string): Promise<void> {
  try {
    const db = getDb();
    const row = await db
      .prepare("SELECT value FROM site_settings WHERE key = 'notifications'")
      .first<{ value: string }>();
    const prefs = row?.value
      ? (JSON.parse(row.value) as { enabled: boolean; email: string })
      : { enabled: false, email: "" };
    if (!prefs.enabled || !prefs.email) return;

    const apiKey = await getSecret(RESEND_KEY_SECRET_NAME);
    if (!apiKey) return;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: DEFAULT_FROM,
        to: [prefs.email],
        subject,
        text,
      }),
    });
  } catch {
    // Swallowed on purpose — see doc comment above.
  }
}

/** Admin-only — whether a Resend API key has been set, without ever exposing its value. */
export const getResendKeyStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const value = await getSecret(RESEND_KEY_SECRET_NAME);
    return { isSet: !!value };
  });

/** Admin-only — stores (or overwrites) the Resend API key used for notification emails. */
export const setResendKey = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { apiKey: string }) => data)
  .handler(async ({ data }) => {
    const key = data.apiKey.trim();
    if (!key) {
      throw new Error("Paste in a Resend API key first.");
    }
    await setSecret(RESEND_KEY_SECRET_NAME, key);
    return { ok: true as const };
  });

/** Admin-only — sends a one-off test email to confirm the Resend key + address actually work. */
export const sendTestNotification = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async () => {
    const db = getDb();
    const row = await db
      .prepare("SELECT value FROM site_settings WHERE key = 'notifications'")
      .first<{ value: string }>();
    const prefs = row?.value
      ? (JSON.parse(row.value) as { enabled: boolean; email: string })
      : { enabled: false, email: "" };
    if (!prefs.email) {
      throw new Error("Add a notification email address first.");
    }
    const apiKey = await getSecret(RESEND_KEY_SECRET_NAME);
    if (!apiKey) {
      throw new Error("Add a Resend API key first.");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: DEFAULT_FROM,
        to: [prefs.email],
        subject: "Cultures Resort — test notification",
        text: "If you're reading this, booking and enquiry email notifications are working.",
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Resend rejected the request (${res.status}): ${body.slice(0, 200)}`);
    }
    return { ok: true as const };
  });
