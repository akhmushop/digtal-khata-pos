import type {
  GatewaySession,
  GatewaySessionInput,
  PaymentProvider,
  VerificationInput,
  VerificationResult,
} from "./provider.js";

/**
 * Mock gateway for development and tests. Deterministic val_id contract:
 *   "MOCK-VALID"             → valid, no amount reported
 *   "MOCK-VALID-<amount>"    → valid, reports the given amount
 *   anything else            → invalid
 * The sessions it issues redirect to the website's /payment pages — the
 * same flow as a real gateway, minus real money. NEVER selected in
 * production (startup guard in config/env.ts).
 */
export const mockProvider: PaymentProvider = {
  name: "mock",

  async initiateSession(input: GatewaySessionInput): Promise<GatewaySession> {
    const sessionId = `mock-session-${input.tranId}`;
    // The "gateway" page exists only in dev; tests bypass it and call the
    // verify endpoint directly with a deterministic val_id.
    const gatewayUrl = `${input.urls.success.split("?")[0]}?mock-gateway=1&tran_id=${encodeURIComponent(input.tranId)}&val_id=${encodeURIComponent("MOCK-VALID-" + input.amount)}`;
    return { gatewayUrl, sessionId };
  },

  async verifyPayment(input: VerificationInput): Promise<VerificationResult> {
    const valId = input.valId;
    if (valId === "MOCK-VALID") {
      return {
        valid: true,
        status: "VALID",
        amount: null,
        currency: null,
        transactionId: valId,
        raw: { provider: "mock" },
      };
    }
    const amountMatch = /^MOCK-VALID-(\d+(?:\.\d{1,2})?)$/.exec(valId);
    if (amountMatch) {
      return {
        valid: true,
        status: "VALID",
        amount: Number(amountMatch[1]),
        currency: "BDT",
        transactionId: valId,
        raw: { provider: "mock" },
      };
    }
    return {
      valid: false,
      status: "INVALID",
      amount: null,
      currency: null,
      transactionId: valId,
      raw: { provider: "mock" },
    };
  },
};
