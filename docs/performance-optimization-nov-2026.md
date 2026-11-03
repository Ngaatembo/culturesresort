# Website performance optimization — November 2026

## Baseline evidence

PageSpeed Insights screenshots supplied by WebAura on 3 November 2026 show:

- Mobile performance: 72/100
- Desktop performance: 97–98/100
- Desktop accessibility: 100/100
- Desktop best practices: 100/100
- Desktop SEO: 100/100
- Mobile report flags image delivery (estimated savings about 683 KiB), render-blocking requests, legacy JavaScript, and forced reflow.
- The mobile report also flags unused JavaScript and a large total network payload. One captured diagnostic reported a total payload of about 6,931 KiB.
- The report shows no CrUX field data for the site, so these are Lighthouse lab results rather than a summary of real visitors' experience.

Keep the original screenshots with the project handover as dated baseline evidence. Do not describe these baseline scores as post-optimization results.

## Change in this PR

The homepage now keeps the existing static hero image on mobile instead of mounting and autoplaying the ambient garden video. Desktop retains its existing video treatment. The existing reduced-motion, slow-connection, and data-saver checks remain in place.

This is a targeted first step to avoid competing with critical first-viewport content on phones. It is not a claim that all media payload or accessibility findings have been fixed.

## Validation checklist

After preview deployment, run PageSpeed Insights again on both mobile and desktop, using the same canonical URL and compare:

- Performance scores and Core Web Vitals lab metrics
- Image delivery and total network payload
- Visual appearance of the hero on common phone widths
- Hero call-to-action links (Reservations, Menu, and video tour)
- Reduced-motion and slow-connection behavior
- Reservation, menu, WhatsApp, and admin flows

Record the actual post-change results and screenshots before sharing a before/after claim with the owner. If the mobile score does not improve, inspect the remaining image, video, and render-blocking requests before expanding the change.

## Implementation guidance

Keep the above-the-fold hero image eager/high priority; lazy-load non-critical below-the-fold media only. Avoid lazy-loading the LCP image. Reference: [Chrome guidance on lazy-loading video and audio](https://developer.chrome.com/docs/modern-web-guidance/guides/performance/lazy-load-video-and-audio).
