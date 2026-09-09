import { createFileRoute } from "@tanstack/react-router";
import { visitDetails } from "@/lib/site-data";
import { PageHeader, SectionCard, StatusDot } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/visit-details")({
  component: VisitDetailsPage,
});

function VisitDetailsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Visit Details"
        description="These answers show on the menu and events pages. Most are unconfirmed until the restaurant fills them in."
      />

      <SectionCard title="Setup required" className="border-accent/40">
        <StatusDot tone="warn">
          Set in code (src/lib/site-data.ts), not the database — read-only here for now. Tell me the
          change and I'll update it directly.
        </StatusDot>
      </SectionCard>

      <SectionCard title="Current answers">
        <ul className="divide-y divide-border">
          {visitDetails.map((d) => (
            <li
              key={d.label}
              className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-medium text-muted-foreground">{d.label}</span>
              <span className="text-sm font-medium text-foreground sm:text-right">{d.value}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
