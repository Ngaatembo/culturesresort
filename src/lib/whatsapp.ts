/**
 * Builds a wa.me link to a CUSTOMER's own phone number, pre-filled with a
 * status update — the "how does staff tell the client their order is being
 * made" answer for a site with no in-app chat. This is a one-tap manual
 * send (staff reviews/edits the message in WhatsApp before it goes out),
 * not an automated pipeline: a real automated send would need a WhatsApp
 * Business API / Twilio-style integration with its own account and
 * per-message cost, which isn't set up here. This reuses the same wa.me
 * pattern already used on the public site (see lib/site-data.ts's
 * `whatsappLink`, which does the same thing in the other direction — a
 * guest messaging the restaurant).
 */
export function customerWhatsAppLink(phone: string, message: string): string {
  const digits = normalizeZimPhone(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Best-effort normalisation for locally-entered Zimbabwean numbers into
 * the country-code-prefixed digits-only format wa.me expects. Handles the
 * common shapes guests actually type into the order/booking/enquiry forms:
 * "0771234567", "+263771234567", "263 77 123 4567". Falls back to just the
 * stripped digits for anything else, so a WhatsApp link is still produced
 * even if the number is already in some other valid international format.
 */
function normalizeZimPhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("263")) return digits;
  if (digits.startsWith("0")) return `263${digits.slice(1)}`;
  return digits;
}
