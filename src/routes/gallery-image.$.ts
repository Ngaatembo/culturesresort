import { createFileRoute } from "@tanstack/react-router";
import { getGalleryBucket } from "@/lib/data/cf";

/**
 * Public image URLs point here: /gallery-image/gallery/xyz.jpg — the
 * splat captures everything after /gallery-image/, i.e. the R2 object key.
 * A raw server route (not a server function) so it returns real image
 * bytes with the right Content-Type, usable directly as an <img src>.
 */
export const Route = createFileRoute("/gallery-image/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = params._splat;
        // Only the public media prefixes are served; no path tricks.
        const PUBLIC_PREFIXES = ["gallery/", "menu/", "menu-video/", "events/"];
        if (!key || key.includes("..") || !PUBLIC_PREFIXES.some((p) => key.startsWith(p))) {
          return new Response("Not found", { status: 404 });
        }
        const bucket = getGalleryBucket();
        const object = await bucket.get(key);
        if (!object) {
          return new Response("Not found", { status: 404 });
        }
        return new Response(object.body, {
          headers: {
            "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
