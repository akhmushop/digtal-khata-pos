/**
 * RBAC integration tests.
 *
 * They exercise permission enforcement, role management, sensitive-field
 * stripping, and the ownership/self-escalation guards against a REAL
 * PostgreSQL database and INSERT records. Double-guarded: they run ONLY when
 * BOTH conditions hold —
 *   1. INTEGRATION_TESTS=1 is set explicitly, and
 *   2. DATABASE_URL points at the approved disposable ezpos_test database.
 *
 * FAIL-CLOSED: before the first write, the suite asserts that
 * current_database() is exactly 'ezpos_test' and aborts otherwise.
 *
 * Run with:
 *   DATABASE_URL=postgresql://.../ezpos_test INTEGRATION_TESTS=1 npm test
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

describe("rbac integration", { skip: !runIntegration }, () => {
  let server: import("node:http").Server | undefined;
  let baseUrl = "";

  before(async () => {
    const { default: pg } = await import("pg");
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const db = await client.query("SELECT current_database() AS db");
    if (db.rows[0]?.db !== "ezpos_test") {
      await client.end();
      throw new Error(
        `SAFETY ABORT: connected to "${db.rows[0]?.db}" — integration tests may only run against ezpos_test.`,
      );
    }
    await client.query(
      `INSERT INTO subscription_plans (name, slug, interval, price, currency, is_active)
       VALUES ('Free trial', 'free-trial', 'monthly', 0, 'BDT', true)
       ON CONFLICT (slug) DO UPDATE
       -- Test-env normalization: the shared trial plan is unlimited and
       -- full-featured so POS suites exercise POS logic. Plan-limit and
       -- feature gates are covered by dedicated plans in
       -- subscriptionCore.integration.test.ts.
       SET limits = NULL,
           features = '{"multiLocation":true,"advancedReports":true,"storefrontApi":true,"woocommerceIntegration":true,"customStorefront":true,"multipleOnlineStores":true,"advancedWebhooks":true}'::jsonb,
           is_active = true`,
    );
    await client.end();

    // Seed the permission catalog the same way server startup does.
    await ensureRbacSeed();

    const app = buildApp();
    server = app.listen(0);
    const address = server!.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(() => {
    server?.close();
  });

  const uniqueEmail = () =>
    `rbac-${Date.now()}-${Math.floor(Math.random() * 1e6)}-${Math.floor(
      Math.random() * 1e6,
    )}@example.test`;

  interface Ctx {
    token: string;
    businessId: number;
    userId: number;
    email: string;
    locationId: number;
  }

  async function api(
    ctx: { token: string; businessId: number },
    method: string,
    path: string,
    body?: unknown,
  ): Promise<{ status: number; body: unknown }> {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ctx.token}`,
        "X-Business-Id": String(ctx.businessId),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    let parsed: unknown = null;
    const text = await res.text();
    try {
      parsed = text === "" ? null : JSON.parse(text);
    } catch {
      parsed = text;
    }
    return { status: res.status, body: parsed };
  }

  async function registerAndCreateBusiness(
    email: string,
    businessName: string,
  ): Promise<Ctx> {
    const reg = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "RBAC Test",
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

    // Location-scoped endpoints require a location (Phase 1 location layer).
    const loc = await fetch(`${baseUrl}/api/locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginBody.accessToken}`,
        "X-Business-Id": String(bizBody.business.id),
      },
      body: JSON.stringify({ name: "Main Store" }),
    });
    assert.equal(loc.status, 201);
    const locBody = (await loc.json()) as { data: { id: number } };

    return {
      token: loginBody.accessToken,
      businessId: bizBody.business.id,
      userId: loginBody.user.id,
      email,
      locationId: locBody.data.id,
    };
  }

  let owner: Ctx;
  let manager: Ctx;
  let cashier: Ctx;
  let accountant: Ctx;
  let cashierRoleId = 0;
  let managerRoleId = 0;
  let accountantRoleId = 0;

  before(async () => {
    const stamp = Date.now();
    owner = await registerAndCreateBusiness(
      `rbac-owner-${stamp}@example.test`,
      `RBAC Owner Biz ${stamp}`,
    );

    // Owner /auth/me carries the wildcard permission.
    const me = await api(owner, "GET", "/api/auth/me");
    assert.equal(me.status, 200);
    const meBiz = payload<{ businesses: any[] }>(me).businesses.find(
      (b: any) => b.businessId === owner.businessId,
    );
    assert.ok(meBiz.permissions.includes("*"));
    assert.ok(meBiz.roles.some((r: any) => r.slug === "owner"));

    // Default roles exist with their templates.
    const rolesRes = await api(owner, "GET", "/api/roles");
    assert.equal(rolesRes.status, 200);
    const roles = rolesBody(rolesRes);
    const bySlug = new Map(roles.map((r: any) => [r.slug, r]));
    for (const slug of ["owner", "manager", "cashier", "accountant"]) {
      assert.ok(bySlug.has(slug), `default role ${slug} missing`);
    }
    const cashierRole = bySlug.get("cashier");
    const managerRole = bySlug.get("manager");
    const accountantRole = bySlug.get("accountant");
    cashierRoleId = cashierRole.id;
    managerRoleId = managerRole.id;
    accountantRoleId = accountantRole.id;
    assert.ok(cashierRole.permissionKeys.includes("pos.create_sale"));
    assert.ok(!cashierRole.permissionKeys.includes("purchases.view"));
    assert.ok(managerRole.permissionKeys.includes("purchases.view"));
    assert.ok(accountantRole.permissionKeys.includes("reports.profit.view"));
    assert.ok(!accountantRole.permissionKeys.includes("pos.create_sale"));

    // Create staff users.
    manager = await createStaff("manager", [managerRoleId, accountantRoleId]);
    cashier = await createStaff("cashier", [cashierRoleId]);
    accountant = await createStaff("accountant", [accountantRoleId]);

    async function createStaff(
      label: string,
      roleIds: number[],
    ): Promise<Ctx> {
      const email = `rbac-${label}-${stamp}@example.test`;
      const created = await api(owner, "POST", "/api/users", {
        fullName: `RBAC ${label}`,
        email,
        password: "strong-password-123",
        roleIds,
      });
      assert.equal(created.status, 201, JSON.stringify(created.body));
      await api(owner, "PATCH", `/api/users/${payload<{ data: { userId: number } }>(created).data.userId}`, {
        locationIds: [owner.locationId],
      });
      const login = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "strong-password-123" }),
      });
      assert.equal(login.status, 200);
      const loginBody = (await login.json()) as {
        accessToken: string;
        user: { id: number };
      };
      return {
        token: loginBody.accessToken,
        businessId: owner.businessId,
        userId: loginBody.user.id,
        email,
        locationId: owner.locationId,
      };
    }
  });

  function rolesBody(res: { body: unknown }): any[] {
    return (res.body as { data: any[] }).data;
  }

  function payload<T>(res: { body: unknown }): T {
    return res.body as T;
  }

  it("staff /auth/me returns the union of role permissions", async () => {
    // Manager holds manager + accountant roles.
    const me = await api(manager, "GET", "/api/auth/me");
    assert.equal(me.status, 200);
    const meBiz = payload<{ businesses: any[] }>(me).businesses.find(
      (b: any) => b.businessId === manager.businessId,
    );
    assert.ok(!meBiz.permissions.includes("*"));
    assert.ok(meBiz.permissions.includes("purchases.view"));
    assert.ok(meBiz.permissions.includes("reports.profit.view"));
    assert.ok(!meBiz.permissions.includes("roles.edit"));

    // Cashier: POS only.
    const meCashier = await api(cashier, "GET", "/api/auth/me");
    const meCashierBiz = payload<{ businesses: any[] }>(meCashier).businesses.find(
      (b: any) => b.businessId === cashier.businessId,
    );
    assert.ok(meCashierBiz.permissions.includes("pos.create_sale"));
    assert.ok(!meCashierBiz.permissions.includes("purchases.view"));
    assert.ok(!meCashierBiz.permissions.includes("reports.profit.view"));
  });

  it("scenario 1+2: cashier cannot reach the purchases API (page or direct call)", async () => {
    const list = await api(cashier, "GET", "/api/purchases");
    assert.equal(list.status, 403);
    const items = await api(cashier, "GET", "/api/purchases/items");
    assert.equal(items.status, 403);
    const create = await api(cashier, "POST", "/api/purchases", {
      anyGarment: true,
    });
    assert.equal(create.status, 403);
  });

  it("scenario 3: cashier cannot access profit reports; accountant can", async () => {
    const asCashier = await api(cashier, "GET", "/api/reports/financial/profit");
    assert.equal(asCashier.status, 403);
    const asAccountant = await api(
      accountant,
      "GET",
      "/api/reports/financial/profit",
    );
    assert.equal(asAccountant.status, 200);
  });

  it("scenario 4: manager cannot create an owner account", async () => {
    const rolesRes = await api(manager, "GET", "/api/roles");
    // roles.view is not in manager's template → the catalog is hidden too.
    assert.equal(rolesRes.status, 403);
    // Even with a role id, the owner role is not assignable.
    const attempt = await api(manager, "POST", "/api/users", {
      fullName: "Escalation Attempt",
      email: uniqueEmail(),
      password: "strong-password-123",
      roleIds: [1],
    });
    assert.ok([403, 400].includes(attempt.status));
  });

  it("manager cannot create users or view the user list (users.* not in template)", async () => {
    const list = await api(manager, "GET", "/api/users");
    assert.equal(list.status, 403);
    const create = await api(manager, "POST", "/api/users", {
      fullName: "Nope",
      email: uniqueEmail(),
      password: "strong-password-123",
      roleIds: [cashierRoleId],
    });
    assert.equal(create.status, 403);
  });

  it("scenario 5: a user cannot edit a role they hold (self-escalation guard)", async () => {
    // Owner assigns the manager a custom role carrying roles.edit.
    const custom = await api(owner, "POST", "/api/roles", {
      name: `Escalation Probe ${Date.now()}`,
      permissionKeys: ["roles.edit", "roles.view"],
    });
    assert.equal(custom.status, 201);
    const customId = payload<{ data: { id: number } }>(custom).data.id;

    const usersRes = await api(owner, "GET", "/api/users");
    const managerMember = payload<{ data: any[] }>(usersRes).data.find(
      (m: any) => m.userId === manager.userId,
    );
    const updated = await api(owner, "PATCH", `/api/users/${manager.userId}`, {
      roleIds: [...managerMember.roles.map((r: any) => r.id), customId],
    });
    assert.equal(updated.status, 200);

    // Now the manager CAN call roles.edit endpoints — but not on their own role.
    const selfEdit = await api(
      manager,
      "PATCH",
      `/api/roles/${managerRoleId}`,
      { permissionKeys: ["purchases.view", "users.create", "roles.edit", "roles.view"] },
    );
    assert.equal(selfEdit.status, 403);

    const otherEdit = await api(
      manager,
      "PATCH",
      `/api/roles/${cashierRoleId}`,
      { permissionKeys: ["pos.create_sale", "pos.view"] },
    );
    assert.equal(otherEdit.status, 200);

    // restore manager roles (drop the probe role from assignments)
    const restore = await api(owner, "PATCH", `/api/users/${manager.userId}`, {
      roleIds: managerMember.roles.map((r: any) => r.id),
    });
    assert.equal(restore.status, 200);
    const del = await api(owner, "DELETE", `/api/roles/${customId}`);
    assert.equal(del.status, 200);
  });

  it("scenario 6: revoking a permission takes effect immediately", async () => {
    // Owner removes pos.create_sale from the cashier role…
    const patch = await api(owner, "PATCH", `/api/roles/${cashierRoleId}`, {
      permissionKeys: ["pos.view", "sales.view", "products.view"],
    });
    assert.equal(patch.status, 200);
    // …and the cashier's next sale creation is rejected.
    const sale = await api(cashier, "POST", "/api/sales", {
      saleDate: new Date().toISOString(),
      customerId: null,
      payments: [{ method: "cash", amount: 10 }],
      discount: null,
      vatPercent: null,
      items: [
        { variantId: 1, quantity: 1, unitPrice: 10, discount: null },
      ],
    });
    assert.equal(sale.status, 403);
    // Restore.
    const restore = await api(owner, "PATCH", `/api/roles/${cashierRoleId}`, {
      permissionKeys: ["pos.view", "pos.create_sale", "sales.view", "products.view", "inventory.view", "customers.view", "customers.create"],
    });
    assert.equal(restore.status, 200);
  });

  it("scenario 7: multiple roles combine permissions", async () => {
    // Manager holds manager + accountant: can create purchases (manager)
    // AND view profit reports (accountant), but cannot manage users.
    const purchases = await api(manager, "GET", "/api/purchases");
    assert.equal(purchases.status, 200);
    const profit = await api(manager, "GET", "/api/reports/financial/profit");
    assert.equal(profit.status, 200);
    const usersList = await api(manager, "GET", "/api/users");
    assert.equal(usersList.status, 403);
  });

  it("scenario 8: deactivating a user kills their access immediately", async () => {
    const deactivated = await api(owner, "PATCH", `/api/users/${cashier.userId}`, {
      isActive: false,
    });
    assert.equal(deactivated.status, 200);
    const denied = await api(cashier, "GET", "/api/products");
    assert.equal(denied.status, 401);
    const reactivated = await api(owner, "PATCH", `/api/users/${cashier.userId}`, {
      isActive: true,
    });
    assert.equal(reactivated.status, 200);
    const allowed = await api(cashier, "GET", "/api/products");
    assert.equal(allowed.status, 200);
  });

  it("scenario 9: deleting a role that is still assigned is blocked", async () => {
    // System roles can never be deleted at all.
    const delSystem = await api(owner, "DELETE", `/api/roles/${cashierRoleId}`);
    assert.equal(delSystem.status, 403);
    // A custom role with assignments is blocked with a conflict.
    const created = await api(owner, "POST", "/api/roles", {
      name: `Assigned Role ${Date.now()}`,
      permissionKeys: ["products.view"],
    });
    assert.equal(created.status, 201);
    const roleId = payload<{ data: { id: number } }>(created).data.id;
    const assigned = await api(owner, "PATCH", `/api/users/${cashier.userId}`, {
      roleIds: [cashierRoleId, roleId],
    });
    assert.equal(assigned.status, 200);
    const del = await api(owner, "DELETE", `/api/roles/${roleId}`);
    assert.equal(del.status, 409);
    const unassign = await api(owner, "PATCH", `/api/users/${cashier.userId}`, {
      roleIds: [cashierRoleId],
    });
    assert.equal(unassign.status, 200);
    const cleanup = await api(owner, "DELETE", `/api/roles/${roleId}`);
    assert.equal(cleanup.status, 200);
  });

  it("owner role is immutable; default roles cannot be renamed or deleted", async () => {
    const rolesRes = await api(owner, "GET", "/api/roles");
    const ownerRole = rolesBody(rolesRes).find((r: any) => r.slug === "owner");
    const patchOwner = await api(owner, "PATCH", `/api/roles/${ownerRole.id}`, {
      permissionKeys: ["dashboard.view"],
    });
    assert.equal(patchOwner.status, 403);
    const delOwner = await api(owner, "DELETE", `/api/roles/${ownerRole.id}`);
    assert.equal(delOwner.status, 403);

    const patchManager = await api(owner, "PATCH", `/api/roles/${managerRoleId}`, {
      name: "Renamed Manager",
    });
    assert.equal(patchManager.status, 400);
    const delManager = await api(owner, "DELETE", `/api/roles/${managerRoleId}`);
    assert.equal(delManager.status, 403);
  });

  it("custom role CRUD works end to end", async () => {
    const created = await api(owner, "POST", "/api/roles", {
      name: `Inventory Manager ${Date.now()}`,
      permissionKeys: ["products.view", "products.edit", "inventory.view", "inventory.adjust"],
    });
    assert.equal(created.status, 201);
    const roleId = payload<{ data: { id: number } }>(created).data.id;

    const listed = await api(owner, "GET", "/api/roles");
    const found = rolesBody(listed).find((r: any) => r.id === roleId);
    assert.ok(found);
    assert.equal(found.userCount, 0);

    const updated = await api(owner, "PATCH", `/api/roles/${roleId}`, {
      permissionKeys: ["products.view", "inventory.view"],
    });
    assert.equal(updated.status, 200);
    assert.deepEqual(
      payload<{ data: { permissionKeys: string[] } }>(updated).data.permissionKeys.sort(),
      [
      "inventory.view",
      "products.view",
    ]);

    const deleted = await api(owner, "DELETE", `/api/roles/${roleId}`);
    assert.equal(deleted.status, 200);
  });

  it("unknown permission keys are rejected", async () => {
    const bad = await api(owner, "POST", "/api/roles", {
      name: `Bad Role ${Date.now()}`,
      permissionKeys: ["not.a.permission"],
    });
    assert.equal(bad.status, 400);
  });

  it("cashier cannot reset passwords or edit members; owner can", async () => {
    const denied = await api(
      cashier,
      "POST",
      `/api/users/${cashier.userId}/reset-password`,
      { password: "another-password-123" },
    );
    assert.equal(denied.status, 403);

    const reset = await api(
      owner,
      "POST",
      `/api/users/${cashier.userId}/reset-password`,
      { password: "another-password-123" },
    );
    assert.equal(reset.status, 200);
    const relogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cashier.email,
        password: "another-password-123",
      }),
    });
    assert.equal(relogin.status, 200);
  });

  it("scenario 10: cost fields are stripped for callers without products.view_cost", async () => {
    const asCashier = await api(cashier, "GET", "/api/products");
    assert.equal(asCashier.status, 200);
    const cashierPayload = JSON.stringify(asCashier.body);
    assert.ok(
      !cashierPayload.includes("purchaseCost") &&
        !cashierPayload.includes("purchasePrice"),
      "cost fields leaked to cashier",
    );
    const asOwner = await api(owner, "GET", "/api/products");
    assert.equal(asOwner.status, 200);
    void asOwner;
  });

  it("cart discounts require pos.apply_discount", async () => {
    // Create a real product+variant so the sale passes validation once the
    // permission is present; a 400/404 would mean the guard passed.
    const saleWithDiscount = {
      saleDate: new Date().toISOString(),
      customerId: null,
      payments: [{ method: "cash", amount: 100 }],
      discount: { type: "percentage", value: 10 },
      vatPercent: null,
      items: [{ variantId: 999999, quantity: 1, unitPrice: 100, discount: null }],
    };
    const cashierAttempt = await api(cashier, "POST", "/api/sales", saleWithDiscount);
    assert.equal(cashierAttempt.status, 403);

    const ownerAttempt = await api(owner, "POST", "/api/sales", saleWithDiscount);
    // Owner passes the permission gate; validation may 404 on the unknown
    // variant — but never 403.
    assert.notEqual(ownerAttempt.status, 403);
  });

  it("users list shows roles and member data for the owner", async () => {
    const list = await api(owner, "GET", "/api/users");
    assert.equal(list.status, 200);
    const members = payload<{ data: any[] }>(list).data;
    const ownerMember = members.find((m: any) => m.userId === owner.userId);
    assert.ok(ownerMember.roles.some((r: any) => r.slug === "owner"));
    const cashierMember = members.find((m: any) => m.userId === cashier.userId);
    assert.ok(cashierMember.roles.some((r: any) => r.slug === "cashier"));
  });

  it("unauthenticated requests get 401, not 403", async () => {
    const res = await fetch(`${baseUrl}/api/roles`, {
      headers: { "X-Business-Id": String(owner.businessId) },
    });
    assert.equal(res.status, 401);
    const resUsers = await fetch(`${baseUrl}/api/users`, {
      headers: { "X-Business-Id": String(owner.businessId) },
    });
    assert.equal(resUsers.status, 401);
  });
});
