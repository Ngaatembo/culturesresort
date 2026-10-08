/**
 * Minimal Web Push (RFC 8030 + VAPID RFC 8292 + aes128gcm payload encryption
 * RFC 8291) built only on WebCrypto + fetch, so it runs in the Cloudflare
 * Workers runtime. No Node APIs, no dependencies.
 */

const enc = new TextEncoder();
type Bytes = Uint8Array<ArrayBuffer>;
const bytesOf = (s: string): Bytes => new Uint8Array(enc.encode(s));

export function b64urlEncode(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64urlDecode(str: string): Bytes {
  const pad = "=".repeat((4 - (str.length % 4)) % 4);
  const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out: Bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function concat(...parts: Uint8Array[]): Bytes {
  const out: Bytes = new Uint8Array(new ArrayBuffer(parts.reduce((n, p) => n + p.length, 0)));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

export type VapidKeys = { publicKey: string; privateJwk: JsonWebKey };

/** Generates a fresh VAPID (P-256) key pair. publicKey is the base64url uncompressed point. */
export async function generateVapidKeys(): Promise<VapidKeys> {
  const pair = (await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
    "sign",
  ])) as CryptoKeyPair;
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
  const privateJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  return { publicKey: b64urlEncode(raw), privateJwk };
}

async function vapidAuthHeader(
  endpoint: string,
  keys: VapidKeys,
  subject: string,
): Promise<string> {
  const aud = new URL(endpoint).origin;
  const header = b64urlEncode(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = b64urlEncode(
    enc.encode(
      JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject }),
    ),
  );
  const key = await crypto.subtle.importKey(
    "jwk",
    keys.privateJwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      bytesOf(`${header}.${payload}`),
    ),
  );
  return `vapid t=${header}.${payload}.${b64urlEncode(sig)}, k=${keys.publicKey}`;
}

async function hkdf(salt: Bytes, ikm: Bytes, info: Bytes, length: number): Promise<Bytes> {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(
    await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, length * 8),
  );
}

/** RFC 8291 aes128gcm encryption of a payload for one subscription. */
async function encryptPayload(plaintext: Bytes, p256dh: string, auth: string): Promise<Bytes> {
  const uaPublic = b64urlDecode(p256dh);
  const authSecret = b64urlDecode(auth);

  const local = (await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
    "deriveBits",
  ])) as CryptoKeyPair;
  const localPublic = new Uint8Array(await crypto.subtle.exportKey("raw", local.publicKey));
  const uaKey = await crypto.subtle.importKey(
    "raw",
    uaPublic,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );
  const ecdh = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, local.privateKey, 256),
  );

  const keyInfo = concat(bytesOf("WebPush: info\0"), uaPublic, localPublic);
  const ikm = await hkdf(authSecret, ecdh, keyInfo, 32);

  const salt = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(16)));
  const cek = await hkdf(salt, ikm, bytesOf("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, bytesOf("Content-Encoding: nonce\0"), 12);

  // Single record: plaintext + 0x02 delimiter (last record), no padding.
  const record = concat(plaintext, new Uint8Array([2]));
  const aes = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aes, record),
  );

  const rs = new Uint8Array(new ArrayBuffer(4));
  new DataView(rs.buffer).setUint32(0, 4096);
  return concat(salt, rs, new Uint8Array([localPublic.length]), localPublic, cipher);
}

export type PushTarget = { endpoint: string; p256dh: string; auth: string };
export type PushResult = { ok: boolean; status: number; gone: boolean };

/** Sends one encrypted push. Never throws — returns the outcome. `gone` means the subscription is dead (404/410). */
export async function sendWebPush(
  target: PushTarget,
  payload: unknown,
  keys: VapidKeys,
  subject: string,
  opts: { ttl?: number; urgency?: "very-low" | "low" | "normal" | "high"; timeoutMs?: number } = {},
): Promise<PushResult> {
  try {
    const body = await encryptPayload(bytesOf(JSON.stringify(payload)), target.p256dh, target.auth);
    const res = await fetch(target.endpoint, {
      method: "POST",
      headers: {
        Authorization: await vapidAuthHeader(target.endpoint, keys, subject),
        "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream",
        TTL: String(opts.ttl ?? 60 * 60 * 24),
        Urgency: opts.urgency ?? "high",
      },
      body,
      signal: AbortSignal.timeout(opts.timeoutMs ?? 5000),
    });
    return { ok: res.ok, status: res.status, gone: res.status === 404 || res.status === 410 };
  } catch {
    return { ok: false, status: 0, gone: false };
  }
}
