/**
 * Multi-location foundation integration tests (Phase 1).
 *
 * They exercise the location layer — default resolution, the X-Location-Id
 * header, assignment checks, cross-business isolation, deactivation and
 * delete protection — against a REAL PostgreSQL database. Double-guarded:
 * they run ONLY when BOTH conditions hold —
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

describe("locations integration", { skip: !runIntegration }, () => {
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
       ON CONFLICT (slug) DO NOTHING`,
    );
    await client.end();

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
    `loc-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;

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
    locationId?: number | null,
  ): Promise<{ status: number; body: unknown }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ctx.token}`,
      "X-Business-Id": String(ctx.businessId),
    };
    if (locationId !== undefined && locationId !== null) {
      headers["X-Location-Id"] = String(locationId);
    }
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
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

  async function registerAndCreateBusiness(
    email: string,
    businessName: string,
  ): Promise<Ctx> {
    const reg = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Location Test",
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
    return {
      token: loginBody.accessToken,
      businessId: bizBody.business.id,
      userId: loginBody.user.id,
      email,
    };
  }

  function payload<T>(res: { body: unknown }): T {
    return res.body as T;
  }

  const stamp = Date.now();
  let owner: Ctx;
  let cashier: Ctx;
  let locationA = 0;
  let locationB = 0;

  before(async () => {
    owner = await registerAndCreateBusiness(
      `loc-owner-${stamp}@example.test`,
      `Loc Biz ${stamp}`,
    );
  });

  it("a business without locations cannot record inventory or sales", async () => {
    const res = await api(owner, "POST", "/api/expense_categories", {
      categoryName: "Utilities",
    });
    assert.equal(res.status, 400);
    const message = payload<{ message: string }>(res).message;
    assert.match(message, /no locations/i);
  });

  it("the first location becomes the default; the second does not", async () => {
    const a = await api(owner, "POST", "/api/locations", {
      name: "Dhaka Store",
      locationCode: "DHK",
      locationType: "store",
      city: "Dhaka",
    });
    assert.equal(a.status, 201);
    locationA = payload<{ data: { id: number; isDefault: boolean } }>(a).data.id;
    assert.equal(payload<{ data: { isDefault: boolean } }>(a).data.isDefault, true);

    const b = await api(owner, "POST", "/api/locations", {
      name: "Rangpur Store",
      locationCode: "RNG",
      locationType: "store",
    });
    assert.equal(b.status, 201);
    locationB = payload<{ data: { id: number; isDefault: boolean } }>(b).data.id;
    assert.equal(payload<{ data: { isDefault: boolean } }>(b).data.isDefault, false);
  });

  it("location codes are unique per business", async () => {
    const dup = await api(owner, "POST", "/api/locations", {
      name: "Another",
      locationCode: "DHK",
    });
    assert.equal(dup.status, 409);
  });

  it("operations work against the default location without a header", async () => {
    const res = await api(owner, "POST", "/api/expense_categories", {
      categoryName: "Utilities",
    });
    assert.equal(res.status, 201);
  });

  it("cross-business location ids are rejected", async () => {
    const other = await registerAndCreateBusiness(
      `loc-other-${stamp}@example.test`,
      `Loc Other ${stamp}`,
    );
    // other business has no locations; use owner's location A there.
    const res = await api(other, "GET", "/api/products", undefined, locationA);
    assert.equal(res.status, 400);
  });

  it("unknown location ids are rejected", async () => {
    const res = await api(owner, "GET", "/api/products", undefined, 99999999);
    assert.equal(res.status, 400);
  });

  it("staff without an assignment cannot access any location", async () => {
    // Create the cashier (needs a valid role).
    const roles = await api(owner, "GET", "/api/roles");
    const cashierRole = payload<{ data: { id: number; slug: string }[] }>(roles).data.find(
      (r) => r.slug === "cashier",
    );
    assert.ok(cashierRole);
    const email = `loc-cashier-${stamp}@example.test`;
    const created = await api(owner, "POST", "/api/users", {
      fullName: "Loc Cashier",
      email,
      password: "strong-password-123",
      roleIds: [cashierRole.id],
    });
    assert.equal(created.status, 201);

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
    cashier = {
      token: loginBody.accessToken,
      businessId: owner.businessId,
      userId: loginBody.user.id,
      email,
    };

    const deniedDefault = await api(cashier, "GET", "/api/products");
    assert.equal(deniedDefault.status, 403);
    const deniedA = await api(cashier, "GET", "/api/products", undefined, locationA);
    assert.equal(deniedA.status, 403);
  });

  it("an assigned cashier can access their location but not the other", async () => {
    const assigned = await api(owner, "PATCH", `/api/users/${cashier.userId}`, {
      locationIds: [locationA],
    });
    assert.equal(assigned.status, 200);

    const okA = await api(cashier, "GET", "/api/products", undefined, locationA);
    assert.equal(okA.status, 200);

    const deniedB = await api(cashier, "GET", "/api/products", undefined, locationB);
    assert.equal(deniedB.status, 403);

    // Accessible-locations reflects the assignment.
    const accessible = await api(cashier, "GET", "/api/accessible-locations");
    assert.equal(accessible.status, 200);
    const ids = payload<{ data: { id: number }[] }>(accessible).data.map((l) => l.id);
    assert.deepEqual(ids.sort(), [locationA]);

    const ownerAccessible = await api(owner, "GET", "/api/accessible-locations");
    const ownerIds = payload<{ data: { id: number }[] }>(ownerAccessible).data.map(
      (l) => l.id,
    );
    assert.equal(ownerIds.length, 2);
  });

  it("deactivated locations cannot be used", async () => {
    const patched = await api(owner, "PATCH", `/api/locations/${locationB}`, {
      status: "inactive",
    });
    assert.equal(patched.status, 200);
    const res = await api(owner, "GET", "/api/products", undefined, locationB);
    assert.equal(res.status, 400);
    const message = payload<{ message: string }>(res).message;
    assert.match(message, /deactivated/i);
    // Reactivate for later tests.
    await api(owner, "PATCH", `/api/locations/${locationB}`, {
      status: "active",
    });
  });

  it("a location holding transactions cannot be deleted", async () => {
    // The default location A now holds an expense category write (201 above
    // used the default). Record an expense against A to create history.
    const cats = await api(owner, "GET", "/api/expense_categories");
    const categories = Array.isArray(cats.body)
      ? (cats.body as { id: number }[])
      : payload<{ data: { id: number }[] }>(cats).data;
    const categoryId = categories[0]?.id ?? null;
    assert.ok(categoryId);
    const expense = await api(owner, "POST", "/api/expenses", {
      title: "location delete guard",
      expense_date: new Date().toISOString().slice(0, 10),
      amount: 100,
      category_id: categoryId,
      payment_method: "Cash",
    });
    assert.equal(expense.status, 201);

    const del = await api(owner, "DELETE", `/api/locations/${locationA}`);
    assert.equal(del.status, 409);
  });

  it("a location without history can be deleted", async () => {
    const c = await api(owner, "POST", "/api/locations", {
      name: "Temporary Outlet",
      locationCode: "TMP",
      locationType: "outlet",
    });
    assert.equal(c.status, 201);
    const id = payload<{ data: { id: number } }>(c).data.id;
    const del = await api(owner, "DELETE", `/api/locations/${id}`);
    assert.equal(del.status, 200);
  });

  it("location assignment with a foreign location id is rejected", async () => {
    const other = await registerAndCreateBusiness(
      `loc-foreign-${stamp}@example.test`,
      `Loc Foreign ${stamp}`,
    );
    const foreignLocation = await api(other, "POST", "/api/locations", {
      name: "Foreign Store",
    });
    const foreignId = payload<{ data: { id: number } }>(foreignLocation).data.id;
    const res = await api(owner, "PATCH", `/api/users/${cashier.userId}`, {
      locationIds: [foreignId],
    });
    assert.equal(res.status, 400);
  });

  it("changing the default location moves the fallback", async () => {
    const moved = await api(owner, "PATCH", `/api/locations/${locationB}`, {
      isDefault: true,
    });
    assert.equal(moved.status, 200);
    const list = await api(owner, "GET", "/api/locations");
    const rows = payload<{ data: { id: number; isDefault: boolean }[] }>(list).data;
    assert.equal(rows.find((r) => r.id === locationA)?.isDefault, false);
    assert.equal(rows.find((r) => r.id === locationB)?.isDefault, true);
    // Restore A as default.
    await api(owner, "PATCH", `/api/locations/${locationA}`, { isDefault: true });
  });
});
