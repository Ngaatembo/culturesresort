import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminSetup, adminSetupStatus } from "@/lib/auth/functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoMark from "@/assets/logo-mark.png";

export const Route = createFileRoute("/admin/setup")({
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState<boolean | null>(null);

  useEffect(() => {
    adminSetupStatus()
      .then((s) => setLocked(!s.needsSetup))
      .catch(() => setLocked(false));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await adminSetup({ data: { email, password } });
      navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't complete setup.");
    } finally {
      setSubmitting(false);
    }
  };

  if (locked === null) return null;

  if (locked) {
    return (
      <div className="admin flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <img
            src={logoMark}
            alt="Cultures Resort"
            className="mx-auto h-14 w-14 rounded-full object-cover"
          />
          <h1 className="mt-4 text-lg font-bold text-foreground">Setup already completed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            An admin account already exists. Head to the login page instead.
          </p>
          <Button className="mt-6 w-full" onClick={() => navigate({ to: "/admin/login" })}>
            Go to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-card">
        <img src={logoMark} alt="Cultures Resort" className="h-14 w-14 rounded-full object-cover" />
        <h1 className="mt-4 text-xl font-bold text-foreground">Set up admin access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This runs once. Choose the email and password you'll use to log in — nobody else sees
          this, and this page locks itself the moment it's used.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password (8+ characters)
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirm" className="text-sm font-medium text-foreground">
              Confirm password
            </label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating account…" : "Create admin account"}
          </Button>
        </form>
      </div>
    </div>
  );
}
