import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { adminSession } from "./session";
import { DUMMY_HASH, hashPassword, verifyPassword } from "./password";
import {
  countAdminUsers,
  createAdminUser,
  deleteAdminUser,
  findAdminByEmail,
  findAdminById,
  listAdminUsers,
  type AdminRole,
} from "./admin-users";

/**
 * Attach to every server function that reads or writes admin/business data.
 * A route `beforeLoad` redirect only protects the page UI — the server
 * function itself is a callable endpoint regardless of which page (if any)
 * calls it, so the check belongs here.
 */
export const authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const session = await adminSession();
  const data = session.data;
  if (!data?.userId) {
    throw new Error("Unauthorized");
  }
  return next({ context: { admin: data } });
});

/**
 * Stacks on top of authMiddleware for the handful of actions that must
 * stay owner-only (managing other admin accounts). Re-checks against the
 * database rather than trusting the session's role, so a role change
 * takes effect immediately rather than only after the next login.
 */
export const ownerOnlyMiddleware = createMiddleware({ type: "function" })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const userId = context.admin?.userId;
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const user = await findAdminById(userId);
    if (!user || user.role !== "owner") {
      throw new Error("Only the owner account can do this.");
    }
    return next();
  });

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await adminSession();
  return session.data?.userId
    ? { email: session.data.email, role: session.data.role, isDeveloper: session.data.isDeveloper }
    : null;
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
    await session.update({
      userId: user.id,
      email: user.email,
      role: user.role,
      isDeveloper: !!user.is_developer,
    });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await adminSession();
  await session.clear();
  return { ok: true as const };
});

/**
 * One-time bootstrap: creates the first admin account, always as 'owner'.
 * Locks itself the moment a single admin_users row exists — after that,
 * this always throws, so it can't be used to add a second/rogue account.
 * Every account after this one goes through /admin/staff instead, which
 * requires being logged in as the owner.
 */
export const adminSetup = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), password: z.string().min(8) }))
  .handler(async ({ data }) => {
    const existing = await countAdminUsers();
    if (existing > 0) {
      throw new Error("Setup has already been completed. Use the login page instead.");
    }
    const { hash, salt } = await hashPassword(data.password);
    await createAdminUser(data.email, hash, salt, "owner");

    const session = await adminSession();
    const user = await findAdminByEmail(data.email);
    await session.update({
      userId: user!.id,
      email: user!.email,
      role: user!.role,
      isDeveloper: !!user!.is_developer,
    });
    return { ok: true as const };
  });

export const adminSetupStatus = createServerFn({ method: "GET" }).handler(async () => {
  const existing = await countAdminUsers();
  return { needsSetup: existing === 0 };
});

/** Owner-only: list every admin account (never returns password data). */
export const listStaff = createServerFn({ method: "GET" })
  .middleware([ownerOnlyMiddleware])
  .handler(async () => listAdminUsers());

const ROLES: AdminRole[] = ["owner", "manager", "kitchen", "staff"];

/** Owner-only: add a new admin account with a chosen role. */
export const createStaffAccount = createServerFn({ method: "POST" })
  .middleware([ownerOnlyMiddleware])
  .validator(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
      role: z.enum(ROLES as [AdminRole, ...AdminRole[]]),
    }),
  )
  .handler(async ({ data }) => {
    const existing = await findAdminByEmail(data.email);
    if (existing) {
      throw new Error("An account with that email already exists.");
    }
    const { hash, salt } = await hashPassword(data.password);
    await createAdminUser(data.email, hash, salt, data.role);
    return { ok: true as const };
  });

/**
 * Owner-only: remove an admin account. Can't remove your own account, and
 * developer accounts can never be removed this way — they're the site's
 * support/maintenance access and stay in place regardless of who is
 * logged in as owner.
 */
export const removeStaffAccount = createServerFn({ method: "POST" })
  .middleware([ownerOnlyMiddleware])
  .validator((data: { id: number }) => data)
  .handler(async ({ data, context }) => {
    if (data.id === context.admin?.userId) {
      throw new Error("You can't remove your own account while logged into it.");
    }
    const target = await findAdminById(data.id);
    if (target?.is_developer) {
      throw new Error("Developer accounts can't be removed here.");
    }
    await deleteAdminUser(data.id);
    return { ok: true as const };
  });
