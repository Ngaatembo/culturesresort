import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSiteSettings, updateSiteSetting, type OpeningHour } from "@/lib/data/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState, LoadingRows, PageHeader, SectionCard } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/hours")({
  component: HoursPage,
});

function HoursPage() {
  const [hours, setHours] = useState<OpeningHour[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = () => {
    setError(null);
    getSiteSettings()
      .then((s) => setHours(s.openingHours))
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load hours."));
  };
  useEffect(load, []);

  const setHour = (day: string, value: string) => {
    setHours((prev) =>
      prev ? prev.map((h) => (h.day === day ? { ...h, hours: value } : h)) : prev,
    );
    setSaved(false);
  };

  const save = async () => {
    if (!hours) return;
    setSaving(true);
    setError(null);
    try {
      await updateSiteSetting({ data: { key: "openingHours", value: hours } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save hours.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opening Hours"
        description="These hours appear on the contact page and in the footer — changes here go live immediately."
      />

      {error ? <ErrorState message={error} onRetry={load} /> : null}

      {!hours ? (
        <LoadingRows rows={7} />
      ) : (
        <SectionCard>
          <ul className="divide-y divide-border">
            {hours.map((h) => (
              <li key={h.day} className="flex items-center justify-between gap-4 py-3.5">
                <span className="font-medium text-foreground">{h.day}</span>
                <Input
                  value={h.hours}
                  onChange={(e) => setHour(h.day, e.target.value)}
                  className="max-w-[220px] text-right"
                  aria-label={`${h.day} hours`}
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
