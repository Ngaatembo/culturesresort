import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { adminSession } from "./session";
import { DUMMY_HASH, hashPassword, verifyPassword } from "./password";
import { countAdminUsers, createAdminUser, findAdminByEmail } from "./admin-users";

/**
 * Attach to every server function that reads or writes admin/business data.
 * A route `beforeLoad` redirect only protects the page UI — the server
 * function itself is a callable endpoint regardless of which page (if any)
 * calls it, so the check belongs here.
 */
export const authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const session = await adminSession();
  if (!session.data?.userId) {
    throw new Error("Unauthorized");
  }
  return next({ context: { admin: session.data } });
});

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await adminSession();
  return session.data?.userId ? { email: session.data.email } : null;
});

export const adminLogin = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const user = await findAdminByEmail(data.email);
    // Always verify against *some* hash, even for an unknown email, so a
    // login attempt for a non-existent account takes the same time as a
    // real wrong-password attempt instead of returning early.
    const target = user ? { hash: user.password_hash, salt: user.password_salt } : DUMMY_HASH;
    const ok = await verifyPassword(data.password, target.hash, target.salt);
    if (!user || !ok) {
      throw new Error("Incorrect email or password.");
    }

    const session = await adminSession();
    await session.update({ userId: user.id, email: user.email });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await adminSession();
  await session.clear();
  return { ok: true as const };
});

/**
 * One-time bootstrap: creates the first (and only, for now) admin account.
 * Locks itself the moment a single admin_users row exists — after that,
 * this always throws, so it can't be used to add a second/rogue account.
 */
export const adminSetup = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), password: z.string().min(8) }))
  .handler(async ({ data }) => {
    const existing = await countAdminUsers();
    if (existing > 0) {
      throw new Error("Setup has already been completed. Use the login page instead.");
    }
    const { hash, salt } = await hashPassword(data.password);
    await createAdminUser(data.email, hash, salt);

    const session = await adminSession();
    const user = await findAdminByEmail(data.email);
    await session.update({ userId: user!.id, email: user!.email });
    return { ok: true as const };
  });

export const adminSetupStatus = createServerFn({ method: "GET" }).handler(async () => {
  const existing = await countAdminUsers();
  return { needsSetup: existing === 0 };
});
