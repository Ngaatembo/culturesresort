import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatusDot } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/staff")({
  component: StaffPage,
});

function StaffPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Staff & Users" description="Role-based access for the team." />

      <SectionCard title="Not available yet" className="border-accent/40">
        <StatusDot tone="off">
          The admin area currently has no login or authentication at all — anyone with the /admin
          URL can open it. Real staff roles (Owner, Manager, Kitchen, Staff) need actual
          authentication and server-side permission checks first; building a roles screen without
          that would just be a UI that doesn't actually protect anything. Want me to set up real
          login before this page does anything?
        </StatusDot>
      </SectionCard>
    </div>
  );
}
