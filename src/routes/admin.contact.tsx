import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getSiteSettings,
  updateSiteSetting,
  type BusinessInfo,
  type SocialLinks,
} from "@/lib/data/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState, LoadingRows, PageHeader, SectionCard } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/contact")({
  component: ContactPage,
});

type FieldDef = { key: keyof BusinessInfo; label: string };

const BUSINESS_FIELDS: FieldDef[] = [
  { key: "phoneDisplay", label: "Phone (displayed)" },
  { key: "phoneHref", label: "Phone link (tel:...)" },
  { key: "whatsappNumber", label: "WhatsApp number (digits only, e.g. 263...)" },
  { key: "email", label: "Email" },
  { key: "emailAlt", label: "Alternate email" },
  { key: "addressLine", label: "Address (full)" },
  { key: "addressShort", label: "Address (short)" },
  { key: "mapsHref", label: "Google Maps link" },
  { key: "tripadvisorHref", label: "TripAdvisor link" },
];

function ContactPage() {
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinks | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<"business" | "social" | null>(null);
  const [saved, setSaved] = useState<"business" | "social" | null>(null);

  const load = () => {
    setError(null);
    getSiteSettings()
      .then((s) => {
        setBusiness(s.business);
        setSocialLinks(s.socialLinks);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Couldn't load contact details."),
      );
  };
  useEffect(load, []);

  const saveBusiness = async () => {
    if (!business) return;
    setSaving("business");
    setError(null);
    try {
      await updateSiteSetting({ data: { key: "business", value: business } });
      setSaved("business");
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save contact details.");
    } finally {
      setSaving(null);
    }
  };

  const saveSocial = async () => {
    if (!socialLinks) return;
    setSaving("social");
    setError(null);
    try {
      await updateSiteSetting({ data: { key: "socialLinks", value: socialLinks } });
      setSaved("social");
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save social links.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact & Socials"
        description="Changes here go live immediately across the site — header, footer, contact page and event pages all read from this."
      />

      {error ? <ErrorState message={error} onRetry={load} /> : null}

      {!business || !socialLinks ? (
        <LoadingRows rows={6} />
      ) : (
        <>
          <SectionCard title="Business details">
            <div className="grid gap-4 sm:grid-cols-2">
              {BUSINESS_FIELDS.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                  <Input
                    value={business[f.key]}
                    onChange={(e) =>
                      setBusiness((b) => (b ? { ...b, [f.key]: e.target.value } : b))
                    }
                  />
                </div>
              ))}
            </div>
            <div className="mt-5">
              <Button onClick={saveBusiness} disabled={saving === "business"}>
                {saving === "business"
                  ? "Saving…"
                  : saved === "business"
                    ? "Saved ✓"
                    : "Save changes"}
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            title="Social links"
            description="Leave blank until there's a real, confirmed URL — an empty field hides that button on the site rather than showing a broken one."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Facebook</label>
                <Input
                  value={socialLinks.facebook ?? ""}
                  onChange={(e) =>
                    setSocialLinks((s) => (s ? { ...s, facebook: e.target.value || null } : s))
                  }
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Instagram</label>
                <Input
                  value={socialLinks.instagram ?? ""}
                  onChange={(e) =>
                    setSocialLinks((s) => (s ? { ...s, instagram: e.target.value || null } : s))
                  }
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">TikTok</label>
                <Input
                  value={socialLinks.tiktok ?? ""}
                  onChange={(e) =>
                    setSocialLinks((s) => (s ? { ...s, tiktok: e.target.value || null } : s))
                  }
                  placeholder="https://www.tiktok.com/@..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">X (Twitter)</label>
                <Input
                  value={socialLinks.x ?? ""}
                  onChange={(e) =>
                    setSocialLinks((s) => (s ? { ...s, x: e.target.value || null } : s))
                  }
                  placeholder="https://x.com/..."
                />
              </div>
            </div>
            <div className="mt-5">
              <Button onClick={saveSocial} disabled={saving === "social"}>
                {saving === "social" ? "Saving…" : saved === "social" ? "Saved ✓" : "Save changes"}
              </Button>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}
