import { createFileRoute } from "@tanstack/react-router";
import { business, socialLinks } from "@/lib/site-data";
import { PageHeader, SectionCard, StatusDot } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/contact")({
  component: ContactPage,
});

function ContactPage() {
  const fields: Array<{ label: string; value: string | null; verified: boolean }> = [
    { label: "Phone", value: business.phoneDisplay, verified: true },
    { label: "Email", value: business.email, verified: true },
    { label: "Address", value: business.addressLine, verified: true },
    { label: "Google Maps link", value: business.mapsHref, verified: true },
    { label: "WhatsApp number", value: business.phoneDisplay, verified: true },
    { label: "Facebook", value: socialLinks.facebook, verified: !!socialLinks.facebook },
    { label: "Instagram", value: socialLinks.instagram, verified: !!socialLinks.instagram },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact & Socials"
        description="Verified details are shown below. Nothing here was invented — empty fields mean the restaurant hasn't provided that link."
      />

      <SectionCard title="Setup required" className="border-accent/40">
        <StatusDot tone="warn">
          Set in code (src/lib/site-data.ts), not the database — read-only here for now. Tell me the
          change and I'll update it directly.
        </StatusDot>
      </SectionCard>

      <SectionCard title="Current details">
        <ul className="divide-y divide-border">
          {fields.map((f) => (
            <li
              key={f.label}
              className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {f.label}
                {f.verified ? (
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
                    verified
                  </span>
                ) : null}
              </span>
              <span className="break-all text-sm font-medium text-foreground sm:text-right">
                {f.value ?? "Not provided"}
              </span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
