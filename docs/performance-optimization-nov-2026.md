# Website performance, accessibility and maintenance — November 2026

Status: **preview-tested locally; not deployed. Production deployment needs owner approval.**

## 1. Baseline evidence (PageSpeed Insights, 3 Nov 2026, supplied by WebAura)

- Mobile performance 72; desktop performance 97–98.
- Desktop accessibility / best practices / SEO: 100 / 100 / 100.
- Mobile findings: image delivery (~683 KiB est.), render-blocking requests, legacy JS, unused JS/CSS, forced reflow, prohibited ARIA attribute, contrast. One diagnostic reported ~6,931 KiB total payload.
- No CrUX field data was present: these are lab results, not real-visitor data.

Keep the original screenshots with the project handover. They are **not** repeated here as "after" numbers.

## 2. Test conditions and their limits (read before comparing numbers)

The sandbox cannot reach `culturesresort.co.zw` or pagespeed.web.dev (egress proxy returns 403), so **production and PSI were not measured**. Instead, both "before" and "after" below were measured with the same method:

- `vite build` output served by `wrangler dev` (local D1 with all `migrations/` applied, so the menu is real seed data; local R2 is empty).
- Lighthouse 12, Chromium headless, default mobile (Moto G-class, simulated slow 4G, 4× CPU) and desktop presets, 3–5 runs, medians reported.
- **No Cloudflare edge** in this setup: no gzip/brotli, no CDN, no HTTP/2 prioritisation, and Google Fonts load from a different network path. Scores are therefore *not* comparable with PSI numbers (e.g. local "before" mobile scored 57, PSI scored 72). Only the local before/after *delta* is meaningful.
- "Before" = PR #14 branch as it stood (mobile hero video already deferred). Local `main` was not measured separately; its desktop behaviour is identical to PR #14.

