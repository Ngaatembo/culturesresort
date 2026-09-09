import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminLogin, adminSetupStatus } from "@/lib/auth/functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    adminSetupStatus()
      .then((s) => setNeedsSetup(s.needsSetup))
      .catch((err) => {
        setNeedsSetup(false);
        setConfigError(
          err instanceof Error
            ? err.message
            : "Can't reach the admin backend. Check that SESSION_SECRET is set in Cloudflare and the admin_users migration has run.",
        );
      });
  }, []);

  useEffect(() => {
    if (needsSetup) navigate({ to: "/admin/setup" });
  }, [needsSetup, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await adminLogin({ data: { email, password } });
      navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  if (needsSetup === null || needsSetup) {
    return null;
  }

  return (
    <div className="admin flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-card">
        <p className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar font-display text-sm text-sidebar-foreground">
          C
        </p>
        <h1 className="mt-4 text-xl font-bold text-foreground">Cultures Resort Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to manage the dashboard.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {configError ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Admin isn't fully set up on the server yet: {configError}
            </p>
          ) : null}
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
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
