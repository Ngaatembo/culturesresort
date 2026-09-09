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
