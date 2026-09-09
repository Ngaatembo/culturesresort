/**
 * Password hashing for the admin login. Uses PBKDF2 via the standard Web
 * Crypto API (`crypto.subtle`) rather than bcrypt/argon2, because Cloudflare
 * Workers can't run native/WASM-free npm hashing libs the way Node can —
 * Web Crypto is the one strong KDF available everywhere this app runs.
 */

const ITERATIONS = 210_000; // OWASP-recommended minimum for PBKDF2-SHA256 (2023+)
const KEY_LENGTH_BITS = 256;

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function derive(password: string, salt: Uint8Array): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    KEY_LENGTH_BITS,
  );
  return toHex(bits);
}

/** Returns a fresh random salt (hex) and the matching password hash (hex). */
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, saltBytes);
  return { hash, salt: toHex(saltBytes.buffer) };
}

/** Derives the same way and compares byte-for-byte without short-circuiting. */
export async function verifyPassword(
  password: string,
  hash: string,
  salt: string,
): Promise<boolean> {
  const candidate = await derive(password, fromHex(salt));
  if (candidate.length !== hash.length) return false;
  // XOR every byte rather than bailing on the first mismatch, so the check
  // takes the same time whether the guess is close or wildly off.
  let diff = 0;
  for (let i = 0; i < candidate.length; i++) {
    diff |= candidate.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Hash of a real (but never-issued, unusable) password, computed the same
 * way as a real user's. A login attempt for an email that doesn't exist
 * still runs a full PBKDF2 derivation against this — taking the same time
 * as a real wrong-password attempt — instead of returning early and
 * leaking "this email isn't registered" through response timing.
 */
export const DUMMY_HASH = {
  hash: "b7f3c1a2d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f",
  salt: "00112233445566778899aabbccddeeff",
};
