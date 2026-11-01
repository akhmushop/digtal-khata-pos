import { env } from "../../config/env.js";
import { mockProvider } from "./mockProvider.js";
import { sslcommerzProvider } from "./sslcommerzProvider.js";
import type { PaymentProvider } from "./provider.js";

let cached: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (cached) return cached;
  cached = env.paymentProvider === "sslcommerz" ? sslcommerzProvider : mockProvider;
  return cached;
}
