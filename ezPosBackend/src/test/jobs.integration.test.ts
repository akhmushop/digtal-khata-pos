/**
 * Phase 7 integration tests: background sweeps — trial expiry, reminder
 * emails (deduped), grace-period suspension, payment-after-suspension —
 * against a REAL PostgreSQL database. Double-guarded like the other suites.
 *
 * Plain `npm test` NEVER runs this file.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { AddressInfo } from "node:net";
import { buildApp } from "../app.js";
import { ensureRbacSeed } from "../rbac/seed.js";
import { runSubscriptionSweeps } from "../jobs/subscriptionJobs.js";

const runIntegration =
  process.env.INTEGRATION_TESTS === "1" && Boolean(process.env.DATABASE_URL);

describe("background jobs integration", { skip: !runIntegration }, () => {
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

  let counter = 0;
  const uniqueEmail = () =>
    `jobs-${Date.now()}-${(counter += 1)}@example.test`;

  interface Ctx {
    token: string;
    businessId: number;
    userId: number;
    email: string;
  }

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

  async function createOwnerCtx(businessName: string): Promise<Ctx> {
    const email = uniqueEmail();
    const reg = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Jobs Test",
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
    const loginBody = (await login.json()) as {
      accessToken: string;
      user: { id: number };
    };
    const biz = await fetch(`${baseUrl}/api/businesses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginBody.accessToken}`,
      },
      body: JSON.stringify({ name: businessName }),
    });
    assert.equal(biz.status, 201);
    const bizBody = (await biz.json()) as { business: { id: number } };
    return {
      token: loginBody.accessToken,
      businessId: bizBody.business.id,
      userId: loginBody.user.id,
      email,
    };
  }

  function setPeriod(businessId: number, sqlInterval: string): void {
    void pg!.query(
      `UPDATE subscriptions SET current_period_end = now() + ${sqlInterval}
       WHERE business_id = $1 AND status IN ('trialing','active','past_due')`,
      [businessId],
    );
  }

  it("expires lapsed trials with an audit event", async () => {
    const owner = await createOwnerCtx("Expiry Sweep Co");
    await pg!.query(
      `UPDATE subscriptions SET current_period_end = now() - interval '1 day'
       WHERE business_id = $1 AND status = 'trialing'`,
      [owner.businessId],
    );

    const results = await runSubscriptionSweeps();
    assert.ok(results.expiredTrials >= 1);

    const sub = await pg!.query(
      "SELECT status FROM subscriptions WHERE business_id = $1",
      [owner.businessId],
    );
    assert.equal(sub.rows[0]!.status, "expired");

    const event = await pg!.query(
      `SELECT e.event_type FROM subscription_events e
       JOIN subscriptions s ON s.id = e.subscription_id
       WHERE s.business_id = $1 AND e.event_type = 'trial_expired'`,
      [owner.businessId],
    );
    assert.equal(event.rows.length, 1);

    // Re-running the sweep is idempotent — the row is no longer trialing.
    const again = await runSubscriptionSweeps();
    // expiredTrials may include rows from other suites' fixtures, but our
    // subscription must not produce a second event.
    const events = await pg!.query(
      `SELECT count(*)::int AS n FROM subscription_events e
       JOIN subscriptions s ON s.id = e.subscription_id
       WHERE s.business_id = $1 AND e.event_type = 'trial_expired'`,
      [owner.businessId],
    );
    assert.equal(events.rows[0]!.n, 1);
    void again;
  });

  it("sends one trial-ending reminder per subscription", async () => {
    const owner = await createOwnerCtx("Trial Reminder Co");
    await pg!.query(
      `UPDATE subscriptions SET current_period_end = now() + interval '2 days'
       WHERE business_id = $1 AND status = 'trialing'`,
      [owner.businessId],
    );

    await runSubscriptionSweeps();
    const first = await pg!.query(
      `SELECT count(*)::int AS n FROM subscription_events e
       JOIN subscriptions s ON s.id = e.subscription_id
       WHERE s.business_id = $1 AND e.event_type = 'trial_ending_reminder'`,
      [owner.businessId],
    );
    assert.equal(first.rows[0]!.n, 1);

    // Second sweep: deduped by the event guard.
    await runSubscriptionSweeps();
    const second = await pg!.query(
      `SELECT count(*)::int AS n FROM subscription_events e
       JOIN subscriptions s ON s.id = e.subscription_id
       WHERE s.business_id = $1 AND e.event_type = 'trial_ending_reminder'`,
      [owner.businessId],
    );
    assert.equal(second.rows[0]!.n, 1);
  });

  it("sends one renewal reminder per paid subscription", async () => {
    const owner = await createOwnerCtx("Renewal Reminder Co");
    // Put the subscription on a PAID plan — zero-price (trial) plans are
    // deliberately excluded from renewal reminders.
    const plan = await pg!.query(
      `INSERT INTO subscription_plans (name, slug, interval, price, currency, is_active)
       VALUES ('Reminder Paid', $1, 'monthly', 500, 'BDT', true) RETURNING id`,
      [`renewal-rem-${Date.now()}`],
    );
    await pg!.query(
      "UPDATE subscriptions SET plan_id = $1 WHERE business_id = $2",
      [plan.rows[0]!.id, owner.businessId],
    );
    const renew = await api(owner, "POST", `/api/businesses/${owner.businessId}/subscription/renew`);
    assert.equal(renew.status, 200);
    await pg!.query(
      `UPDATE subscriptions SET current_period_end = now() + interval '2 days'
       WHERE business_id = $1 AND status = 'active'`,
      [owner.businessId],
    );

    await runSubscriptionSweeps();
    await runSubscriptionSweeps();
    const events = await pg!.query(
      `SELECT count(*)::int AS n FROM subscription_events e
       JOIN subscriptions s ON s.id = e.subscription_id
       WHERE s.business_id = $1 AND e.event_type = 'renewal_reminder'`,
      [owner.businessId],
    );
    assert.equal(events.rows[0]!.n, 1);
  });

  it("suspends past-due subscriptions once the grace period lapses", async () => {
    const owner = await createOwnerCtx("Grace Sweep Co");
    await pg!.query(
      `UPDATE subscriptions SET status = 'past_due', current_period_end = now() - interval '10 days'
       WHERE business_id = $1`,
      [owner.businessId],
    );

    const results = await runSubscriptionSweeps();
    assert.ok(results.graceSuspensions >= 1);

    const sub = await pg!.query(
      "SELECT status FROM subscriptions WHERE business_id = $1",
      [owner.businessId],
    );
    assert.equal(sub.rows[0]!.status, "suspended");

    // Writes are blocked while suspended.
    const write = await api(owner, "PUT", `/api/businesses/${owner.businessId}`, {
      name: "Nope",
    });
    assert.equal(write.status, 403);
  });

  it("a suspended customer who pays becomes active again", async () => {
    const owner = await createOwnerCtx("Pay After Suspend Co");
    // Paid state with a pending invoice, then suspended (grace lapse).
    const renew = await api(owner, "POST", `/api/businesses/${owner.businessId}/subscription/renew`);
    assert.equal(renew.status, 200);
    await pg!.query(
      `UPDATE subscriptions SET status = 'suspended', current_period_end = now() - interval '30 days'
       WHERE business_id = $1`,
      [owner.businessId],
    );

    const invoices = await api(owner, "GET", `/api/businesses/${owner.businessId}/invoices`);
    const pendingInvoice = (invoices.body.data as { id: number; status: string }[]).find(
      (i) => i.status === "pending",
    );
    assert.ok(pendingInvoice, "expected a pending invoice");

    const initiate = await api(owner, "POST", `/api/businesses/${owner.businessId}/payments/initiate`, {
      invoiceId: pendingInvoice.id,
    });
    assert.equal(initiate.status, 200);
    const paymentId = initiate.body.data.paymentId as number;
    const amount = Number(initiate.body.data.amount);

    const verify = await api(
      owner,
      "POST",
      `/api/businesses/${owner.businessId}/payments/${paymentId}/verify`,
      { valId: `MOCK-VALID-${amount}` },
    );
    assert.equal(verify.status, 200);
    assert.equal(verify.body.data.verified, true);
    assert.equal(verify.body.data.subscriptionStatus, "active");

    const sub = await pg!.query(
      "SELECT status FROM subscriptions WHERE business_id = $1",
      [owner.businessId],
    );
    assert.equal(sub.rows[0]!.status, "active");
  });

  it("the manual jobs trigger is admin-only and returns counts", async () => {
    const owner = await createOwnerCtx("Jobs Trigger Co");
    const denied = await api(owner, "POST", "/api/saas/jobs/run");
    assert.equal(denied.status, 403);

    const admin = await createOwnerCtx("Jobs Trigger Admin");
    await pg!.query(
      "UPDATE users SET platform_role = 'platform_admin' WHERE id = $1",
      [admin.userId],
    );
    const allowed = await api(admin, "POST", "/api/saas/jobs/run");
    assert.equal(allowed.status, 200);
    assert.ok(typeof allowed.body.data.expiredTrials === "number");
    assert.ok(typeof allowed.body.data.trialReminders === "number");
    assert.ok(typeof allowed.body.data.renewalReminders === "number");
    assert.ok(typeof allowed.body.data.graceSuspensions === "number");
  });
});
