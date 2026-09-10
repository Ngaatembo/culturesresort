import { useSession } from "@tanstack/react-start/server";
import { getOrCreateSecret } from "./secret-store";
import type { AdminRole } from "./admin-users";

export type AdminSessionData = {
  userId: number;
  email: string;
  role: AdminRole;
  isDeveloper: boolean;
};

/**
 * The session-signing key is self-provisioned in D1 the first time it's
 * needed (see secret-store.ts) rather than read from a Cloudflare Worker
 * secret — dashboard-added secrets can get wiped out by the next deploy
 * when the GitHub-integration auto-deploy fires, which made login
 * unreliable. The database is the one thing that reliably persists
 * across deploys here.
 */
async function sessionSecret(): Promise<string> {
  return getOrCreateSecret("session_secret", 48);
}

export async function adminSession() {
  // Not a React hook — this is TanStack Start's server-only session
  // primitive, which happens to be named like one. It only ever runs
  // inside server functions, never during render.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useSession<AdminSessionData>({
    password: await sessionSecret(),
    name: "cr_admin_session",
    cookie: { secure: true, sameSite: "lax" },
    maxAge: 60 * 60 * 24, // 24 hours — re-login daily
  });
}
