import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSiteSettings, updateSiteSetting, type VisitDetail } from "@/lib/data/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState, LoadingRows, PageHeader, SectionCard } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/visit-details")({
  component: VisitDetailsPage,
});

function VisitDetailsPage() {
  const [details, setDetails] = useState<VisitDetail[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = () => {
    setError(null);
    getSiteSettings()
      .then((s) => setDetails(s.visitDetails))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Couldn't load visit details."),
      );
  };
  useEffect(load, []);

  const setValue = (label: string, value: string) => {
    setDetails((prev) =>
      prev ? prev.map((d) => (d.label === label ? { ...d, value } : d)) : prev,
    );
    setSaved(false);
  };

  const save = async () => {
    if (!details) return;
    setSaving(true);
    setError(null);
    try {
      await updateSiteSetting({ data: { key: "visitDetails", value: details } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save visit details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visit Details"
        description="These answers show on the menu and events pages — changes here go live immediately."
      />

      {error ? <ErrorState message={error} onRetry={load} /> : null}

      {!details ? (
        <LoadingRows rows={7} />
      ) : (
        <SectionCard>
          <ul className="divide-y divide-border">
            {details.map((d) => (
              <li
                key={d.label}
                className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-medium text-muted-foreground">{d.label}</span>
                <Input
                  value={d.value}
                  onChange={(e) => setValue(d.label, e.target.value)}
                  className="sm:max-w-xs sm:text-right"
                  aria-label={d.label}
                />
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
            </Button>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
