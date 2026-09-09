import { createFileRoute } from "@tanstack/react-router";
import { openingHours } from "@/lib/site-data";
import { PageHeader, SectionCard, StatusDot } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/hours")({
  component: HoursPage,
});

function HoursPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Opening Hours"
        description="These hours appear on the contact page and in the footer."
      />

      <SectionCard title="Setup required" className="border-accent/40">
        <StatusDot tone="warn">
          Hours are currently set in code (src/lib/site-data.ts), not the database, so this page is
          read-only for now. Tell me the change and I'll update it directly, or ask and I can wire
          this to a real settings table so it's editable here.
        </StatusDot>
      </SectionCard>

      <SectionCard title="Current hours">
        <ul className="divide-y divide-border">
          {openingHours.map((h) => (
            <li key={h.day} className="flex items-center justify-between py-3.5">
              <span className="font-medium text-foreground">{h.day}</span>
              <span className="text-sm text-muted-foreground">{h.hours}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
