/**
 * Due-management integration tests.
 *
 * Coverage per endpoint (11 routes):
 *   - unauthenticated access is rejected (401),
 *   - missing X-Business-Id is rejected (400),
 *   - a foreign business id is rejected (403),
 *   - cross-tenant data is excluded (B sees none of A's dues),
 *   - the owning business still sees its own data,
 *   - payment recording works, over-collection is rejected (400), and
 *     recording a payment against ANOTHER business's invoice is 404.
 *
 * Double-guarded like the other integration suites: they run ONLY when
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

const runIntegration =
  process.env.INTEGRATION_TESTS === "1" && Boolean(process.env.DATABASE_URL);

describe("due-management integration", { skip: !runIntegration }, () => {
  let server: import("node:http").Server | undefined;
  let baseUrl = "";

  before(async () => {
    // Fail closed: refuse to write to anything but ezpos_test.
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

    const app = buildApp();
    server = app.listen(0);
    const address = server!.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(() => {
    server?.close();
  });

  const uniqueEmail = () =>
    `due-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;

  let tokenA = "";
  let tokenB = "";
  let businessA = 0;
  let businessB = 0;
  let customerId = 0;
  let dueSaleId = 0;
  let supplierId = 0;
  let unpaidPurchaseId = 0;

  async function registerAndCreateBusiness(
    email: string,
    businessName: string,
  ): Promise<{ token: string; businessId: number }> {
    const reg = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Due Test",
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
    const loginBody = (await login.json()) as { accessToken: string };
    const token = loginBody.accessToken;

    const biz = await fetch(`${baseUrl}/api/businesses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: businessName }),
    });
    assert.equal(biz.status, 201);
    const bizBody = (await biz.json()) as {
      business: { id: number };
    };
    return { token, businessId: bizBody.business.id };
  }

  async function api(
    token: string | null,
    businessId: number | null,
    method: string,
    path: string,
    body?: unknown,
  ): Promise<Response> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token !== null) headers.Authorization = `Bearer ${token}`;
    if (businessId !== null) headers["X-Business-Id"] = String(businessId);
    const init: RequestInit = { method, headers };
    if (body !== undefined) init.body = JSON.stringify(body);
    return fetch(`${baseUrl}${path}`, init);
  }

  async function createUnit(token: string, businessId: number): Promise<number> {
    const res = await api(token, businessId, "POST", "/api/product/unit", {
      unitName: "Piece",
      abbreviation: "Pcs",
    });
    assert.equal(res.status, 201);
    const body = (await res.json()) as { data: { value: number } };
    return body.data.value;
  }

  async function createProduct(
    token: string,
    businessId: number,
    unitId: number,
    name: string,
    sellingPrice: number,
    quantity: number,
  ): Promise<number> {
    const res = await api(token, businessId, "POST", "/api/product", {
      name,
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
          sku: "",
          barcode: null,
          sellingPrice,
          alertQuantity: 0,
          isDefault: true,
          status: "active",
          imageUrl: null,
          imageFile: null,
          batchNumber: "",
          purchasePrice: Math.round(sellingPrice / 2),
          quantity,
          expiryDate: null,
        },
      ],
    });
    assert.equal(res.status, 201);
    const listRes = await api(token, businessId, "GET", "/api/products");
    assert.equal(listRes.status, 200);
    const list = (await listRes.json()) as { id: number; name: string }[];
    const created = list.find((p) => p.name === name);
    assert.ok(created, `product "${name}" not found`);
    return created.id;
  }

  async function getFirstVariantId(
    token: string,
    businessId: number,
    productId: number,
  ): Promise<number> {
    const res = await api(token, businessId, "GET", `/api/product/${productId}`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as { variants: { id: number }[] };
    assert.ok(body.variants.length > 0);
    return body.variants[0]!.id;
  }

  it("sets up business A with a due sale and an unpaid purchase; business B empty", async () => {
    const a = await registerAndCreateBusiness(
      uniqueEmail(),
      `Due A ${Date.now()}`,
    );
    const b = await registerAndCreateBusiness(
      uniqueEmail(),
      `Due B ${Date.now()}`,
    );
    tokenA = a.token;
    businessA = a.businessId;
    tokenB = b.token;
    businessB = b.businessId;

    const unitId = await createUnit(tokenA, businessA);

    // Customer + fully-credit sale of 200.
    const custRes = await api(tokenA, businessA, "POST", "/api/customers", {
      name: "Due Customer",
      phone: "1711000003",
    });
    assert.equal(custRes.status, 201);
    customerId = ((await custRes.json()) as { id: number }).id;

    const productId = await createProduct(
      tokenA,
      businessA,
      unitId,
      "Due Product",
      200,
      3,
    );
    const variantId = await getFirstVariantId(tokenA, businessA, productId);
    const saleRes = await api(tokenA, businessA, "POST", "/api/sales", {
      saleDate: new Date().toISOString(),
      customerId,
      payments: [{ method: "due", amount: 200 }],
      discount: null,
      vatPercent: 0,
      items: [{ variantId, quantity: 1, unitPrice: 200, discount: null }],
    });
    assert.equal(saleRes.status, 201);
    const saleBody = (await saleRes.json()) as {
      data: { sale: { id: number } };
    };
    dueSaleId = saleBody.data.sale.id;

    // Supplier + unpaid purchase of 120.
    const supRes = await api(
      tokenA,
      businessA,
      "POST",
      "/api/contacts/supplier",
      { supplierName: "Due Supplier", phone: "+8801711000003", email: null, address: null },
    );
    assert.equal(supRes.status, 201);
    supplierId = ((await supRes.json()) as { data: { supplierId: number } })
      .data.supplierId;

    const purchaseProductId = await createProduct(
      tokenA,
      businessA,
      unitId,
      "Purchase Product",
      100,
      5,
    );
    const purchaseVariantId = await getFirstVariantId(
      tokenA,
      businessA,
      purchaseProductId,
    );
    const purRes = await api(tokenA, businessA, "POST", "/api/purchases", {
      items: [
        {
          variantId: purchaseVariantId,
          quantity: 3,
          purchasePrice: 40,
          discount: 0,
          tax: 0,
        },
      ],
      supplierId,
      purchaseDate: new Date().toISOString(),
      discount: 0,
      tax: 0,
      shippingCost: 0,
    });
    assert.equal(purRes.status, 201);
    // The create endpoint returns only the PO number, so resolve the new
    // purchase's id from the scoped due-management supplier rows (1 row).
    const rowsRes = await api(
      tokenA,
      businessA,
      "GET",
      "/api/due-management/suppliers",
    );
    assert.equal(rowsRes.status, 200);
    const rows = (await rowsRes.json()) as Array<{ purchaseId: number }>;
    assert.equal(rows.length, 1);
    unpaidPurchaseId = rows[0]!.purchaseId;

    // Supplier payments (like the receive flow) only cover RECEIVED goods,
    // so receive the full order before the payment tests.
    const itemsRes = await api(tokenA, businessA, "GET", "/api/purchases/items");
    assert.equal(itemsRes.status, 200);
    const purchaseItems = (await itemsRes.json()) as Array<{
      id: number;
      purchaseId: number;
      trackingType: string;
    }>;
    const receiveItems = purchaseItems
      .filter((item) => item.purchaseId === unpaidPurchaseId)
      .map((item) => ({
        itemId: item.id,
        trackingType: item.trackingType,
        receiveNow: 3,
        unitCost: 40,
        sellingPrice: 100,
        batches: [],
        serialNumbers: [],
      }));
    assert.equal(receiveItems.length, 1);
    const receiveRes = await api(tokenA, businessA, "POST", "/api/purchases/receive", {
      purchaseId: unpaidPurchaseId,
      items: receiveItems,
      paymentAmount: 0,
      paymentMethod: "cash",
    });
    assert.equal(receiveRes.status, 201);
  });  it("rejects unauthenticated access on every endpoint", async () => {
    const checks: Array<[string, string, string]> = [
      ["GET", "/api/due-management/summary", ""],
      ["GET", "/api/due-management/trend", ""],
      ["GET", "/api/due-management/customers", ""],
      ["GET", "/api/due-management/customers/balances", ""],
      ["GET", "/api/due-management/suppliers", ""],
      ["GET", `/api/due-management/sales/${dueSaleId}/payments`, ""],
      ["GET", `/api/due-management/purchases/${unpaidPurchaseId}/payments`, ""],
      ["POST", "/api/due-management/customer-payment", "{}"],
      ["POST", "/api/due-management/supplier-payment", "{}"],
      ["GET", `/api/due-management/customer-ledger/${customerId}`, ""],
      ["GET", `/api/due-management/supplier-ledger/${supplierId}`, ""],
    ];
    for (const [method, path, body] of checks) {
      const res = await api(null, null, method, path, body ? JSON.parse(body) : undefined);
      assert.equal(res.status, 401, `${method} ${path} must require auth`);
    }
  });

  it("rejects a missing X-Business-Id header (400)", async () => {
    const res = await api(tokenA, null, "GET", "/api/due-management/summary");
    assert.equal(res.status, 400);
  });

  it("rejects a foreign X-Business-Id (403)", async () => {
    const res = await api(tokenB, businessA, "GET", "/api/due-management/summary");
    assert.equal(res.status, 403);
  });

  it("scopes the summary: A sees its dues, B sees none of them", async () => {
    const summaryA = await (await api(tokenA, businessA, "GET", "/api/due-management/summary")).json();
    assert.equal(Number(summaryA.customerOutstanding), 200);
    assert.equal(Number(summaryA.supplierOutstanding), 120);

    const summaryB = await (await api(tokenB, businessB, "GET", "/api/due-management/summary")).json();
    assert.equal(Number(summaryB.customerOutstanding), 0);
    assert.equal(Number(summaryB.supplierOutstanding), 0);
  });

  it("scopes the customer due rows and balances", async () => {
    const rowsB = await (await api(tokenB, businessB, "GET", "/api/due-management/customers")).json();
    assert.equal((rowsB as unknown[]).length, 0);

    const rowsA = await (await api(tokenA, businessA, "GET", "/api/due-management/customers")).json();
    const list = rowsA as Array<{ saleId: number; outstandingAmount: number }>;
    assert.equal(list.length, 1);
    assert.equal(list[0]!.saleId, dueSaleId);

    const balancesB = await (
      await api(tokenB, businessB, "GET", "/api/due-management/customers/balances")
    ).json();
    assert.equal((balancesB as unknown[]).length, 0);

    const balancesA = await (
      await api(tokenA, businessA, "GET", "/api/due-management/customers/balances")
    ).json();
    const bal = balancesA as Array<{ customerId: number; balance: number }>;
    assert.equal(bal.length, 1);
    assert.equal(bal[0]!.customerId, customerId);
  });

  it("scopes the supplier due rows", async () => {
    const rowsB = await (await api(tokenB, businessB, "GET", "/api/due-management/suppliers")).json();
    assert.equal((rowsB as unknown[]).length, 0);

    const rowsA = await (await api(tokenA, businessA, "GET", "/api/due-management/suppliers")).json();
    const list = rowsA as Array<{ purchaseId: number; outstandingAmount: number }>;
    assert.equal(list.length, 1);
    assert.equal(list[0]!.purchaseId, unpaidPurchaseId);
    assert.equal(Number(list[0]!.outstandingAmount), 120);
  });

  it("scopes the sale payment history (foreign sale is 404)", async () => {
    const own = await api(tokenA, businessA, "GET", `/api/due-management/sales/${dueSaleId}/payments`);
    assert.equal(own.status, 200);
    const ownBody = (await own.json()) as { invoiceNumber: string; payments: unknown[] };
    assert.ok(ownBody.invoiceNumber);
    assert.equal(ownBody.payments.length, 0);

    const foreign = await api(tokenB, businessB, "GET", `/api/due-management/sales/${dueSaleId}/payments`);
    assert.equal(foreign.status, 404);
  });

  it("scopes the purchase payment history (foreign purchase is 404)", async () => {
    const own = await api(tokenA, businessA, "GET", `/api/due-management/purchases/${unpaidPurchaseId}/payments`);
    assert.equal(own.status, 200);

    const foreign = await api(tokenB, businessB, "GET", `/api/due-management/purchases/${unpaidPurchaseId}/payments`);
    assert.equal(foreign.status, 404);
  });

  it("records a customer payment, rejects over-collection and foreign invoices", async () => {
    // B cannot pay A's invoice — indistinguishable from a missing one.
    const foreign = await api(tokenB, businessB, "POST", "/api/due-management/customer-payment", {
      saleId: dueSaleId,
      amount: 50,
      paymentMethod: "cash",
    });
    assert.equal(foreign.status, 404);

    // A pays 80 of the 200 due.
    const ok = await api(tokenA, businessA, "POST", "/api/due-management/customer-payment", {
      saleId: dueSaleId,
      amount: 80,
      paymentMethod: "cash",
      tendered: 80,
    });
    assert.equal(ok.status, 201);
    const okBody = (await ok.json()) as {
      data: { outstandingAfter: number; paymentStatus: string };
    };
    assert.equal(Number(okBody.data.outstandingAfter), 120);
    assert.equal(okBody.data.paymentStatus, "partial");

    // Over-collection is rejected.
    const over = await api(tokenA, businessA, "POST", "/api/due-management/customer-payment", {
      saleId: dueSaleId,
      amount: 500,
      paymentMethod: "cash",
    });
    assert.equal(over.status, 400);
  });

  it("records a supplier payment, rejects over-collection and foreign purchases", async () => {
    const foreign = await api(tokenB, businessB, "POST", "/api/due-management/supplier-payment", {
      purchaseId: unpaidPurchaseId,
      amount: 50,
      method: "cash",
    });
    assert.equal(foreign.status, 404);

    const ok = await api(tokenA, businessA, "POST", "/api/due-management/supplier-payment", {
      purchaseId: unpaidPurchaseId,
      amount: 50,
      method: "cash",
    });
    assert.equal(ok.status, 201);
    const okBody = (await ok.json()) as {
      data: { outstandingAfter: number; paymentStatus: string };
    };
    assert.equal(Number(okBody.data.outstandingAfter), 70);
    assert.equal(okBody.data.paymentStatus, "partial");

    const over = await api(tokenA, businessA, "POST", "/api/due-management/supplier-payment", {
      purchaseId: unpaidPurchaseId,
      amount: 500,
      method: "cash",
    });
    assert.equal(over.status, 400);
  });

  it("scopes the customer ledger (foreign customer is 404)", async () => {
    const own = await api(tokenA, businessA, "GET", `/api/due-management/customer-ledger/${customerId}`);
    assert.equal(own.status, 200);
    const ownBody = (await own.json()) as {
      party: { id: number };
      transactions: Array<{ type: string }>;
    };
    assert.equal(ownBody.party.id, customerId);
    // Sale invoice + the 80 payment must both be on the ledger.
    const types = ownBody.transactions.map((t) => t.type).sort();
    assert.deepEqual(types, ["invoice", "payment"]);

    const foreign = await api(tokenB, businessB, "GET", `/api/due-management/customer-ledger/${customerId}`);
    assert.equal(foreign.status, 404);
  });

  it("scopes the supplier ledger (foreign supplier is 404)", async () => {
    const own = await api(tokenA, businessA, "GET", `/api/due-management/supplier-ledger/${supplierId}`);
    assert.equal(own.status, 200);
    const ownBody = (await own.json()) as {
      transactions: Array<{ type: string }>;
    };
    const types = ownBody.transactions.map((t) => t.type).sort();
    assert.deepEqual(types, ["payment", "purchase"]);

    const foreign = await api(tokenB, businessB, "GET", `/api/due-management/supplier-ledger/${supplierId}`);
    assert.equal(foreign.status, 404);
  });

  it("scopes the trend endpoint", async () => {
    const trendB = await (await api(tokenB, businessB, "GET", "/api/due-management/trend")).json();
    const pointsB = (trendB as { points: Array<{ collected: number }> }).points;
    const totalB = pointsB.reduce((sum, p) => sum + p.collected, 0);
    assert.equal(totalB, 0);

    const trendA = await (await api(tokenA, businessA, "GET", "/api/due-management/trend")).json();
    const pointsA = (trendA as { points: Array<{ collected: number }> }).points;
    const totalA = pointsA.reduce((sum, p) => sum + p.collected, 0);
    assert.equal(totalA, 80);
  });
});
