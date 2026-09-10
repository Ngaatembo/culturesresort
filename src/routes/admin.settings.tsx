import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminSession } from "@/lib/auth/functions";
import { PageHeader, SectionCard, StatusDot } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    getAdminSession().then((s) => {
      if (!s) return;
      setIsOwner(s.role === "owner");
      setEmail(s.email ?? null);
    });
  }, []);

  if (isOwner === null) return null;

  if (!isOwner) {
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
              <span className="font-medium text-foreground">Manager</span>
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

      <SectionCard title="Business, notifications & appearance" className="border-accent/40">
        <StatusDot tone="warn">
          Not built yet — there's nothing behind these settings to configure until they're actually
          needed. Ask if you'd like any of these added.
        </StatusDot>
      </SectionCard>
    </div>
  );
}
