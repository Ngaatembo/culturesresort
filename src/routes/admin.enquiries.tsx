import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, Search } from "lucide-react";
import {
  listEnquiries,
  updateEnquiryStatus,
  type EnquiryRow,
  type EnquiryStatus,
} from "@/lib/data/enquiries";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmptyState,
  ErrorState,
  formatDateTime,
  LoadingRows,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/enquiries")({
  component: EnquiriesPage,
});

const STATUSES: EnquiryStatus[] = ["new", "read", "responded", "closed"];

function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | "all">("all");

  const load = () => {
    setError(null);
    listEnquiries()
      .then(setEnquiries)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load enquiries."));
  };
  useEffect(load, []);

  const setStatus = async (id: number, status: EnquiryStatus) => {
    setEnquiries((prev) => (prev ? prev.map((e) => (e.id === id ? { ...e, status } : e)) : prev));
    try {
      await updateEnquiryStatus({ data: { id, status } });
    } catch {
      load();
    }
  };

  const filtered = useMemo(() => {
    if (!enquiries) return null;
    const q = query.trim().toLowerCase();
    return enquiries.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (!q) return true;
      return e.name.toLowerCase().includes(q) || e.message.toLowerCase().includes(q);
    });
  }, [enquiries, query, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enquiries"
        description="Messages from the contact form. Guest details stay private."
      />

      <SectionCard>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or message"
              className="pl-9"
              aria-label="Search enquiries"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as EnquiryStatus | "all")}
          >
            <SelectTrigger className="w-full sm:w-48" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !filtered ? (
          <LoadingRows rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={enquiries?.length ? "No enquiries match" : "No enquiries yet"}
            description={
              enquiries?.length
                ? "Try a different search or status filter."
                : "The contact form saves messages directly here."
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((e) => (
              <li
                key={e.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{e.name}</p>
                    <StatusBadge status={e.status} />
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(e.created_at)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{e.message}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    {e.phone ? (
                      <a
                        href={`tel:${e.phone}`}
                        className="inline-flex items-center gap-1 font-medium text-accent-foreground hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {e.phone}
                      </a>
                    ) : null}
                    {e.email ? (
                      <a
                        href={`mailto:${e.email}`}
                        className="inline-flex items-center gap-1 font-medium text-accent-foreground hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" aria-hidden="true" /> {e.email}
                      </a>
                    ) : null}
                  </div>
                </div>
                <Select value={e.status} onValueChange={(v) => setStatus(e.id, v as EnquiryStatus)}>
                  <SelectTrigger className="w-full sm:w-36" aria-label={`Status for ${e.name}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
