import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { adminSession } from "./session";
import { DUMMY_HASH, hashPassword, verifyPassword } from "./password";
import { logAdminActivity } from "@/lib/data/activity-log-write";
import {
  countAdminUsers,
  createAdminUser,
  deleteAdminUser,
  findAdminByEmail,
  findAdminById,
  listAdminUsers,
  updateAdminPassword,
  updateAdminRole,
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
 * Role-gates a server function to a specific set of roles. Stacks on top of
 * authMiddleware and — critically — re-checks the role against the
 * database rather than trusting the session's copy of it, so a role change
 * (or a removed account) takes effect on the very next request instead of
 * only after the affected user's next login. This is the actual security
 * boundary: it runs no matter how the function is invoked (normal page
 * navigation, a hand-crafted fetch to the server-fn endpoint, a stale
 * client bundle, tampered localStorage, whatever), so a lower-privilege
 * role can never reach it just by calling it directly.
 */
export function requireRole(...roles: AdminRole[]) {
  return createMiddleware({ type: "function" })
    .middleware([authMiddleware])
    .server(async ({ next, context }) => {
      const userId = context.admin?.userId;
      if (!userId) {
        throw new Error("Unauthorized");
      }
      const user = await findAdminById(userId);
      if (!user || !roles.includes(user.role)) {
        throw new Error("You don't have permission to do this.");
      }
      // Refresh the role/email into context from the DB copy, in case the
      // session is stale (e.g. an owner just changed this user's role).
      return next({
        context: { admin: { ...context.admin, role: user.role, email: user.email } },
      });
    });
}

/** Owner, manager, staff or kitchen — anyone with an admin login at all. */
export const anyAdminMiddleware = requireRole("owner", "manager", "staff", "kitchen");
/** Owner + manager — day-to-day operational and content management. */
export const managerUpMiddleware = requireRole("owner", "manager");
/** Owner + manager + staff — front-of-house operational access. */
export const staffUpMiddleware = requireRole("owner", "manager", "staff");
/** Owner + manager + kitchen — anything the kitchen queue itself needs. */
export const kitchenUpMiddleware = requireRole("owner", "manager", "kitchen");
/** Owner + manager + staff + kitchen — read access to shared order data. */
export const ordersViewMiddleware = requireRole("owner", "manager", "staff", "kitchen");
/**
 * Owner-only: managing other admin accounts, business settings, system
 * configuration. Kept as its own named export (rather than inlining
 * requireRole("owner") everywhere) so call sites read as intent, not just
 * a role list.
 */
export const ownerOnlyMiddleware = requireRole("owner");

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
 * Any logged-in admin (owner/manager/staff/kitchen) can change their own
 * password. Scoped to `context.admin.userId` from the session — there's no
 * "which account" parameter — so this can never be used to touch anyone
 * else's password regardless of role.
 */
export const changeOwnPassword = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { currentPassword: string; newPassword: string }) => data)
  .handler(async ({ data, context }) => {
    const userId = context.admin?.userId;
    if (!userId) {
      throw new Error("Unauthorized");
    }
    if (data.newPassword.length < 4) {
      throw new Error("New password must be at least 4 characters.");
    }
    const user = await findAdminById(userId);
    if (!user) {
      throw new Error("Your account could not be found.");
    }
    const ok = await verifyPassword(data.currentPassword, user.password_hash, user.password_salt);
    if (!ok) {
      throw new Error("Current password is incorrect.");
    }
    const { hash, salt } = await hashPassword(data.newPassword);
    await updateAdminPassword(userId, hash, salt);
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
  .validator(z.object({ email: z.string().email(), password: z.string().min(4) }))
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
      password: z.string().min(4),
      role: z.enum(ROLES as [AdminRole, ...AdminRole[]]),
    }),
  )
  .handler(async ({ data, context }) => {
    const existing = await findAdminByEmail(data.email);
    if (existing) {
      throw new Error("An account with that email already exists.");
    }
    const { hash, salt } = await hashPassword(data.password);
    await createAdminUser(data.email, hash, salt, data.role);
    if (context.admin) {
      await logAdminActivity(
        { email: context.admin.email, role: context.admin.role },
        "Created staff account",
        `${data.email} — ${data.role}`,
      );
    }
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
    if (context.admin && target) {
      await logAdminActivity(
        { email: context.admin.email, role: context.admin.role },
        "Removed staff account",
        target.email,
      );
    }
    return { ok: true as const };
  });

/**
 * Owner-only: change an existing admin account's role. Can't change your
 * own role (an owner locking themselves out, or a rogue session downgrading
 * itself to dodge audit, are both nonsensical) and developer accounts are
 * exempt, same as removal.
 */
export const updateStaffRole = createServerFn({ method: "POST" })
  .middleware([ownerOnlyMiddleware])
  .validator((data: { id: number; role: AdminRole }) => data)
  .handler(async ({ data, context }) => {
    if (data.id === context.admin?.userId) {
      throw new Error("You can't change your own role while logged into it.");
    }
    const target = await findAdminById(data.id);
    if (!target) {
      throw new Error("That account no longer exists.");
    }
    if (target.is_developer) {
      throw new Error("Developer accounts can't be reassigned here.");
    }
    await updateAdminRole(data.id, data.role);
    if (context.admin) {
      await logAdminActivity(
        { email: context.admin.email, role: context.admin.role },
        "Changed staff role",
        `${target.email}: ${target.role} → ${data.role}`,
      );
    }
    return { ok: true as const };
  });
