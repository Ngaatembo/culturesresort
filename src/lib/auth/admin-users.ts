import { getDb } from "@/lib/data/cf";

export type AdminRole = "owner" | "manager" | "kitchen" | "staff";

export type AdminUser = {
  id: number;
  email: string;
  password_hash: string;
  password_salt: string;
  role: AdminRole;
  created_at: string;
};

export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  const db = getDb();
  const row = await db
    .prepare("SELECT * FROM admin_users WHERE email = ?")
    .bind(email.trim().toLowerCase())
    .first<AdminUser>();
  return row ?? null;
}

export async function findAdminById(id: number): Promise<AdminUser | null> {
  const db = getDb();
  const row = await db
    .prepare("SELECT * FROM admin_users WHERE id = ?")
    .bind(id)
    .first<AdminUser>();
  return row ?? null;
}

export async function countAdminUsers(): Promise<number> {
  const db = getDb();
  const row = await db.prepare("SELECT COUNT(*) as n FROM admin_users").first<{ n: number }>();
  return row?.n ?? 0;
}

export async function listAdminUsers(): Promise<
  Omit<AdminUser, "password_hash" | "password_salt">[]
> {
  const db = getDb();
  const { results } = await db
    .prepare("SELECT id, email, role, created_at FROM admin_users ORDER BY created_at ASC")
    .all<Omit<AdminUser, "password_hash" | "password_salt">>();
  return results;
}

export async function createAdminUser(
  email: string,
  hash: string,
  salt: string,
  role: AdminRole,
): Promise<void> {
  const db = getDb();
  await db
    .prepare(
      "INSERT INTO admin_users (email, password_hash, password_salt, role) VALUES (?, ?, ?, ?)",
    )
    .bind(email.trim().toLowerCase(), hash, salt, role)
    .run();
}

export async function deleteAdminUser(id: number): Promise<void> {
  const db = getDb();
  await db.prepare("DELETE FROM admin_users WHERE id = ?").bind(id).run();
}

export async function updateAdminPassword(id: number, hash: string, salt: string): Promise<void> {
  const db = getDb();
  await db
    .prepare(
      "UPDATE admin_users SET password_hash = ?, password_salt = ?, updated_at = datetime('now') WHERE id = ?",
    )
    .bind(hash, salt, id)
    .run();
}
