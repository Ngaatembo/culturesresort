import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./cf";
import { staffUpMiddleware } from "@/lib/auth/functions";
import { sendNotificationEmail } from "./notify";
import { notifyAdminsOfEnquiry } from "./push";

export type EnquiryStatus = "new" | "read" | "responded" | "closed";

export type CreateEnquiryInput = {
  name: string;
  phone?: string | undefined;
  message: string;
};

export const createEnquiry = createServerFn({ method: "POST" })
  .validator((data: CreateEnquiryInput) => data)
  .handler(async ({ data }) => {
    if (!data.name?.trim() || !data.message?.trim()) {
      throw new Error("Name and message are required.");
    }
    if (data.name.length > 100 || (data.phone?.length ?? 0) > 30 || data.message.length > 1500) {
      throw new Error("Some details are too long. Please shorten them and try again.");
    }
    const db = getDb();
    const result = await db
      .prepare("INSERT INTO enquiries (name, phone, message) VALUES (?, ?, ?)")
      .bind(data.name.trim(), data.phone?.trim() || null, data.message.trim())
      .run();

    const enquiryId = result.meta.last_row_id;
    if (!enquiryId) throw new Error("Could not save the enquiry.");

    const pushPromise = notifyAdminsOfEnquiry(enquiryId, data.name.trim(), data.message.trim());
    const emailPromise = sendNotificationEmail(
      "New enquiry",
      [`${data.name}`, data.phone ? `Phone: ${data.phone}` : null, `Message: ${data.message}`]
        .filter(Boolean)
        .join("\n"),
    );
    await Promise.allSettled([pushPromise, emailPromise]);

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
  .middleware([staffUpMiddleware])
  .handler(async () => {
    const db = getDb();
    const { results } = await db
      .prepare("SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 100")
      .all<EnquiryRow>();
    return results;
  });

export const updateEnquiryStatus = createServerFn({ method: "POST" })
  .middleware([staffUpMiddleware])
  .validator((data: { id: number; status: EnquiryStatus }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    await db
      .prepare("UPDATE enquiries SET status = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(data.status, data.id)
      .run();
    return { ok: true };
  });
