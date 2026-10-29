const currencyFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 2,
});

export function formatMoney(value: number | null | undefined): string {
  return currencyFormatter.format(Number(value ?? 0));
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

export function todayInputValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export type PaymentStatusValue = "unpaid" | "partial" | "paid" | "credit";

export function statusBadgeVariant(
  status: PaymentStatusValue,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "paid":
      return "default";
    case "partial":
      return "secondary";
    case "credit":
      return "outline";
    default:
      return "destructive";
  }
}

export function statusLabel(status: PaymentStatusValue): string {
  switch (status) {
    case "paid":
      return "Settled";
    case "partial":
      return "Partially paid";
    case "credit":
      return "Credit balance";
    default:
      return "Unpaid";
  }
}

/**
 * Normalize a Bangladesh phone number into international digits for
 * wa.me links. Accepts formats like 01712345678, +8801712345678,
 * 8801712345678. Returns null when the number is not a plausible
 * Bangladeshi mobile number.
 */
export function normalizeBangladeshPhone(
  phone: string | null | undefined,
): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D+/g, "");
  if (!digits) return null;

  let normalized: string;
  if (digits.startsWith("880")) {
    normalized = digits;
  } else if (digits.startsWith("0")) {
    normalized = `880${digits.slice(1)}`;
  } else {
    normalized = digits;
  }

  // 880 + 10-digit national number (1XXXXXXXXX)
  if (/^8801[3-9]\d{8}$/.test(normalized)) return normalized;
  return null;
}

export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
