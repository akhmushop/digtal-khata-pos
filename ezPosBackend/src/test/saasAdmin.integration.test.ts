/**
 * Phase 6 integration tests: SaaS admin panel — authorization, metrics,
 * businesses/subscription management with audit trail, business suspension
 * enforcement, and admin support — against a REAL PostgreSQL database.
 * Double-guarded like the other suites.
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

describe("saas admin integration", { skip: !runIntegration }, () => {
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
    `saasadm-${Date.now()}-${(counter += 1)}@example.test`;

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
        fullName: "Admin Test",
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

  async function makeAdmin(ctx: Ctx): Promise<void> {
    await pg!.query(
      "UPDATE users SET platform_role = 'platform_admin' WHERE id = $1",
      [ctx.userId],
    );
  }

  it("blocks every /api/saas route for non-admins", async () => {
    const owner = await createOwnerCtx("Non Admin Co");
    for (const path of [
      "/api/saas/overview",
      "/api/saas/businesses",
      "/api/saas/subscriptions",
      "/api/saas/payments",
      "/api/saas/support/tickets",
    ]) {
      const res = await api(owner, "GET", path);
      assert.equal(res.status, 403, `${path} should be admin-only`);
    }
  });

  it("serves metrics with documented definitions to admins", async () => {
    const admin = await createOwnerCtx("Admin Metrics Co");
    await makeAdmin(admin);

    const res = await api(admin, "GET", "/api/saas/overview");
    assert.equal(res.status, 200);
    const data = res.body?.data;
    assert.ok(data.businesses >= 2);
    assert.equal(typeof data.mrr, "number");
    assert.equal(data.arr, data.mrr * 12);
    assert.ok(Array.isArray(data.revenueByMonth));
    assert.ok(Array.isArray(data.revenueByPlan));
    assert.ok("trialConversionPct" in data);
    assert.ok("churn30dPct" in data);

    const businesses = await api(admin, "GET", "/api/saas/businesses?search=Admin+Metrics");
    assert.equal(businesses.status, 200);
    assert.ok(businesses.body.data.length >= 1);
  });

  it("suspends and reactivates a business, and suspension blocks member access", async () => {
    const owner = await createOwnerCtx("Suspend Target Co");
    const admin = await createOwnerCtx("Suspend Admin Co");
    await makeAdmin(admin);

    const suspend = await api(admin, "POST", `/api/saas/businesses/${owner.businessId}/status`, {
      status: "suspended",
      reason: "Test suspension",
    });
    assert.equal(suspend.status, 200);

    // The owner can no longer reach the business at all.
    const blocked = await api(owner, "GET", `/api/businesses/${owner.businessId}`);
    assert.equal(blocked.status, 403);
    assert.equal(blocked.body?.code, "BUSINESS_SUSPENDED");

    const write = await api(owner, "PUT", `/api/businesses/${owner.businessId}`, {
      name: "Nope",
    });
    assert.equal(write.status, 403);

    // Reactivate restores access.
    const reactivate = await api(admin, "POST", `/api/saas/businesses/${owner.businessId}/status`, {
      status: "active",
    });
    assert.equal(reactivate.status, 200);
    const restored = await api(owner, "GET", `/api/businesses/${owner.businessId}`);
    assert.equal(restored.status, 200);

    // Audit rows exist for both actions.
    const auditRows = await pg!.query(
      `SELECT a.action FROM saas_admin_audit a
       WHERE a.entity_type = 'business' AND a.entity_id = $1
       ORDER BY a.id DESC LIMIT 2`,
      [owner.businessId],
    );
    const actions = auditRows.rows.map((r) => r.action as string);
    assert.ok(actions.includes("business_suspended"));
    assert.ok(actions.includes("business_reactivated"));
  });

  it("admin subscription actions are audited and attributed", async () => {
    const owner = await createOwnerCtx("Admin Sub Co");
    const admin = await createOwnerCtx("Admin Sub Admin");
    await makeAdmin(admin);

    // Find the owner's open subscription.
    const subs = await api(admin, "GET", "/api/saas/subscriptions?status=trialing");
    assert.equal(subs.status, 200);
    const target = (subs.body.data as { businessId: number; id: number }[]).find(
      (s) => s.businessId === owner.businessId,
    );
    assert.ok(target, "owner subscription not listed");

    // Create a plan and change to it as admin.
    const plan = await pg!.query(
      `INSERT INTO subscription_plans (name, slug, interval, price, currency, is_active)
       VALUES ('Admin Change Target', $1, 'monthly', 800, 'BDT', true) RETURNING id`,
      [`adm-sub-${Date.now()}`],
    );
    const planId = plan.rows[0]!.id as number;
    const changed = await api(admin, "POST", `/api/saas/subscriptions/${target.id}/change-plan`, {
      planId,
    });
    assert.equal(changed.status, 200);
    assert.equal(changed.body.data.outcome, "trial_plan_changed");

    // Event attributed to the admin.
    const events = await pg!.query(
      `SELECT e.event_type, e.actor_type, e.actor_user_id FROM subscription_events e
       WHERE e.subscription_id = $1 ORDER BY e.id DESC LIMIT 1`,
      [target.id],
    );
    assert.equal(events.rows[0]!.event_type, "trial_plan_changed");
    assert.equal(events.rows[0]!.actor_type, "admin");
    assert.equal(events.rows[0]!.actor_user_id, admin.userId);

    // Extend +7 days.
    const before = await pg!.query(
      "SELECT current_period_end FROM subscriptions WHERE id = $1",
      [target.id],
    );
    const extend = await api(admin, "POST", `/api/saas/subscriptions/${target.id}/extend`, {
      days: 7,
    });
    assert.equal(extend.status, 200);
    const after = await pg!.query(
      "SELECT current_period_end FROM subscriptions WHERE id = $1",
      [target.id],
    );
    const diffDays =
      (new Date(after.rows[0]!.current_period_end).getTime() -
        new Date(before.rows[0]!.current_period_end).getTime()) /
      (24 * 60 * 60 * 1000);
    assert.ok(Math.abs(diffDays - 7) < 0.01);

    // Suspend → owner blocked → unsuspend.
    const suspend = await api(admin, "POST", `/api/saas/subscriptions/${target.id}/suspend`, {
      reason: "Test",
    });
    assert.equal(suspend.status, 200);
    const suspendedWrite = await api(owner, "PUT", `/api/businesses/${owner.businessId}`, {
      name: "Nope",
    });
    assert.equal(suspendedWrite.status, 403);
    const unsuspend = await api(admin, "POST", `/api/saas/subscriptions/${target.id}/reactivate`);
    assert.equal(unsuspend.status, 200);

    // Audit trail for the admin actions.
    const auditRows = await pg!.query(
      "SELECT action FROM saas_admin_audit WHERE entity_type = 'subscription' AND entity_id = $1",
      [target.id],
    );
    const actions = auditRows.rows.map((r) => r.action as string);
    assert.ok(actions.includes("subscription_plan_changed"));
    assert.ok(actions.includes("subscription_extended"));
    assert.ok(actions.includes("subscription_suspended"));
    assert.ok(actions.includes("subscription_unsuspended"));
  });

  it("grants a trial to a business with no open subscription", async () => {
    const owner = await createOwnerCtx("Grant Trial Co");
    const admin = await createOwnerCtx("Grant Trial Admin");
    await makeAdmin(admin);

    // Cancel the owner's trial immediately → no open subscription.
    const cancel = await api(
      owner,
      "POST",
      `/api/businesses/${owner.businessId}/subscription/cancel`,
      { immediate: true },
    );
    assert.equal(cancel.status, 200);

    const granted = await api(admin, "POST", `/api/saas/businesses/${owner.businessId}/grant-trial`, {
      days: 7,
    });
    assert.equal(granted.status, 200);

    const open = await api(owner, "GET", `/api/businesses/${owner.businessId}/subscription/open`);
    assert.equal(open.status, 200);
    assert.equal(open.body?.data?.status, "trialing");

    const event = await pg!.query(
      "SELECT event_type FROM subscription_events WHERE subscription_id = $1 AND event_type = 'trial_granted'",
      [open.body.data.id],
    );
    assert.equal(event.rows.length, 1);
  });

  it("admin support: lists all tickets, replies, and changes status", async () => {
    const customer = await createOwnerCtx("Support Customer Co");
    const admin = await createOwnerCtx("Support Admin Co");
    await makeAdmin(admin);

    const created = await api(customer, "POST", "/api/support/tickets", {
      subject: "Admin support flow",
      message: "The admin should be able to read and answer this ticket.",
      businessId: customer.businessId,
    });
    assert.equal(created.status, 201);
    const ticketId = created.body.data.id as number;

    const list = await api(admin, "GET", "/api/saas/support/tickets");
    assert.equal(list.status, 200);
    assert.ok(
      (list.body.data as { id: number }[]).some((t) => t.id === ticketId),
    );

    const reply = await api(admin, "POST", `/api/saas/support/tickets/${ticketId}/reply`, {
      body: "Thanks — we are looking into it.",
    });
    assert.equal(reply.status, 201);

    const statusChange = await api(
      admin,
      "POST",
      `/api/saas/support/tickets/${ticketId}/status`,
      { status: "resolved" },
    );
    assert.equal(statusChange.status, 200);

    // The customer sees the admin reply and the new status.
    const customerView = await api(customer, "GET", `/api/support/tickets/${ticketId}`);
    assert.equal(customerView.status, 200);
    assert.equal(customerView.body.data.status, "resolved");
    assert.ok(
      customerView.body.data.messages.some(
        (m: { authorType: string }) => m.authorType === "admin",
      ),
    );
  });

  it("plan management rejects non-admins (already admin CRUD-covered)", async () => {
    const owner = await createOwnerCtx("Plan Guard Co");
    const res = await api(owner, "GET", "/api/saas/plans");
    assert.equal(res.status, 403);
  });
});
