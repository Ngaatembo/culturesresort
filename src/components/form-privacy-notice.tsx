import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/**
 * One-line notice shown next to every form that collects a customer's
 * details (reservations, enquiries, orders). Kept deliberately short —
 * the full explanation lives on /privacy.
 */
export function FormPrivacyNotice({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
      Your details are only used to respond to your request. See our{" "}
      <Link to="/privacy" className="underline underline-offset-2 hover:text-primary">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
