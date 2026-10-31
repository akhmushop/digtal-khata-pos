/**
 * Subscription core integration tests (Phase 2).
 *
 * Covers plan-limit enforcement (users, locations, products), feature
 * gating (advancedReports, multiLocation), the centralized subscription
 * lifecycle (upgrade proration, scheduled downgrade, cancellation,
 * renewal), audit events, and platform-admin plan CRUD — against a REAL
 * PostgreSQL database. Double-guarded like the other suites: runs ONLY
 * with INTEGRATION_TESTS=1 AND DATABASE_URL pointing at ezpos_test
 * (fail-closed).
 *
 * Plain `npm test` NEVER runs this file.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { AddressInfo } from "node:net";
import { buildApp } from "../app.js";
import { ensureRbacSeed } from "../rbac/seed.js";
import {
  changePlan,
  cancelSubscription,
  getOpenSubscription,
  getSubscriptionHistory,
  renewSubscription,
} from "../modules/subscriptions/subscription.service.js";

const runIntegration =
  process.env.INTEGRATION_TESTS === "1" && Boolean(process.env.DATABASE_URL);

describe("subscription core integration", { skip: !runIntegration }, () => {
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
    // One long-lived client for SQL fixtures; ended in after().
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

  let planCounter = 0;
  /**
   * Creates a dedicated plan row. With adopt (default true) the business's
   * open subscription is pointed at it; pass adopt:false to create a change
   * target that changePlan() can switch TO (the subscription must still be
   * on its old plan for that call to be meaningful).
   */
  async function setBusinessPlan(
    businessId: number,
    plan: {
      price?: number;
      interval?: "monthly" | "yearly";
      limits?: Record<string, number> | null;
      features?: Record<string, boolean> | null;
    },
    adopt = true,
  ): Promise<number> {
    planCounter += 1;
    const slug = `test-plan-${Date.now()}-${planCounter}`;
    const created = await pg!.query(
      `INSERT INTO subscription_plans (name, slug, interval, price, currency, limits, features, is_active)
       VALUES ($1, $2, $3, $4, 'BDT', $5::jsonb, $6::jsonb, true) RETURNING id`,
      [
        `Test plan ${planCounter}`,
        slug,
        plan.interval ?? "monthly",
        plan.price ?? 500,
        plan.limits ? JSON.stringify(plan.limits) : null,
        plan.features ? JSON.stringify(plan.features) : null,
      ],
    );
    const planId = created.rows[0]!.id as number;
    if (adopt) {
      await pg!.query(
        `UPDATE subscriptions SET plan_id = $1 WHERE business_id = $2
         AND status IN ('trialing','active','past_due')`,
        [planId, businessId],
      );
    }
    return planId;
  }

  interface Ctx {
    token: string;
    businessId: number;
    userId: number;
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

  let emailCounter = 0;
  async function createOwnerCtx(businessName: string): Promise<Ctx> {
    emailCounter += 1;
    const email = `subcore-${Date.now()}-${emailCounter}@example.test`;
    const reg = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Sub Core",
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
    assert.equal(login.status, 200);
    const { accessToken } = (await login.json()) as { accessToken: string };
    const me = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meBody = (await me.json()) as { user: { id: number } };
    const userId = meBody.user.id;

    const biz = await fetch(`${baseUrl}/api/businesses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name: businessName }),
    });
    assert.equal(biz.status, 201);
    const bizBody = (await biz.json()) as { business: { id: number } };

    // Default location (location-scoped endpoints refuse to work without one).
    const loc = await fetch(`${baseUrl}/api/locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Business-Id": String(bizBody.business.id),
      },
      body: JSON.stringify({ name: "Main Store" }),
    });
    assert.equal(loc.status, 201);

    return { token: accessToken, businessId: bizBody.business.id, userId };
  }

  async function createStaff(
    ctx: Ctx,
    roleId: number,
  ): Promise<{ status: number; body: any }> {
    emailCounter += 1;
    return api(ctx, "POST", "/api/users", {
      fullName: "Staff Member",
      email: `staff-${Date.now()}-${emailCounter}@example.test`,
      password: "strong-password-123",
      roleIds: [roleId],
    });
  }

  async function getFirstRoleId(ctx: Ctx): Promise<number> {
    const res = await api(ctx, "GET", "/api/roles");
    assert.equal(res.status, 200);
    const roles = (res.body?.data ?? res.body) as {
      id: number;
      slug: string;
    }[];
    const cashier = Array.isArray(roles)
      ? roles.find((r) => r.slug === "cashier")
      : undefined;
    assert.ok(cashier, "cashier role missing");
    return cashier.id;
  }

  const productPayload = (name: string) => ({
    name,
    categoryId: null,
    brandId: null,
    unitId: 0, // replaced with a created unit by the caller
    description: "",
    productType: "physical",
    hasVariants: false,
    trackingType: "none",
    supplierId: null,
    status: "active",
    imageUrl: null,
    imageFile: null,
    source: "opening",
    variants: [
      {
        sku: "",
        barcode: null,
        sellingPrice: 100,
        alertQuantity: 5,
        isDefault: true,
        status: "active",
        imageUrl: null,
        imageFile: null,
        batchNumber: "B1",
        purchasePrice: 60,
        quantity: 10,
        expiryDate: null,
      },
    ],
  });

  async function createUnit(ctx: Ctx): Promise<number> {
    const res = await api(ctx, "POST", "/api/product/unit", {
      unitName: "Piece",
      abbreviation: "Pcs",
    });
    assert.equal(res.status, 201);
    return (res.body as { data: { value: number } }).data.value;
  }

  it("enforces the plan's maxUsers limit on staff creation", async () => {
    const ctx = await createOwnerCtx("User Limit Co");
    // Owner occupies one slot; maxUsers 2 allows exactly one staff member.
    await setBusinessPlan(ctx.businessId, { limits: { maxUsers: 2 } });
    const roleId = await getFirstRoleId(ctx);

    const first = await createStaff(ctx, roleId);
    assert.equal(first.status, 201);

    const second = await createStaff(ctx, roleId);
    assert.equal(second.status, 403);
    assert.equal(second.body?.code, "PLAN_LIMIT_REACHED");
    assert.match(second.body?.message ?? "", /team members/);
  });

  it("enforces the plan's maxLocations limit", async () => {
    const ctx = await createOwnerCtx("Location Limit Co");
    await setBusinessPlan(ctx.businessId, { limits: { maxLocations: 1 } });

    const second = await api(ctx, "POST", "/api/locations", {
      name: "Second Outlet",
    });
    assert.equal(second.status, 403);
    assert.equal(second.body?.code, "PLAN_LIMIT_REACHED");
    assert.match(second.body?.message ?? "", /locations/);
  });

  it("enforces the plan's maxProducts limit", async () => {
    const ctx = await createOwnerCtx("Product Limit Co");
    await setBusinessPlan(ctx.businessId, { limits: { maxProducts: 1 } });
    const unitId = await createUnit(ctx);

    const first = await api(ctx, "POST", "/api/product", {
      ...productPayload("Limit Product A"),
      unitId,
    });
    assert.equal(first.status, 201);

    const second = await api(ctx, "POST", "/api/product", {
      ...productPayload("Limit Product B"),
      unitId,
    });
    assert.equal(second.status, 403);
    assert.equal(second.body?.code, "PLAN_LIMIT_REACHED");
    assert.match(second.body?.message ?? "", /products/);
  });

  it("gates advanced reports behind the advancedReports feature", async () => {
    const ctx = await createOwnerCtx("Report Gate Co");
    await setBusinessPlan(ctx.businessId, { features: {} });

    const denied = await api(ctx, "GET", "/api/reports/financial/profit");
    assert.equal(denied.status, 403);
    assert.equal(denied.body?.code, "FEATURE_NOT_IN_PLAN");

    const comparison = await api(
      ctx,
      "GET",
      "/api/reports/locations/comparison",
    );
    assert.equal(comparison.status, 403);

    // Basic reports stay available.
    const basic = await api(ctx, "GET", "/api/reports/sales/summary");
    assert.equal(basic.status, 200);

    // With the entitlement the advanced report opens up.
    await setBusinessPlan(ctx.businessId, {
      features: { advancedReports: true },
    });
    const allowed = await api(ctx, "GET", "/api/reports/financial/profit");
    assert.equal(allowed.status, 200);
  });

  it("gates stock transfers behind the multiLocation feature", async () => {
    const ctx = await createOwnerCtx("Transfer Gate Co");
    await setBusinessPlan(ctx.businessId, { features: {} });

    const denied = await api(ctx, "POST", "/api/stock-transfers", {});
    assert.equal(denied.status, 403);
    assert.equal(denied.body?.code, "FEATURE_NOT_IN_PLAN");
  });

  it("upgrades an active subscription immediately with a prorated invoice", async () => {
    const ctx = await createOwnerCtx("Upgrade Co");
    await setBusinessPlan(ctx.businessId, { price: 500 });
    // Leave the trial for a paid state: renew once via the service.
    await renewSubscription(ctx.businessId, { type: "system" });

    const expensivePlanId = await setBusinessPlan(
      ctx.businessId,
      { price: 1500 },
      false, // change target — the subscription must stay on the cheap plan
    );
    const before = await getOpenSubscription(ctx.businessId);
    assert.ok(before);

    const result = await changePlan(
      ctx.businessId,
      expensivePlanId,
      { type: "customer", userId: ctx.userId },
    );
    assert.equal(result.outcome, "upgraded");
    assert.ok(result.invoice);
    assert.ok(result.invoice.total > 0 && result.invoice.total < 1500);

    const after = await getOpenSubscription(ctx.businessId);
    assert.equal(after?.planId, expensivePlanId);
    assert.equal(after?.status, "active");
    // The period end does not move on an upgrade.
    assert.equal(
      after?.currentPeriodEnd.getTime(),
      before?.currentPeriodEnd.getTime(),
    );

    const events = await getSubscriptionHistory(ctx.businessId);
    assert.ok(events.some((e) => e.eventType === "plan_upgraded"));
  });

  it("switches the plan immediately (no charge) while trialing", async () => {
    const ctx = await createOwnerCtx("Trial Switch Co");
    const newPlanId = await setBusinessPlan(
      ctx.businessId,
      { price: 999 },
      false, // change target — the trial stays on the free-trial plan
    );

    const result = await changePlan(
      ctx.businessId,
      newPlanId,
      { type: "customer", userId: ctx.userId },
    );
    assert.equal(result.outcome, "trial_plan_changed");
    assert.equal(result.invoice, null);
    const current = await getOpenSubscription(ctx.businessId);
    assert.equal(current?.planId, newPlanId);
    assert.equal(current?.status, "trialing");
  });

  it("schedules a downgrade for period end and applies it at renewal", async () => {
    const ctx = await createOwnerCtx("Downgrade Co");
    // Move to a paid 500 plan first so the 200 plan is a true downgrade.
    await setBusinessPlan(ctx.businessId, { price: 500 });
    await renewSubscription(ctx.businessId, { type: "system" }); // paid state
    const cheapPlanId = await setBusinessPlan(
      ctx.businessId,
      { price: 200 },
      false, // change target, not the current plan
    );

    const result = await changePlan(
      ctx.businessId,
      cheapPlanId,
      { type: "customer", userId: ctx.userId },
    );
    assert.equal(result.outcome, "scheduled");
    assert.equal(result.invoice, null);

    const scheduled = await getOpenSubscription(ctx.businessId);
    assert.equal(scheduled?.pendingPlanId, cheapPlanId);
    assert.equal(scheduled?.planId !== cheapPlanId, true);

    const renewed = await renewSubscription(
      ctx.businessId,
      { type: "system" },
    );
    assert.equal(renewed.planId, cheapPlanId);
    assert.equal(renewed.pendingPlanId, null);
    assert.equal(renewed.status, "active");

    const events = await getSubscriptionHistory(ctx.businessId);
    assert.ok(events.some((e) => e.eventType === "plan_change_scheduled"));
    assert.ok(events.some((e) => e.eventType === "renewed_plan_applied"));
  });

  it("keeps access on scheduled cancellation and blocks writes after immediate cancel", async () => {
    const ctx = await createOwnerCtx("Cancel Co");
    const scheduled = await cancelSubscription(ctx.businessId, {
      type: "customer",
      userId: ctx.userId,
    });
    assert.equal(scheduled.outcome, "cancellation_scheduled");

    // Still within the paid period — writes continue.
    const renamed = await api(ctx, "PUT", `/api/businesses/${ctx.businessId}`, {
      name: "Cancel Co Renamed",
    });
    assert.equal(renamed.status, 200);

    await cancelSubscription(ctx.businessId, { type: "customer" }, {
      immediate: true,
    });

    const blocked = await api(
      ctx,
      "PUT",
      `/api/businesses/${ctx.businessId}`,
      { name: "Should Not Apply" },
    );
    assert.equal(blocked.status, 403);
    assert.equal(blocked.body?.code, "SUBSCRIPTION_REQUIRED");

    const events = await getSubscriptionHistory(ctx.businessId);
    assert.ok(events.some((e) => e.eventType === "cancellation_scheduled"));
    assert.ok(events.some((e) => e.eventType === "canceled"));
  });

  it("returns plan entitlements, usage, and events on the subscription endpoint", async () => {
    const ctx = await createOwnerCtx("Portal Payload Co");
    await setBusinessPlan(ctx.businessId, {
      limits: { maxUsers: 3 },
      features: { advancedReports: true },
    });

    const res = await api(ctx, "GET", `/api/businesses/${ctx.businessId}/subscription`);
    assert.equal(res.status, 200);
    assert.equal(res.body?.success, true);
    assert.equal(res.body?.plan?.limits?.maxUsers, 3);
    assert.equal(res.body?.plan?.features?.advancedReports, true);
    assert.ok(typeof res.body?.usage?.users === "number");
    assert.ok(Array.isArray(res.body?.events));
    assert.ok(res.body.events.length >= 1); // trial_started at minimum
  });

  it("restricts plan CRUD to platform admins", async () => {
    const owner = await createOwnerCtx("Non Admin Co");

    const denied = await api(owner, "GET", "/api/saas/plans");
    assert.equal(denied.status, 403);

    // Elevate the same account in the DB — auth middleware reloads the user
    // on every request, so the existing token becomes an admin token.
    await pg!.query(
      "UPDATE users SET platform_role = 'platform_admin' WHERE id = $1",
      [owner.userId],
    );

    const list = await api(owner, "GET", "/api/saas/plans");
    assert.equal(list.status, 200);
    assert.ok(Array.isArray(list.body?.data));

    const create = await api(owner, "POST", "/api/saas/plans", {
      name: "Admin Created Plan",
      interval: "monthly",
      price: 750,
      limits: { maxUsers: 5 },
      features: { multiLocation: true },
    });
    assert.equal(create.status, 201);
    const planId = create.body?.data?.id as number;
    assert.ok(planId);

    const patch = await api(owner, "PATCH", `/api/saas/plans/${planId}`, {
      price: 800,
      isPopular: true,
    });
    assert.equal(patch.status, 200);
    assert.equal(patch.body?.data?.price, 800);

    // Unreferenced plan: hard delete.
    const del = await api(owner, "DELETE", `/api/saas/plans/${planId}`);
    assert.equal(del.status, 200);
    assert.equal(del.body?.data?.deleted, true);
  });

  it("archives a referenced plan instead of deleting it", async () => {
    const admin = await createOwnerCtx("Archive Admin Co");
    await pg!.query(
      "UPDATE users SET platform_role = 'platform_admin' WHERE id = $1",
      [admin.userId],
    );

    const create = await api(admin, "POST", "/api/saas/plans", {
      name: `Referenced Plan ${Date.now()}`,
      interval: "monthly",
      price: 300,
    });
    assert.equal(create.status, 201);
    const planId = create.body?.data?.id as number;
    assert.ok(typeof planId === "number", "plan id missing");

    // Point a real business's subscription at it so it becomes referenced.
    await setBusinessPlan(admin.businessId, {});
    await pg!.query(
      "UPDATE subscriptions SET plan_id = $1 WHERE business_id = $2 AND status IN ('trialing','active','past_due')",
      [planId, admin.businessId],
    );

    const del = await api(admin, "DELETE", `/api/saas/plans/${planId}`);
    assert.equal(del.status, 200);
    assert.equal(del.body?.data?.archived, true);
    assert.equal(del.body?.data?.deleted, false);

    const check = await pg!.query(
      "SELECT is_active FROM subscription_plans WHERE id = $1",
      [planId],
    );
    assert.equal(check.rows[0]?.is_active, false);
  });
});
