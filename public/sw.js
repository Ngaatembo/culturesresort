/* Cultures Resort admin — Web Push service worker.
 * Only handles push + notification clicks; it does no caching. */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const title = data.title || "Cultures Resort";
  const options = {
    body: data.body || "You have a new notification.",
    icon: "/apple-touch-icon.png",
    badge: "/apple-touch-icon.png",
    tag: data.tag || undefined,
    renotify: !!data.tag,
    requireInteraction: data.requireInteraction === true,
    data: { url: data.url || "/admin/orders" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  let path = (event.notification.data && event.notification.data.url) || "/admin/orders";
  if (typeof path !== "string" || !path.startsWith("/admin")) path = "/admin/orders";
  const target = new URL(path, self.location.origin).href;
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of all) {
        if (new URL(c.url).origin === self.location.origin && c.url.includes("/admin")) {
          await c.focus();
          if ("navigate" in c) {
            try {
              await c.navigate(target);
            } catch {
              /* ignore */
            }
          }
          return;
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});
