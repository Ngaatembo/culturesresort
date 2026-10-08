import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./cf";
import { managerUpMiddleware, staffUpMiddleware } from "@/lib/auth/functions";
import { sendNotificationEmail } from "./notify";
import { notifyAdminsOfBooking } from "./push";

export type BookingStatus = "pending" | "confirmed" | "declined" | "completed" | "cancelled";

export type CreateBookingInput = {
  eventType: string;
  guestName: string;
  guestPhone: string;
  eventDate?: string | undefined;
  guests?: number | undefined;
  requirements?: string | undefined;
  message?: string | undefined;
};

export const createBooking = createServerFn({ method: "POST" })
  .validator((data: CreateBookingInput) => data)
  .handler(async ({ data }) => {
    if (!data.eventType?.trim() || !data.guestName?.trim() || !data.guestPhone?.trim()) {
      throw new Error("Event type, name and phone are required.");
    }
    if (
      data.guestName.length > 100 ||
      data.guestPhone.length > 30 ||
      data.eventType.length > 100 ||
      (data.requirements?.length ?? 0) > 500 ||
      (data.message?.length ?? 0) > 1000 ||
      (data.eventDate?.length ?? 0) > 20 ||
      (data.guests !== undefined &&
        (!Number.isFinite(data.guests) || data.guests < 1 || data.guests > 1000))
    ) {
      throw new Error(
        "Some details are too long or out of range. Please shorten them and try again.",
      );
    }
    const db = getDb();
    const eventType = data.eventType.trim();
    const guestName = data.guestName.trim();
    const result = await db
      .prepare(
        `INSERT INTO bookings (event_type, guest_name, guest_phone, event_date, guests, requirements, message)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        eventType,
        guestName,
        data.guestPhone.trim(),
        data.eventDate || null,
        data.guests ?? null,
        data.requirements?.trim() || null,
        data.message?.trim() || null,
      )
      .run();

    const bookingId = result.meta.last_row_id;
    if (!bookingId) throw new Error("Could not create the booking.");

    const pushPromise = notifyAdminsOfBooking(
      bookingId,
      eventType,
      guestName,
      data.eventDate,
      data.guests,
    );
    const emailPromise = sendNotificationEmail(
      `New booking enquiry — ${eventType}`,
      [
        `${data.guestName} (${data.guestPhone})`,
        `Event type: ${eventType}`,
        data.eventDate ? `Date: ${data.eventDate}` : null,
        data.guests ? `Guests: ${data.guests}` : null,
        data.requirements ? `Requirements: ${data.requirements}` : null,
        data.message ? `Message: ${data.message}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    await Promise.allSettled([pushPromise, emailPromise]);

    return { bookingId };
  });

export type BookingRow = {
  id: number;
  status: BookingStatus;
  event_type: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  event_date: string | null;
  guests: number | null;
  requirements: string | null;
  message: string | null;
  created_at: string;
};

export const listBookings = createServerFn({ method: "GET" })
  .middleware([staffUpMiddleware])
  .handler(async () => {
    const db = getDb();
    const { results } = await db
      .prepare("SELECT * FROM bookings ORDER BY created_at DESC LIMIT 100")
      .all<BookingRow>();
    return results;
  });

export const TABLE_RESERVATION_TYPE = "Table reservation";

export const updateBookingStatus = createServerFn({ method: "POST" })
  .middleware([managerUpMiddleware])
  .validator((data: { id: number; status: BookingStatus }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    await db
      .prepare("UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(data.status, data.id)
      .run();
    return { ok: true };
  });

export const updateReservationStatus = createServerFn({ method: "POST" })
  .middleware([staffUpMiddleware])
  .validator((data: { id: number; status: BookingStatus }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    const target = await db
      .prepare("SELECT event_type FROM bookings WHERE id = ?")
      .bind(data.id)
      .first<{ event_type: string }>();
    if (!target || target.event_type !== TABLE_RESERVATION_TYPE) {
      throw new Error("This isn't a table reservation — use the Events & Functions page instead.");
    }
    await db
      .prepare("UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(data.status, data.id)
      .run();
    return { ok: true };
  });
