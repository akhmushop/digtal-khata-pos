/**
 * Phase 5 integration tests: payment initiation, server-side verification,
 * idempotent activation, IPN handling — against a REAL PostgreSQL database
 * with the MOCK gateway (deterministic val_id contract; see
 * services/payments/mockProvider.ts). Double-guarded like the other suites.
 *
 * Plain `npm test` NEVER runs this file.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { AddressInfo } from "node:net";
import { buildApp } from "../app.js";
import { ensureRbacSeed } from "../rbac/seed.js";

const runIntegration =
  process.env.INTEGRATION_TESTS === "1" && Boolean(process.env.DATABASE_URL);

describe("payments integration", { skip: !runIntegration }, () => {
  let server: import("node:http").Server | undefined;
  let baseUrl = "";
  let pg: import("pg").Client | null = null;

  before(async () => {
    const { default: pgDefault } = await import("pg");
    const client = new pgDefault.Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    const db = await client.query("SELECT current_database() AS db");
    if (db.rows[0]?.db !== "ezpos_test") {
      await client.end();
      throw new Error(
        `SAFETY ABORT: connected to "${db.rows[0]?.db}" — integration tests may only run against ezpos_test.`,
      );
    }
    pg = client;
    await ensureRbacSeed();

    const app = buildApp();
    server = app.listen(0);
    const address = server!.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    server?.close();
    await pg?.end();
    pg = null;
  });

  interface Ctx {
    token: string;
    businessId: number;
    userId: number;
    email: string;
  }

  let counter = 0;
  const uniqueEmail = () =>
    `pay-${Date.now()}-${(counter += 1)}@example.test`;

  async function api(
    ctx: Ctx,
    method: string,
    path: string,
    body?: unknown,
  ): Promise<{ status: number; body: any }> {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ctx.token}`,
        "X-Business-Id": String(ctx.businessId),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text === "" ? null : JSON.parse(text);
    } catch {
      parsed = text;
    }
    return { status: res.status, body: parsed };
  }

  /** Register, create a business, renew once → a payable pending invoice. */
  async function createPayableCtx(businessName: string): Promise<{
    ctx: Ctx;
    invoiceId: number;
    amount: number;
  }> {
    const email = uniqueEmail();
    const reg = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Pay Test",
        email,
        password: "strong-password-123",
      }),
    });
    assert.equal(reg.status, 201);
    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "strong-password-123" }),
    });
    const loginBody = (await login.json()) as { accessToken: string; user: { id: number } };
    const ctx: Ctx = {
      token: loginBody.accessToken,
      businessId: 0,
      userId: loginBody.user.id,
      email,
    };
    const biz = await api(ctx, "POST", "/api/businesses", { name: businessName });
    assert.equal(biz.status, 201);
    ctx.businessId = biz.body.business.id;

    // Renew (trial plan, price 0) creates a pending invoice for the period.
    const renew = await api(ctx, "POST", `/api/businesses/${ctx.businessId}/subscription/renew`);
    assert.equal(renew.status, 200);
    const invoices = await api(ctx, "GET", `/api/businesses/${ctx.businessId}/invoices`);
    assert.ok(invoices.body.data.length >= 1);
    const invoice = invoices.body.data[0];
    return { ctx, invoiceId: invoice.id, amount: Number(invoice.total) };
  }

  it("initiates a payment session (idempotently) and verifies it server-side", async () => {
    const { ctx, invoiceId, amount } = await createPayableCtx("Pay Flow Co");

    const first = await api(ctx, "POST", `/api/businesses/${ctx.businessId}/payments/initiate`, {
      invoiceId,
    });
    assert.equal(first.status, 200);
    const paymentId = first.body.data.paymentId as number;
    assert.ok(first.body.data.gatewayUrl.includes("/payment/success"));
    assert.equal(first.body.data.idempotencyKey, `inv-${invoiceId}`);

    // Duplicate initiation reuses the SAME payment row.
    const second = await api(ctx, "POST", `/api/businesses/${ctx.businessId}/payments/initiate`, {
      invoiceId,
    });
    assert.equal(second.status, 200);
    assert.equal(second.body.data.paymentId, paymentId);
    const rows = await pg!.query(
      "SELECT count(*)::int AS n FROM subscription_payments WHERE invoice_id = $1",
      [invoiceId],
    );
    assert.equal(rows.rows[0]!.n, 1);

    // Nothing is paid before server-side verification.
    const before = await pg!.query(
      "SELECT status FROM saas_invoices WHERE id = $1",
      [invoiceId],
    );
    assert.equal(before.rows[0]!.status, "pending");

    // Server-side verification with the gateway's val_id.
    const verify = await api(
      ctx,
      "POST",
      `/api/businesses/${ctx.businessId}/payments/${paymentId}/verify`,
      { valId: `MOCK-VALID-${amount}` },
    );
    assert.equal(verify.status, 200);
    assert.equal(verify.body.data.verified, true);
    assert.equal(verify.body.data.invoiceStatus, "paid");
    assert.equal(verify.body.data.subscriptionStatus, "active");

    const invoice = await pg!.query(
      "SELECT status, paid_at FROM saas_invoices WHERE id = $1",
      [invoiceId],
    );
    assert.equal(invoice.rows[0]!.status, "paid");
    assert.ok(invoice.rows[0]!.paid_at !== null);

    const payment = await pg!.query(
      "SELECT status, paid_at FROM subscription_payments WHERE id = $1",
      [paymentId],
    );
    assert.equal(payment.rows[0]!.status, "succeeded");
    assert.ok(payment.rows[0]!.paid_at !== null);

    // A trialing subscription becomes active after a verified payment.
    const sub = await pg!.query(
      "SELECT status FROM subscriptions WHERE business_id = $1",
      [ctx.businessId],
    );
    assert.equal(sub.rows[0]!.status, "active");

    // Audit event written.
    const events = await pg!.query(
      `SELECT e.event_type FROM subscription_events e
       JOIN subscriptions s ON s.id = e.subscription_id
       WHERE s.business_id = $1 AND e.event_type = 'invoice_paid'`,
      [ctx.businessId],
    );
    assert.ok(events.rows.length >= 1);
  });

  it("double callbacks are idempotent — one success, no double activation", async () => {
    const { ctx, invoiceId, amount } = await createPayableCtx("Pay Double Co");
    const initiate = await api(ctx, "POST", `/api/businesses/${ctx.businessId}/payments/initiate`, {
      invoiceId,
    });
    const paymentId = initiate.body.data.paymentId as number;

    const first = await api(
      ctx,
      "POST",
      `/api/businesses/${ctx.businessId}/payments/${paymentId}/verify`,
      { valId: `MOCK-VALID-${amount}` },
    );
    assert.equal(first.body.data.verified, true);
    assert.equal(first.body.data.alreadyVerified, false);

    // Simulated duplicate IPN: same verification again.
    const second = await api(
      ctx,
      "POST",
      `/api/businesses/${ctx.businessId}/payments/${paymentId}/verify`,
      { valId: `MOCK-VALID-${amount}` },
    );
    assert.equal(second.status, 200);
    assert.equal(second.body.data.verified, true);
    assert.equal(second.body.data.alreadyVerified, true);

    const payments = await pg!.query(
      "SELECT count(*)::int AS n FROM subscription_payments WHERE invoice_id = $1 AND status = 'succeeded'",
      [invoiceId],
    );
    assert.equal(payments.rows[0]!.n, 1);
  });

  it("rejects a gateway-reported amount mismatch without activating", async () => {
    const { ctx, invoiceId } = await createPayableCtx("Pay Mismatch Co");
    const initiate = await api(ctx, "POST", `/api/businesses/${ctx.businessId}/payments/initiate`, {
      invoiceId,
    });
    const paymentId = initiate.body.data.paymentId as number;

    // Gateway reports 999 — invoice amount differs.
    const verify = await api(
      ctx,
      "POST",
      `/api/businesses/${ctx.businessId}/payments/${paymentId}/verify`,
      { valId: "MOCK-VALID-999" },
    );
    assert.equal(verify.status, 200);
    assert.equal(verify.body.data.verified, false);
    assert.match(verify.body.data.reason ?? "", /amount/i);

    const invoice = await pg!.query(
      "SELECT status FROM saas_invoices WHERE id = $1",
      [invoiceId],
    );
    assert.equal(invoice.rows[0]!.status, "pending");
    // The subscription stays as it was (renew already set it active);
    // the invoice remains unpaid, which is the real gate.
    const payment = await pg!.query(
      "SELECT status FROM subscription_payments WHERE id = $1",
      [paymentId],
    );
    assert.equal(payment.rows[0]!.status, "verification_failed");

    // Retry after failure: same row resets, correct verification succeeds.
    const reinitiate = await api(ctx, "POST", `/api/businesses/${ctx.businessId}/payments/initiate`, {
      invoiceId,
    });
    assert.equal(reinitiate.status, 200);
    assert.equal(reinitiate.body.data.paymentId, paymentId);
    const verify2 = await api(
      ctx,
      "POST",
      `/api/businesses/${ctx.businessId}/payments/${paymentId}/verify`,
      { valId: "MOCK-VALID" }, // mock without amount → no mismatch possible
    );
    assert.equal(verify2.body.data.verified, true);
  });

  it("foreign payments verify as not-found", async () => {
    const { ctx: ownerA } = await createPayableCtx("Pay Scope A");
    // Register + login user B.
    const emailB = uniqueEmail();
    await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Pay B",
        email: emailB,
        password: "strong-password-123",
      }),
    });
    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailB, password: "strong-password-123" }),
    });
    const { accessToken, user } = (await login.json()) as {
      accessToken: string;
      user: { id: number };
    };
    const bizB = await fetch(`${baseUrl}/api/businesses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name: "Pay Scope B" }),
    });
    const bizBodyB = (await bizB.json()) as { business: { id: number } };
    const businessB = bizBodyB.business.id;
    const ctxB: Ctx = { token: accessToken, businessId: businessB, userId: user.id, email: emailB };

    const invoicesA = await api(ownerA, "GET", `/api/businesses/${ownerA.businessId}/invoices`);
    const invoiceA = invoicesA.body.data[0];
    const initiateA = await api(ownerA, "POST", `/api/businesses/${ownerA.businessId}/payments/initiate`, {
      invoiceId: invoiceA.id,
    });
    const paymentA = initiateA.body.data.paymentId as number;

    // B attempts to verify A's payment through their own business context.
    const foreign = await api(
      ctxB,
      "POST",
      `/api/businesses/${businessB}/payments/${paymentA}/verify`,
      { valId: "MOCK-VALID" },
    );
    assert.equal(foreign.status, 404);
  });

  it("the IPN callback activates payments and duplicate IPNs are idempotent", async () => {
    const { ctx, invoiceId, amount } = await createPayableCtx("Pay IPN Co");
    const initiate = await api(ctx, "POST", `/api/businesses/${ctx.businessId}/payments/initiate`, {
      invoiceId,
    });
    const idempotencyKey = initiate.body.data.idempotencyKey as string;

    // The gateway posts form-encoded IPN payloads.
    const ipn = await fetch(`${baseUrl}/api/payments/ipn`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        val_id: `MOCK-VALID-${amount}`,
        tran_id: idempotencyKey,
        status: "VALID",
        amount: String(amount),
        currency: "BDT",
      }).toString(),
    });
    assert.equal(ipn.status, 200);
    const ipnBody = (await ipn.json()) as { verified?: boolean; alreadyVerified?: boolean };
    assert.equal(ipnBody.verified, true);

    const duplicate = await fetch(`${baseUrl}/api/payments/ipn`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        val_id: `MOCK-VALID-${amount}`,
        tran_id: idempotencyKey,
        status: "VALID",
      }).toString(),
    });
    const duplicateBody = (await duplicate.json()) as { alreadyVerified?: boolean };
    assert.equal(duplicateBody.alreadyVerified, true);

    const invoice = await pg!.query(
      "SELECT status FROM saas_invoices WHERE id = $1",
      [invoiceId],
    );
    assert.equal(invoice.rows[0]!.status, "paid");
  });

  it("IPN with an unknown tran_id responds without activating anything", async () => {
    const ipn = await fetch(`${baseUrl}/api/payments/ipn`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        val_id: "MOCK-VALID-500",
        tran_id: `unknown-${Date.now()}`,
        status: "VALID",
      }).toString(),
    });
    assert.equal(ipn.status, 200);
    const body = (await ipn.json()) as { verified?: boolean };
    assert.equal(body.verified, false);
  });
});
