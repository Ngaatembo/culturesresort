import { getDb } from "@/lib/data/cf";

export type AdminUser = {
  id: number;
  email: string;
  password_hash: string;
  password_salt: string;
};

export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  const db = getDb();
  const row = await db
    .prepare("SELECT * FROM admin_users WHERE email = ?")
    .bind(email.trim().toLowerCase())
    .first<AdminUser>();
  return row ?? null;
}

export async function countAdminUsers(): Promise<number> {
  const db = getDb();
  const row = await db.prepare("SELECT COUNT(*) as n FROM admin_users").first<{ n: number }>();
  return row?.n ?? 0;
}

export async function createAdminUser(email: string, hash: string, salt: string): Promise<void> {
  const db = getDb();
  await db
    .prepare("INSERT INTO admin_users (email, password_hash, password_salt) VALUES (?, ?, ?)")
    .bind(email.trim().toLowerCase(), hash, salt)
    .run();
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
