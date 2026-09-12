import { getDb } from "@/lib/data/cf";

/**
 * Reads a named secret from the app_secrets table, generating and storing
 * a fresh random one on first use if it doesn't exist yet. This avoids
 * depending on Cloudflare's dashboard "Variables and Secrets" UI, whose
 * values can be wiped out by the next GitHub-integration deploy — the
 * database is the one thing that reliably persists across deploys here.
 */
export async function getOrCreateSecret(key: string, bytes = 48): Promise<string> {
  const db = getDb();
  const existing = await db
    .prepare("SELECT value FROM app_secrets WHERE key = ?")
    .bind(key)
    .first<{ value: string }>();
  if (existing?.value) return existing.value;

  const value = Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // INSERT OR IGNORE guards a race if two requests both find it missing at
  // once; whichever wrote first wins, so re-read afterward either way.
  await db
    .prepare("INSERT OR IGNORE INTO app_secrets (key, value) VALUES (?, ?)")
    .bind(key, value)
    .run();
  const row = await db
    .prepare("SELECT value FROM app_secrets WHERE key = ?")
    .bind(key)
    .first<{ value: string }>();
  return row!.value;
}

/** Reads an explicitly-provided secret (e.g. a third-party API key). Returns
 * null if it hasn't been set — unlike getOrCreateSecret, nothing is invented. */
export async function getSecret(key: string): Promise<string | null> {
  const db = getDb();
  const row = await db
    .prepare("SELECT value FROM app_secrets WHERE key = ?")
    .bind(key)
    .first<{ value: string }>();
  return row?.value ?? null;
}

/** Stores or overwrites an explicitly-provided secret (e.g. a Resend API key
 * pasted in from the admin panel). Same table as getOrCreateSecret so it
 * survives redeploys the same way. */
export async function setSecret(key: string, value: string): Promise<void> {
  const db = getDb();
  await db
    .prepare(
      "INSERT INTO app_secrets (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .bind(key, value)
    .run();
}
