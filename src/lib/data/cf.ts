/**
 * Minimal local typings for the Cloudflare D1 binding — avoids pulling in
 * @cloudflare/workers-types just for a handful of methods.
 */
export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: { last_row_id?: number; changes?: number; [key: string]: unknown };
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  first<T = unknown>(colName?: string): Promise<T | null>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

/**
 * Returns the D1 binding for the current request.
 *
 * Nitro's `cloudflare_module` preset stashes the Worker's `env` on
 * `globalThis.__env__` before invoking the app for every request — see
 * `nitro/dist/presets/cloudflare/runtime/_module-handler.mjs`. Reading it
 * back here is the same convention Nitro itself uses internally, so it
 * needs no extra request-context plumbing.
 *
 * Requires a `wrangler.jsonc` with a `d1_databases` binding named `DB`,
 * and only resolves when running through the Cloudflare preset (i.e. not
 * in the plain `vite dev` server) — use `wrangler dev` locally.
 */
export function getDb(): D1Database {
  const env = (globalThis as unknown as { __env__?: { DB?: D1Database } }).__env__;
  const db = env?.DB;
  if (!db) {
    throw new Error(
      'D1 binding "DB" is not available in this environment. Run `wrangler dev` (or deploy to Cloudflare) rather than the plain Vite dev server, and confirm wrangler.jsonc has the DB binding.',
    );
  }
  return db;
}

/**
 * Minimal local typings for the Cloudflare R2 binding used by the gallery
 * uploader — again just the handful of methods actually used, rather than
 * pulling in @cloudflare/workers-types.
 */
export interface R2Object {
  key: string;
}

export interface R2Bucket {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | ReadableStream | Blob,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<R2Object | null>;
  get(key: string): Promise<
    | (R2Object & {
        body: ReadableStream;
        httpMetadata?: { contentType?: string };
        size: number;
      })
    | null
  >;
  delete(key: string): Promise<void>;
}

/**
 * Returns the R2 bucket binding for the current request (see getDb() for
 * how/why this works). Requires a `wrangler.jsonc` with an `r2_buckets`
 * binding named `GALLERY`.
 */
export function getGalleryBucket(): R2Bucket {
  const env = (globalThis as unknown as { __env__?: { GALLERY?: R2Bucket } }).__env__;
  const bucket = env?.GALLERY;
  if (!bucket) {
    throw new Error(
      'R2 bucket binding "GALLERY" is not available. Create the bucket in the Cloudflare dashboard (Workers & Pages → R2 → Create bucket → name it "culturesresort-gallery") and deploy — wrangler.jsonc already declares the binding.',
    );
  }
  return bucket;
}

/**
 * Reads a plain Worker env var / secret (e.g. SESSION_SECRET) the same way
 * `getDb()` reads the D1 binding — via the per-request env Nitro stashes on
 * `globalThis.__env__`. Falls back to `process.env` so it also resolves
 * under `wrangler dev`'s Node-compat layer and any local `.dev.vars`.
 */
export function getEnvVar(name: string): string | undefined {
  const env = (globalThis as unknown as { __env__?: Record<string, string | undefined> }).__env__;
  return env?.[name] ?? (typeof process !== "undefined" ? process.env[name] : undefined);
}
