import type { ReactNode } from "react";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Formats integer cents as a display price, e.g. 1850 -> "$18.50". */
export function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Formats a D1 `datetime('now')` UTC string ("YYYY-MM-DD HH:MM:SS") for display. */
export function formatDateTime(iso: string) {
  try {
    return new Date(iso.replace(" ", "T") + "Z").toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatTimeAgo(iso: string) {
  try {
    const then = new Date(iso.replace(" ", "T") + "Z").getTime();
    const diffMs = Date.now() - then;
    const mins = Math.round(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
  } catch {
    return iso;
  }
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[28px] font-bold leading-tight text-foreground">{title}</h1>
        {description ? <p className="mt-1.5 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card shadow-card", className)}>
      {title ? (
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string | undefined;
  tone?: "neutral" | "accent" | "success" | "danger";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-3xl font-bold tabular-nums",
          tone === "accent" && "text-accent-foreground",
          tone === "success" && "text-success",
          tone === "danger" && "text-destructive",
          tone === "neutral" && "text-foreground",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="font-semibold text-foreground">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-6 py-10 text-center">
      <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
      <p className="text-sm text-destructive">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-semibold uppercase tracking-wide text-destructive underline underline-offset-4"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function LoadingRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function InlineSpinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {label}
    </span>
  );
}

const STATUS_TONE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  // orders
  pending: "outline",
  preparing: "secondary",
  completed: "default",
  cancelled: "destructive",
  // bookings
  confirmed: "default",
  declined: "destructive",
  // enquiries
  new: "outline",
  read: "secondary",
  responded: "default",
  closed: "outline",
  "no-show": "destructive",
};

export function StatusBadge({ status }: { status: string }) {
  const variant = STATUS_TONE[status] ?? "outline";
  return (
    <Badge
      variant={variant}
      className={cn(
        "capitalize",
        variant === "default" && "bg-success text-success-foreground hover:bg-success/85",
      )}
    >
      {status.replace("-", " ")}
    </Badge>
  );
}

/** Small dot + label used for the system-status strip on Overview. */
export function StatusDot({ tone, children }: { tone: "ok" | "warn" | "off"; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          tone === "ok" && "bg-success",
          tone === "warn" && "bg-accent",
          tone === "off" && "bg-muted-foreground/40",
        )}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}
