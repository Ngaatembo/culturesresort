import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { getAdminSession } from "@/lib/auth/functions";
import { createStaffAccount, listStaff, removeStaffAccount } from "@/lib/auth/functions";
import type { AdminRole } from "@/lib/auth/admin-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState, LoadingRows, PageHeader, SectionCard, StatusDot } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/staff")({
  component: StaffPage,
});

type StaffRow = {
  id: number;
  email: string;
  role: AdminRole;
  is_developer: number;
  created_at: string;
};

const ROLE_LABELS: Record<AdminRole, string> = {
  owner: "Owner",
  manager: "Manager",
  kitchen: "Kitchen",
  staff: "Staff",
};

function StaffPage() {
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [staff, setStaff] = useState<StaffRow[] | null>(null);
  const [selfId, setSelfId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("staff");
  const [creating, setCreating] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const load = () => {
    setError(null);
    getAdminSession().then((s) => {
      if (!s) return;
      setIsOwner(s.role === "owner");
      if (s.role !== "owner") return;
      listStaff()
        .then((rows) => setStaff(rows))
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Couldn't load staff accounts."),
        );
    });
  };
  useEffect(load, []);

  useEffect(() => {
    // Used only to disable the "remove" button on your own row.
    getAdminSession().then((s) => {
      if (s) {
        listStaff()
          .then((rows) => {
            const self = rows.find((r) => r.email === s.email);
            if (self) setSelfId(self.id);
          })
          .catch(() => {});
      }
    });
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      await createStaffAccount({ data: { email, password, role } });
      setEmail("");
      setPassword("");
      setRole("staff");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create that account.");
    } finally {
      setCreating(false);
    }
  };

  const onRemove = async (id: number) => {
    setRemovingId(id);
    setError(null);
    try {
      await removeStaffAccount({ data: { id } });
      setStaff((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't remove that account.");
    } finally {
      setRemovingId(null);
    }
  };

  if (isOwner === null) {
    return (
      <div className="space-y-6">
        <PageHeader title="Staff & Users" description="Role-based access for the team." />
        <LoadingRows rows={4} />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="space-y-6">
        <PageHeader title="Staff & Users" description="Role-based access for the team." />
        <SectionCard title="Owner access only" className="border-accent/40">
          <StatusDot tone="warn">
            Only the owner account can view or manage staff logins. Ask whoever holds the owner
            account to add or remove access here.
          </StatusDot>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff & Users"
        description="Add or remove logins for the admin dashboard."
      />

      {error ? <ErrorState message={error} onRetry={load} /> : null}

      <SectionCard title="Add an account">
        <form
          onSubmit={onCreate}
          className="grid gap-4 sm:grid-cols-[2fr_2fr_1fr_auto] sm:items-end"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Password (8+ characters)
            </label>
            <Input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Role</label>
            <Select value={role} onValueChange={(v) => setRole(v as AdminRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["owner", "manager", "kitchen", "staff"] as AdminRole[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={creating}>
            {creating ? "Adding…" : "Add account"}
          </Button>
        </form>
      </SectionCard>

      <SectionCard title="Accounts">
        {!staff ? (
          <LoadingRows rows={3} />
        ) : (
          <ul className="divide-y divide-border">
            {staff.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <p className="font-medium text-foreground">{s.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.is_developer ? "Developer" : ROLE_LABELS[s.role]}
                  </p>
                </div>
                {s.id !== selfId && !s.is_developer ? (
                  <button
                    type="button"
                    onClick={() => onRemove(s.id)}
                    disabled={removingId === s.id}
                    aria-label={`Remove ${s.email}`}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {s.id === selfId ? "This is you" : "Protected"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
