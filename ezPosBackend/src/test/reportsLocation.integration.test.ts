/**
 * Location-aware reporting integration tests (Phase 5).
 *
 * They exercise the ?locationId filter on reports (all/specific/foreign),
 * the location comparison endpoint, and register session summaries —
 * against a REAL PostgreSQL database. Double-guarded like the other suites:
 * runs ONLY with INTEGRATION_TESTS=1 AND DATABASE_URL pointing at
 * ezpos_test (fail-closed).
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

describe("reports location integration", { skip: !runIntegration }, () => {
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
           features = '{"multiLocation":true,"advancedReports":true}'::jsonb,
           is_active = true`,
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
    `rloc-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;

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
    locationId?: number,
  ): Promise<{ status: number; body: any }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ctx.token}`,
      "X-Business-Id": String(ctx.businessId),
    };
    if (locationId !== undefined) {
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

  function payload<T>(res: { body: unknown }): T {
    return res.body as T;
  }

  async function registerAndCreateBusiness(
    email: string,
    businessName: string,
  ): Promise<Ctx> {
    const reg = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Report Test",
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

  const stamp = Date.now();
  let owner: Ctx;
  let locationA = 0;
  let locationB = 0;
  let variantId = 0;

  async function makeSale(
    ctx: Ctx,
    locationId: number,
    quantity: number,
  ): Promise<void> {
    const res = await api(
      ctx,
      "POST",
      "/api/sales",
      {
        saleDate: new Date().toISOString(),
        customerId: null,
        payments: [{ method: "cash", amount: quantity * 100 }],
        discount: null,
        vatPercent: null,
        items: [{ variantId, quantity, unitPrice: 100, discount: null }],
      },
      locationId,
    );
    assert.equal(res.status, 201, JSON.stringify(res.body));
  }

  before(async () => {
    owner = await registerAndCreateBusiness(
      `rloc-owner-${stamp}@example.test`,
      `Report Loc Biz ${stamp}`,
    );
    const a = await api(owner, "POST", "/api/locations", { name: `Rep A ${stamp}` });
    locationA = payload<{ data: { id: number } }>(a).data.id;
    const b = await api(owner, "POST", "/api/locations", { name: `Rep B ${stamp}` });
    locationB = payload<{ data: { id: number } }>(b).data.id;

    const unitRes = await api(owner, "POST", "/api/product/unit", {
      unitName: `Piece ${stamp}`,
      abbreviation: "Pcs",
    });
    const unitId = payload<{ data: { value: number } }>(unitRes).data.value;
    const product = await api(owner, "POST", "/api/product", {
      name: `Report Cola ${stamp}`,
      categoryId: null,
      brandId: null,
      unitId,
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
          sku: `RLOC-${stamp}`,
          barcode: null,
          sellingPrice: 100,
          alertQuantity: 5,
          isDefault: true,
          status: "active",
          imageUrl: null,
          imageFile: null,
          batchNumber: `BATCH-${stamp}`,
          purchasePrice: 40,
          quantity: 1000,
          expiryDate: null,
        },
      ],
    });
    assert.equal(product.status, 201);
    const list = await api(owner, "GET", "/api/products");
    const created = (
      list.body as { name: string; variants: { id: number }[] }[]
    ).find((p) => p.name === `Report Cola ${stamp}`);
    assert.ok(created);
    variantId = created.variants[0]!.id;

    // Transfer 200 units A → B so both locations sell.
    const transfer = await api(owner, "POST", "/api/stock-transfers", {
      fromLocationId: locationA,
      toLocationId: locationB,
      items: [{ variantId, quantity: 200 }],
    });
    const transferId = payload<{ data: { id: number } }>(transfer).data.id;
    await api(owner, "POST", `/api/stock-transfers/${transferId}/ship`);
    const received = await api(
      owner,
      "POST",
      `/api/stock-transfers/${transferId}/receive`,
      {},
    );
    assert.equal(received.status, 200);

    // One sale at each location.
    await makeSale(owner, locationA, 5); // 500 at A
    await makeSale(owner, locationB, 3); // 300 at B
  });

  it("sales summary respects the location filter", async () => {
    const base = `/api/reports/sales/summary?startDate=2020-01-01&endDate=2030-12-31`;

    const all = await api(owner, "GET", base);
    assert.equal(all.status, 200);
    const allTotals = payload<{ data: { totals: { total_invoices: number } } }>(all)
      .data.totals;
    assert.equal(Number(allTotals.total_invoices), 2);

    const onlyA = await api(owner, "GET", `${base}&locationId=${locationA}`);
    const onlyB = await api(owner, "GET", `${base}&locationId=${locationB}`);
    assert.equal(
      Number(payload<{ data: { totals: { total_invoices: number } } }>(onlyA).data.totals.total_invoices),
      1,
    );
    assert.equal(
      Number(payload<{ data: { totals: { total_invoices: number } } }>(onlyB).data.totals.total_invoices),
      1,
    );

    const grossA = Number(
      payload<{ data: { totals: { total_gross_sales: number } } }>(onlyA).data.totals
        .total_gross_sales,
    );
    const grossB = Number(
      payload<{ data: { totals: { total_gross_sales: number } } }>(onlyB).data.totals
        .total_gross_sales,
    );
    assert.equal(grossA, 500);
    assert.equal(grossB, 300);
  });

  it("a staff member cannot filter a report to an unassigned location", async () => {
    // Cashier assigned ONLY to location A.
    const roles = await api(owner, "GET", "/api/roles");
    const cashierRole = payload<{ data: { id: number; slug: string }[] }>(roles).data.find(
      (r) => r.slug === "cashier",
    );
    assert.ok(cashierRole);
    const email = `rloc-cashier-${stamp}@example.test`;
    const created = await api(owner, "POST", "/api/users", {
      fullName: "Report Cashier",
      email,
      password: "strong-password-123",
      roleIds: [cashierRole.id],
      locationIds: [locationA],
    });
    assert.equal(created.status, 201);
    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "strong-password-123" }),
    });
    assert.equal(login.status, 200);
    const cashier: Ctx = {
      token: ((await login.json()) as { accessToken: string }).accessToken,
      businessId: owner.businessId,
      userId: payload<{ data: { userId: number } }>(created).data.userId,
      email,
    };

    // Cashier lacks reports.sales.view at all.
    const deniedAny = await api(cashier, "GET", `/api/reports/sales/summary`);
    assert.equal(deniedAny.status, 403);

    // Give a report-capable custom role but keep location scope at A only.
    const custom = await api(owner, "POST", "/api/roles", {
      name: `Report Viewer ${stamp}`,
      permissionKeys: ["reports.sales.view"],
    });
    const roleId = payload<{ data: { id: number } }>(custom).data.id;
    const patch = await api(owner, "PATCH", `/api/users/${cashier.userId}`, {
      roleIds: [roleId],
      locationIds: [locationA],
    });
    assert.equal(patch.status, 200);

    const allowedA = await api(
      cashier,
      "GET",
      `/api/reports/sales/summary?locationId=${locationA}`,
    );
    assert.equal(allowedA.status, 200);
    const deniedB = await api(
      cashier,
      "GET",
      `/api/reports/sales/summary?locationId=${locationB}`,
    );
    assert.equal(deniedB.status, 403);
  });

  it("location comparison lists every location with its own numbers", async () => {
    const res = await api(
      owner,
      "GET",
      `/api/reports/locations/comparison?startDate=2020-01-01&endDate=2030-12-31`,
    );
    assert.equal(res.status, 200);
    const data = payload<{
      data: {
        rows: {
          locationId: number;
          invoiceCount: number;
          net: number;
          expenses: number;
        }[];
        totals: { net: number; invoiceCount: number };
      };
    }>(res).data;

    const rowA = data.rows.find((r) => r.locationId === locationA);
    const rowB = data.rows.find((r) => r.locationId === locationB);
    assert.ok(rowA);
    assert.ok(rowB);
    assert.equal(rowA.invoiceCount, 1);
    assert.equal(rowB.invoiceCount, 1);
    assert.equal(rowA.net, 500);
    assert.equal(rowB.net, 300);
    assert.equal(data.totals.invoiceCount, 2);
    assert.equal(data.totals.net, 800);
  });

  it("register summaries report closed sessions and variance", async () => {
    // Open a session at A, take a cash sale, close with a shortage.
    const createdRegister = await api(owner, "POST", "/api/registers", { name: "Front Counter" }, locationA);
    assert.equal(createdRegister.status, 201, JSON.stringify(createdRegister.body));
    const registerId = payload<{ data: { id: number } }>(createdRegister).data.id;
    const opened = await api(
      owner,
      "POST",
      `/api/registers/${registerId}/open`,
      { openingCash: 1000 },
      locationA,
    );
    const sessionId = payload<{ data: { id: number } }>(opened).data.id;
    await makeSale(owner, locationA, 2); // +200 cash
    const closed = await api(
      owner,
      "POST",
      `/api/sessions/${sessionId}/close`,
      { countedCash: 1100 },
      locationA,
    );
    assert.equal(closed.status, 200);

    const report = await api(
      owner,
      "GET",
      `/api/reports/registers?startDate=2020-01-01&endDate=2030-12-31`,
    );
    assert.equal(report.status, 200);
    const data = payload<{
      data: {
        rows: {
          sessionId: number;
          difference: number | null;
          cashSales: number;
          status: string;
        }[];
        totals: { difference: number; cashSales: number; sessionCount: number };
      };
    }>(report).data;
    const row = data.rows.find((r) => r.sessionId === sessionId);
    assert.ok(row);
    assert.equal(row.status, "closed");
    assert.equal(row.cashSales, 200);
    assert.equal(row.difference, -100); // expected 1200, counted 1100
    assert.equal(data.totals.difference, -100);

    // Without reports.financial.view the endpoint is forbidden (cashier role).
    const roles = await api(owner, "GET", "/api/roles");
    const cashierRole = payload<{ data: { id: number; slug: string }[] }>(roles).data.find(
      (r) => r.slug === "cashier",
    );
    assert.ok(cashierRole);
    const email = `rloc-nofin-${stamp}@example.test`;
    const created = await api(owner, "POST", "/api/users", {
      fullName: "No Fin",
      email,
      password: "strong-password-123",
      roleIds: [cashierRole.id],
      locationIds: [locationA],
    });
    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "strong-password-123" }),
    });
    const nofin: Ctx = {
      token: ((await login.json()) as { accessToken: string }).accessToken,
      businessId: owner.businessId,
      userId: payload<{ data: { userId: number } }>(created).data.userId,
      email,
    };
    const denied = await api(
      nofin,
      "GET",
      `/api/reports/registers?startDate=2020-01-01&endDate=2030-12-31`,
    );
    assert.equal(denied.status, 403);
  });
});
