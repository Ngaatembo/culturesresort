import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatusDot } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="System information and security status." />

      <SectionCard title="Security" className="border-destructive/30">
        <StatusDot tone="off">
          No login is configured — /admin is currently open to anyone with the URL. This needs real
          authentication before the business relies on this dashboard day to day.
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
