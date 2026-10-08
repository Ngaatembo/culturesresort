# Order push notifications (Web Push)

New customer orders send an instant phone/desktop notification to every active admin device that has enabled notifications — even when the dashboard is closed. Cost: $0 (native Web Push, no third-party service). Email via Resend still runs as a backup.

## What was added
- `migrations/0017_push_subscriptions.sql` — `push_subscriptions` table (one row per device; many devices per admin; removed automatically if the admin is deleted).
- `src/lib/push/webpush.ts` — Workers-compatible Web Push + VAPID (WebCrypto only, no dependencies).
- `src/lib/data/push.ts` — server functions (register / remove / status / test) and `notifyAdminsOfNewOrder`.
- `src/lib/data/orders.ts` — `placeOrder` triggers push **after** the order and its items are saved; push + email run independently and cannot fail the order.
- `public/sw.js` — service worker: shows the notification, opens `/admin/orders` on tap.
- `src/components/admin/push-settings.tsx` + `/admin/account` — enable / test / turn-off UI.

## Secrets
None to configure. VAPID keys are generated automatically on first use and stored in `app_secrets` (same convention as the session secret, so they survive redeploys). The private key never leaves the server; only the public key is sent to browsers. **Do not delete the `vapid_keys` row** — doing so invalidates every registered device (they would need to re-enable).

## Recipients
Active subscriptions belonging to admins with role owner, manager, staff or kitchen (`ORDER_PUSH_ROLES` in `src/lib/data/push.ts`). Remove a role there to exclude it. Nobody is hardcoded.

## Deploy
1. Apply the migration to the production D1 database (command below).
2. Deploy / merge the branch.
3. Each admin: sign in → My Account → **Enable order notifications** → allow → **Send test notification**.

```
npx wrangler d1 execute culturesresort --remote --file migrations/0017_push_subscriptions.sql
```

## Limitations
- **iPhone/iPad:** works only on iOS 16.4+ and only after Share → *Add to Home Screen*, then opening the site from that icon.
- **Android/desktop Chrome, Edge, Firefox:** works in the browser; OS-level notification permission and battery-saver/“do not disturb” settings can still suppress alerts.
- If permission is denied the UI says so; re-allow it in browser/phone site settings.
- Dead subscriptions (404/410 from the push service) are deleted automatically; transient failures disable a device after 10 in a row.
- Notification text contains only the order number — no customer details.
