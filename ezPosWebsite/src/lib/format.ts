const CURRENCY_SYMBOLS: Record<string, string> = {
  BDT: "৳",
};

export function formatPrice(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  return `${symbol}${amount.toLocaleString("en-US")}`;
}

export function describeLimit(
  value: number | undefined,
  label: string,
): string {
  if (value === undefined) return `Unlimited ${label}`;
  return `${value.toLocaleString("en-US")} ${label}`;
}
