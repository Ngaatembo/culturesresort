import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { changeOwnPassword, getAdminSession } from "@/lib/auth/functions";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { PageHeader, SectionCard, StatusDot } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/account")({
  component: AccountPage,
});

function AccountPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAdminSession().then((s) => {
      setEmail(s?.email ?? null);
      setRole(s?.role ?? null);
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("New passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await changeOwnPassword({ data: { currentPassword, newPassword } });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't change your password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Account" description="Your login details for the admin panel." />

      <SectionCard title="Signed in as">
        <p className="text-sm font-medium text-foreground">{email ?? "…"}</p>
        <p className="text-xs text-muted-foreground">
          {role ? ROLE_LABELS[role as keyof typeof ROLE_LABELS] : "…"}
        </p>
      </SectionCard>

      <SectionCard title="Change password">
        <form onSubmit={onSubmit} className="max-w-sm space-y-4">
          {error ? (
            <StatusDot tone="warn">{error}</StatusDot>
          ) : success ? (
            <StatusDot tone="ok">Password updated.</StatusDot>
          ) : null}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Current password</label>
            <PasswordInput
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              New password (8+ characters)
            </label>
            <PasswordInput
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Confirm new password
            </label>
            <PasswordInput
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Updating…" : "Update password"}
          </Button>
        </form>
      </SectionCard>
    </div>
  );
}
