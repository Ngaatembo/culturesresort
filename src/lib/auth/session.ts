import { useSession } from "@tanstack/react-start/server";
import { getEnvVar } from "@/lib/data/cf";

export type AdminSessionData = {
  userId: number;
  email: string;
};

/**
 * SESSION_SECRET must be set as a Cloudflare Worker secret (Workers & Pages
 * → culturesresort → Settings → Variables and Secrets → Add → type
 * "Secret"), NOT committed to the repo. Read per-request, never at module
 * scope — env is injected fresh for every request on Workers.
 */
function sessionSecret(): string {
  const secret = getEnvVar("SESSION_SECRET");
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET is missing or too short. Set it as a Cloudflare Worker secret (32+ random characters) before admin login can work.",
    );
  }
  return secret;
}

export function adminSession() {
  // Not a React hook — this is TanStack Start's server-only session
  // primitive, which happens to be named like one. It only ever runs
  // inside server functions, never during render.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useSession<AdminSessionData>({
    password: sessionSecret(),
    name: "__Host-cr-admin-session",
    cookie: { secure: true, sameSite: "lax" },
    maxAge: 60 * 60 * 24, // 24 hours — re-login daily
  });
}
