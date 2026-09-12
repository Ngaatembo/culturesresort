import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./cf";
import { authMiddleware } from "@/lib/auth/functions";
import { sendNotificationEmail } from "./notify";

export type EnquiryStatus = "new" | "read" | "responded" | "closed";

export type CreateEnquiryInput = {
  name: string;
  phone?: string | undefined;
  email?: string | undefined;
  message: string;
};

export const createEnquiry = createServerFn({ method: "POST" })
  .validator((data: CreateEnquiryInput) => data)
  .handler(async ({ data }) => {
    if (!data.name?.trim() || !data.message?.trim()) {
      throw new Error("Name and message are required.");
    }
    const db = getDb();
    const result = await db
      .prepare("INSERT INTO enquiries (name, phone, email, message) VALUES (?, ?, ?, ?)")
      .bind(
        data.name.trim(),
        data.phone?.trim() || null,
        data.email?.trim() || null,
        data.message.trim(),
      )
      .run();

    const enquiryId = result.meta.last_row_id;
    if (!enquiryId) throw new Error("Could not save the enquiry.");

    await sendNotificationEmail(
      "New enquiry",
      [
        `${data.name}`,
        data.phone ? `Phone: ${data.phone}` : null,
        data.email ? `Email: ${data.email}` : null,
        `Message: ${data.message}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );

    return { enquiryId };
  });

export type EnquiryRow = {
  id: number;
  status: EnquiryStatus;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  created_at: string;
};

export const listEnquiries = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const db = getDb();
    const { results } = await db
      .prepare("SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 100")
      .all<EnquiryRow>();
    return results;
  });

export const updateEnquiryStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: number; status: EnquiryStatus }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    await db
      .prepare("UPDATE enquiries SET status = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(data.status, data.id)
      .run();
    return { ok: true };
  });
