import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard, StatusDot } from "@/components/admin/ui";
import {
  getMyPushStatus,
  getPushPublicKey,
  registerPushSubscription,
  removePushSubscription,
  sendTestPush,
} from "@/lib/data/push";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function b64url(buf: ArrayBuffer | null): string {
  if (!buf) return "";
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

type Support = "checking" | "supported" | "unsupported" | "ios-needs-install";

/** Enable / disable / test order push notifications for *this* device. */
export function PushSettings() {
  const [support, setSupport] = useState<Support>("checking");
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [enabled, setEnabled] = useState(false);
  const [devices, setDevices] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/i.test(ua);
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    const hasApis =
      "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    if (!hasApis) {
      setSupport(isIos && !standalone ? "ios-needs-install" : "unsupported");
      return;
    }
    setSupport("supported");
    setPermission(Notification.permission);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      const status = await getMyPushStatus({ data: { endpoint: sub?.endpoint ?? null } });
      setDevices(status.devices);
      setEnabled(!!sub && status.thisDevice);
    } catch {
      /* status is informational only */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const enable = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        throw new Error(
          "Notifications are blocked for this site. Allow them in your browser/phone settings, then try again.",
        );
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const { publicKey } = await getPushPublicKey();
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }
      await registerPushSubscription({
        data: {
          endpoint: sub.endpoint,
          p256dh: b64url(sub.getKey("p256dh")),
          auth: b64url(sub.getKey("auth")),
          userAgent: navigator.userAgent,
        },
      });
      setMsg({ tone: "ok", text: "Order notifications are on for this device." });
      await refresh();
    } catch (err) {
      setMsg({
        tone: "warn",
        text: err instanceof Error ? err.message : "Couldn't turn notifications on.",
      });
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription({ data: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }
      setMsg({ tone: "ok", text: "Notifications turned off for this device." });
      await refresh();
    } catch (err) {
      setMsg({
        tone: "warn",
        text: err instanceof Error ? err.message : "Couldn't turn notifications off.",
      });
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await sendTestPush();
      setMsg({ tone: "ok", text: "Test sent — it should appear on your device in a few seconds." });
    } catch (err) {
      setMsg({ tone: "warn", text: err instanceof Error ? err.message : "Test failed." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <SectionCard title="Order notifications on this device">
      <div className="max-w-md space-y-4">
        <p className="text-sm text-muted-foreground">
          Get an instant phone alert when a new order comes in, even when the admin page is closed.
        </p>
        {support === "ios-needs-install" ? (
          <StatusDot tone="warn">
            On iPhone/iPad, first tap Share → “Add to Home Screen”, open Cultures from the Home
            Screen icon, sign in, then come back here.
          </StatusDot>
        ) : support === "unsupported" ? (
          <StatusDot tone="warn">
            This browser doesn&apos;t support push notifications. Try Chrome on Android or a recent
            desktop browser.
          </StatusDot>
        ) : permission === "denied" ? (
          <StatusDot tone="warn">
            Notifications are blocked for this site. Allow them in your browser/phone settings, then
            reload this page.
          </StatusDot>
        ) : null}
        {msg ? <StatusDot tone={msg.tone}>{msg.text}</StatusDot> : null}
        {support === "supported" ? (
          <div className="flex flex-wrap gap-2">
            {enabled ? (
              <>
                <Button type="button" onClick={test} disabled={busy}>
                  <Send className="mr-2 h-4 w-4" /> Send test notification
                </Button>
                <Button type="button" variant="outline" onClick={disable} disabled={busy}>
                  <BellOff className="mr-2 h-4 w-4" /> Turn off
                </Button>
              </>
            ) : (
              <Button type="button" onClick={enable} disabled={busy || permission === "denied"}>
                <Bell className="mr-2 h-4 w-4" /> Enable order notifications
              </Button>
            )}
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {enabled ? "This device is receiving order alerts. " : ""}
          {devices > 0 ? `${devices} device${devices === 1 ? "" : "s"} on your account.` : ""}
        </p>
      </div>
    </SectionCard>
  );
}
