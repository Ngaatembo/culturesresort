import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminSession } from "@/lib/auth/functions";
import {
  getSiteSettings,
  updateSiteSetting,
  type ClosureBanner,
  type NotificationPrefs,
} from "@/lib/data/settings";
import { getResendKeyStatus, sendTestNotification, setResendKey } from "@/lib/data/notify";
import { PageHeader, SectionCard, StatusDot } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function ClosureBannerCard() {
  const [banner, setBanner] = useState<ClosureBanner | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSiteSettings().then((s) => setBanner(s.closureBanner));
  }, []);

  const save = async (next: ClosureBanner) => {
    setBanner(next);
    setSaving(true);
    setError(null);
    try {
      await updateSiteSetting({ data: { key: "closureBanner", value: next } });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the banner.");
    } finally {
      setSaving(false);
    }
  };

  if (!banner) return null;

  return (
    <SectionCard title="Closure / holiday banner" className="border-accent/40">
      <p className="text-sm text-muted-foreground">
        Shows a bar across the top of every page — for a public holiday, a private event closing the
        venue, or anything else guests should know before they visit.
      </p>
      <div className="mt-4 space-y-3">
        <Textarea
          value={banner.message}
          onChange={(e) => setBanner({ ...banner, message: e.target.value })}
          placeholder="e.g. Closed Monday 25 December for the public holiday — reopening Tuesday at 10am."
          rows={2}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            disabled={saving}
            onClick={() => save({ ...banner, enabled: true })}
            variant={banner.enabled ? "default" : "outline"}
          >
            {banner.enabled ? "Banner is ON" : "Turn banner on"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={saving || !banner.enabled}
            onClick={() => save({ ...banner, enabled: false })}
          >
            Turn off
          </Button>
          {saved ? <span className="text-sm text-success">Saved ✓</span> : null}
        </div>
      </div>
    </SectionCard>
  );
}

function NotificationsCard() {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [keyStatus, setKeyStatus] = useState<{ isSet: boolean } | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testState, setTestState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    getSiteSettings().then((s) => setPrefs(s.notifications));
    getResendKeyStatus().then(setKeyStatus);
  };
  useEffect(load, []);

  const savePrefs = async (next: NotificationPrefs) => {
    setPrefs(next);
    setSaving(true);
    setError(null);
    try {
      await updateSiteSetting({ data: { key: "notifications", value: next } });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that.");
    } finally {
      setSaving(false);
    }
  };

  const saveKey = async () => {
    if (!apiKeyInput.trim()) return;
    setError(null);
    try {
      await setResendKey({ data: { apiKey: apiKeyInput.trim() } });
      setApiKeyInput("");
      setKeyStatus({ isSet: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that API key.");
    }
  };

  const runTest = async () => {
    setTestState("sending");
    setError(null);
    try {
      await sendTestNotification();
      setTestState("sent");
      setTimeout(() => setTestState("idle"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The test email failed to send.");
      setTestState("idle");
    }
  };

  if (!prefs || !keyStatus) return null;

  return (
    <SectionCard title="Email notifications" className="border-accent/40">
      <p className="text-sm text-muted-foreground">
        Sends an email (via Resend) every time a new booking or enquiry comes in from the website.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="eyebrow text-muted-foreground">Send to</label>
          <Input
            type="email"
            value={prefs.email}
            onChange={(e) => setPrefs({ ...prefs, email: e.target.value })}
            placeholder="you@example.com"
            className="mt-2 max-w-sm"
          />
        </div>

        <div>
          <label className="eyebrow text-muted-foreground">Resend API key</label>
          <p className="mt-1 text-xs text-muted-foreground">
            {keyStatus.isSet
              ? "A key is already saved. Paste a new one below only if you need to replace it."
              : "Not set yet — create a free key at resend.com/api-keys and paste it here."}
          </p>
          <div className="mt-2 flex max-w-sm flex-wrap gap-2">
            <Input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="re_••••••••••••"
              className="min-w-[14rem] flex-1"
            />
            <Button size="sm" variant="outline" onClick={saveKey} disabled={!apiKeyInput.trim()}>
              Save key
            </Button>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <Button
            size="sm"
            disabled={saving}
            onClick={() => savePrefs({ ...prefs, enabled: !prefs.enabled })}
            variant={prefs.enabled ? "default" : "outline"}
          >
            {prefs.enabled ? "Notifications ON" : "Turn notifications on"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={testState === "sending" || !keyStatus.isSet || !prefs.email}
            onClick={runTest}
          >
            {testState === "sending"
              ? "Sending…"
              : testState === "sent"
                ? "Test sent ✓"
                : "Send test email"}
          </Button>
          {saved ? <span className="text-sm text-success">Saved ✓</span> : null}
        </div>
        {!keyStatus.isSet || !prefs.email ? (
          <p className="text-xs text-muted-foreground">
            Add an email address and a Resend API key before turning this on or testing it.
          </p>
        ) : null}
      </div>
    </SectionCard>
  );
}

function SettingsPage() {
  const [isDeveloper, setIsDeveloper] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    getAdminSession().then((s) => {
      if (!s) return;
      setIsDeveloper(!!s.isDeveloper);
      setEmail(s.email ?? null);
      setRole(s.role ?? null);
    });
  }, []);

  if (isDeveloper === null) return null;

  if (!isDeveloper) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" description="Your account details." />
        <SectionCard title="Account">
          <ul className="divide-y divide-border text-sm">
            <li className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">Signed in as</span>
              <span className="font-medium text-foreground">{email}</span>
            </li>
            <li className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium capitalize text-foreground">{role}</span>
            </li>
          </ul>
        </SectionCard>
        <SectionCard title="Need something changed?" className="border-accent/40">
          <StatusDot tone="ok">
            For anything technical — hosting, new features, or account issues — reach out to your
            site admin.
          </StatusDot>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="System information and security status." />

      <SectionCard title="Security">
        <StatusDot tone="ok">
          Login is enabled — only invited staff accounts can access /admin.
        </StatusDot>
      </SectionCard>

      <SectionCard title="System information">
        <ul className="divide-y divide-border text-sm">
          {[
            ["Database", "Cloudflare D1 (binding: DB)"],
            ["Hosting", "Cloudflare Workers, deployed via GitHub"],
            ["Framework", "TanStack Start (React)"],
          ].map(([label, value]) => (
            <li key={label} className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium text-foreground">{value}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <ClosureBannerCard />
      <NotificationsCard />
    </div>
  );
}
