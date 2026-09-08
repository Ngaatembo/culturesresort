import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./cf";

export type BookingStatus = "pending" | "confirmed" | "declined" | "completed" | "cancelled";

export type CreateBookingInput = {
  eventType: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  eventDate?: string;
  guests?: number;
  requirements?: string;
  message?: string;
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

export const listBookings = createServerFn({ method: "GET" }).handler(async () => {
  const db = getDb();
  const { results } = await db
    .prepare("SELECT * FROM bookings ORDER BY created_at DESC LIMIT 100")
    .all<BookingRow>();
  return results;
});

export const updateBookingStatus = createServerFn({ method: "POST" })
  .validator((data: { id: number; status: BookingStatus }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    await db
      .prepare("UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(data.status, data.id)
      .run();
    return { ok: true };
  });
