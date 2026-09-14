import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./cf";
import { managerUpMiddleware, staffUpMiddleware } from "@/lib/auth/functions";
import { sendNotificationEmail } from "./notify";

export type BookingStatus = "pending" | "confirmed" | "declined" | "completed" | "cancelled";

export type CreateBookingInput = {
  eventType: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string | undefined;
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
    const db = getDb();
    const result = await db
      .prepare(
        `INSERT INTO bookings (event_type, guest_name, guest_phone, guest_email, event_date, guests, requirements, message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        data.eventType.trim(),
        data.guestName.trim(),
        data.guestPhone.trim(),
        data.guestEmail?.trim() || null,
        data.eventDate || null,
        data.guests ?? null,
        data.requirements?.trim() || null,
        data.message?.trim() || null,
      )
      .run();

    const bookingId = result.meta.last_row_id;
    if (!bookingId) throw new Error("Could not create the booking.");

    await sendNotificationEmail(
      `New booking enquiry — ${data.eventType}`,
      [
        `${data.guestName} (${data.guestPhone})`,
        data.guestEmail ? `Email: ${data.guestEmail}` : null,
        `Event type: ${data.eventType}`,
        data.eventDate ? `Date: ${data.eventDate}` : null,
        data.guests ? `Guests: ${data.guests}` : null,
        data.requirements ? `Requirements: ${data.requirements}` : null,
        data.message ? `Message: ${data.message}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    );

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

/** All bookings (reservations + event enquiries alike) — owner/manager/staff.
 * Read-only visibility; see updateBookingStatus vs updateReservationStatus
 * below for how the two write paths are actually scoped. */
export const listBookings = createServerFn({ method: "GET" })
  .middleware([staffUpMiddleware])
  .handler(async () => {
    const db = getDb();
    const { results } = await db
      .prepare("SELECT * FROM bookings ORDER BY created_at DESC LIMIT 100")
      .all<BookingRow>();
    return results;
  });

/** The literal event_type value the booking form uses for a table reservation
 * (as opposed to a wedding/birthday/function enquiry). Kept here as the one
 * place both write paths below agree on it. */
export const TABLE_RESERVATION_TYPE = "Table reservation";

/**
 * Owner/manager only — updates the status of ANY booking, reservation or
 * event enquiry alike. Used by the Events & Functions admin page. Staff
 * must use updateReservationStatus below instead, which is scoped to
 * table reservations only.
 */
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

/**
 * Owner/manager/staff — updates a booking's status, but only if that
 * booking is a table reservation. This is what actually enforces "Staff
 * can manage reservations, but not event/function bookings" server-side —
 * the Reservations admin page already only *shows* table reservations, but
 * without this check a staff account could otherwise call
 * updateBookingStatus directly (e.g. via a hand-crafted request) against a
 * wedding enquiry's id and change it. Re-checking the row's own event_type
 * here closes that gap regardless of what the UI does or doesn't show.
 */
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