| Metric (local lab, medians) | Before (PR #14) | After | Notes |
|---|---|---|---|
| Mobile performance | 57 (49–60) | **78 (76–84)** | 3 vs 5 runs |
| Mobile FCP | 3.2 s | 2.35 s | |
| Mobile LCP | 18.6 s | **4.4 s** (3.4–4.6) | hero 860 KB JPEG → ~150 KB WebP |
| Mobile TBT | 253 ms | 11 ms | |
| Mobile CLS | 0 | 0 | |
| Mobile Speed Index | 7.5 s | 5.8 s | |
| Mobile total transfer | 5,683 KB | **1,197 KB** | |
| Mobile image bytes | 5,229 KB | 878 KB | |
| Mobile video bytes (initial load) | 140 KB | **0 KB** | video now loads only on scroll |
| Mobile JS transferred | 161 KB | 166 KB | +5 KB (lazy-video, prefs helper) |
| Mobile accessibility | 92 | **100** | |
| Mobile best practices / SEO | 93 / 92 | 96 / 100 | |
| Desktop performance | 78 (77–79) | **90 (90–91)** | |
| Desktop LCP | 3.2 s | 1.4 s | |
| Desktop total transfer | 6,362 KB | 3,017 KB | desktop hero video (564 KB) still plays by design |
| Desktop accessibility / BP / SEO | 92 / 96 / 92 | 100 / 100 / 100 | |

Mobile 90+ was **not reached** in this lab (best run 84). Remaining reasons are listed in §6.

## 3. Audit (confirmed findings only)

| # | Finding | Where | Evidence | Fix |
|---|---|---|---|---|
| 1 | Oversized hero/LCP image: 1920×2560 JPEG, 860 KB, served to every phone | `src/routes/index.tsx` (`heroImg`), `src/assets/entrance-banana-leaves.jpg` | Lighthouse network list; LCP element = this `<img>` | Responsive WebP `srcset` (480/800/1080/1600 w) |
| 2 | Many below-fold photos shipped at full size (400–660 KB each) into small grid cells, loaded because Chrome's lazy-load margin spans ~2 screens | `index.tsx` gallery strip/food/maheu sections, `experience-grid.tsx` | Network list; image-delivery insight: est. 4,787 KiB savings | Responsive WebP variants + `sizes` |
| 3 | `logo-full.png` 800 KB loaded eagerly on first visit (intro overlay) and in the footer (not lazy) | `logo-intro-overlay.tsx`, `site-footer.tsx` | Network list | 512 px WebP (21 KB); footer `loading="lazy"` |
| 4 | Header logo 117 KB PNG shown at 32–40 px; watermark PNG 128 KB at 6 % opacity | `site-header.tsx`, `index.tsx` | Network list | 128 px / 320 px WebP |
| 5 | Ambient "craft" video (`fire-cooking-loop.mp4`) mounted and autoplayed immediately on every device **even under prefers-reduced-motion and data-saver**, `preload="metadata"` | `index.tsx` | Code + network list (140 KB at load) | New `LazyVideo`: no `src` until near viewport; honours reduced-motion/save-data/2G-3G |
| 6 | Menu cocktail video ignored data-saver/slow-connection | `menu.tsx` | Code | Same `LazyVideo` + shared `canPlayAmbientVideo()` |
| 7 | Google Fonts stylesheet was render-blocking | `src/routes/__root.tsx` | Render-blocking insight (~1.1 s est.) | `media="print"` + inline swap script + `<noscript>` fallback; `display=swap` already present |
| 8 | A11y: `aria-label` on a plain `<div>` (prohibited ARIA) | star ratings, `index.tsx` | `aria-prohibited-attr` | `role="img"` |
| 9 | A11y: contrast 4.26 (white on terracotta buttons), 4.05 (terracotta text on cream), 3.99 (footer legal text) | `--primary` in `src/styles.css`; `site-footer.tsx` | `color-contrast` | `--primary` `#c1502e`→`#b54827` (4.84 / 4.61); footer text `/45`→`/60` |
| 10 | A11y: header logo link's `aria-label` didn't contain its visible text | `site-header.tsx` | `label-content-name-mismatch` | Removed redundant `aria-label`; the link's own text names it |

### Checked and found fine (no change made)

- **Forced reflow**: Lighthouse reported *no* forced-reflow sources in the local trace (insight score 1, empty table). `ParallaxImage` already does rAF-throttled, transform-only writes with passive listeners, disabled for reduced motion. Not changed; the PSI finding is **unreproduced** locally and remains open (§6).
- **Legacy JS**: insight score 1 locally; not changed.
- **Caching**: `/assets/*` is `public, max-age=31536000, immutable` (generated `_headers`); fingerprinted names make that safe. R2 images (`/gallery-image/*`) are immutable-cached, and every upload/replacement gets a new `Date.now()+UUID` key (`gallery-photos.ts`, `menu.ts`), so replaced images are never served stale. Menu/admin server functions send `no-store` / `private, no-store`. `public/sw.js` is push-only (no fetch caching), so there is no stale-asset risk. **Actual production response headers could not be inspected** from this sandbox.
- **Route splitting**: admin routes are separate chunks; public initial JS is ~166 KB transferred (uncompressed locally).
- **Entrance tour video (9.2 MB)** is only mounted when the visitor opens the modal; confirmed no request on page load.

## 4. Change report

| File | Problem | Change | Risk / rollback |
|---|---|---|---|
| `src/routes/index.tsx` (PR #14) | Mobile hero video | Mobile keeps static hero | Revert commit |
| `src/routes/index.tsx` | Heavy images, eager craft video | Responsive `srcSet`/`sizes`; `LazyVideo` for craft + fire videos; shared media check | Visual output identical (same crops, `object-cover`, same width/height). Revert file |
| `src/lib/responsive-images.ts` (new) | — | Maps bundled originals → WebP variants via `import.meta.glob`. **Only applies while a slot still resolves to the bundled original**; admin-assigned R2 images are returned untouched | Admin slot assignment, replacement and deletion unaffected |
| `src/assets/optimized/*` (new, 4.3 MB source) | — | 37 generated WebP variants. **Originals untouched** (gallery, lightbox, admin, JSON-LD still use them) | Delete folder + revert `responsive-images.ts` |
| `scripts/optimize-images.py` (new) | — | Reproducible generator (Pillow) | n/a |
| `src/components/lazy-video.tsx`, `src/lib/media-prefs.ts` (new) | Videos downloaded eagerly / ignoring preferences | Poster-only until near viewport, then play | If autoplay is blocked, poster stays |
| `src/routes/menu.tsx` | Same | `LazyVideo` + prefs helper | Revert file |
| `src/components/experience-grid.tsx`, `site-header.tsx`, `site-footer.tsx`, `logo-intro-overlay.tsx` | Heavy logos/photos | Variants via `responsiveProps` | Revert files |
| `src/routes/__root.tsx` | Render-blocking fonts | Non-blocking font load | If JS is off, `<noscript>` link loads fonts normally |
| `src/styles.css` | Contrast | `--primary` darkened ~7 % | Brand colour shifts very slightly (terracotta still); revert one line |
| `src/components/site-footer.tsx`, `site-header.tsx`, `index.tsx` | A11y | See audit rows 8–10 | Revert |

No database migrations, schema changes, dependencies, server functions, routes or R2 keys were changed.

**Rollback**: revert the PR (or the individual commits); nothing here is stateful. Redeploy the previous build to roll back production.

## 5. Functionality report

Tested against the local preview (Playwright, mobile 390×844 and desktop 1366×800):

- ✅ Pages return 200 with correct titles and no console errors: `/`, `/menu`, `/reservations`, `/contact`, `/events`, `/gallery`, `/experience`, `/our-story`, `/admin/login`.
- ✅ Homepage hero image uses the WebP `srcset`; fonts apply after load (`media` switched to `all`).
- ✅ Mobile: zero MP4 requests on load; craft video requested only after scrolling to it.
- ✅ Desktop: hero loop still plays. Reduced-motion: zero videos downloaded.
- ✅ Menu loads from local D1; Beverages tab loads the cocktail video.
- ✅ "Take a 1-min tour" modal opens (loads the 9 MB tour only then) and closes with Escape.
- ✅ Reservation form renders (6 fields + submit).
- ✅ `tsc --noEmit` clean; `vite build` succeeds.
- Lighthouse accessibility: 100 on mobile and desktop (automated; screen-reader/keyboard walk-through not performed).

**Not tested** (needs staging with real bindings, secrets and safe test records):
- Submitting a reservation/enquiry end-to-end and the confirmation/notification path.
- Admin login (local D1 lacks the `app_secrets` table that the auth code expects — pre-existing; unrelated to this change), permissions, menu editing, gallery upload/replace, homepage slot assignment, reservations/enquiries management, settings persistence.
- WhatsApp link targets (not modified).
- Production response headers, Cloudflare compression/caching rules.
- `npm run lint`: pre-existing Prettier errors remain in files I did not need to change (`src/lib/site-data.ts`, two spots in `src/routes/index.tsx`); files I added are clean. There is no `test` script in `package.json`.

## 6. Remaining issues and next actions

1. **Mobile still < 90 locally** (78; best 84). LCP ~4.4 s is dominated by simulated slow-4G contention between the hero and other lazy images, and render-blocking CSS (19 KB). Next: re-measure on PSI/preview with Cloudflare compression; consider inlining critical CSS or preloading the hero (only worthwhile if the hero slot is not admin-overridden).
2. **Forced reflow & "legacy JavaScript" from PSI not reproduced** locally. Capture a Chrome Performance trace from the real mobile PSI run before changing code.
3. **Admin-uploaded images are stored and served at original size** (R2 → `/gallery-image/*`). Highest-value follow-up: resize/convert on upload (admin workflow change → needs staging test). Gallery page images still use full-size originals.
4. **Desktop hero loop (564 KB) and the `/gallery` page** were out of scope for byte reductions.
5. **Remaining unused JS (~46 KiB est.)**: no evidence-backed removal identified; left alone.
6. Production cache headers, compression and HTML revalidation need a check with `curl -I` from a machine that can reach the site.
7. Pre-existing Prettier errors (see §5).

## 7. Maintenance checklist

**Monthly — performance/media:** run PSI mobile+desktop on `/`, `/menu`, `/gallery`; compare with this doc's table. After adding photos to `src/assets`, add them to `scripts/optimize-images.py` if shown large on the homepage and run `python3 scripts/optimize-images.py`. Keep hero/LCP image eager + `fetchPriority="high"`; never lazy-load it.

**Per release — accessibility:** Lighthouse/axe on `/`, `/menu`, `/reservations`; tab through nav, drawer and modals; check any new colour against 4.5:1.

**Quarterly — dependencies/security:** `npm audit`, update Radix/TanStack/React in a branch, build + smoke test; review admin roles and who has access.

**Weekly — forms/links/admin:** place a test reservation and enquiry and confirm staff receive them; click WhatsApp and phone links; log in to admin, toggle a menu item's availability and revert.

**Cloudflare:** confirm `/assets/*` immutable caching, HTML not cached, admin responses `no-store`, compression on; purge cache only after deploys that change non-fingerprinted files (`/sw.js`, `/og-image.jpg`).

## 8. Deployment gate

Do not merge to `main` or deploy until: (a) a preview deploy on Cloudflare has been measured in PSI, (b) a staging reservation/enquiry and admin smoke test pass, and (c) the owner approves.

Reference: [Chrome guidance on lazy-loading video and audio](https://developer.chrome.com/docs/modern-web-guidance/guides/performance/lazy-load-video-and-audio).
