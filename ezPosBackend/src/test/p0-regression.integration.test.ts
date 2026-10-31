/**
 * P0 regression integration tests (2026-10-30 audit remediation).
 *
 * Covers:
 *   - Cross-business isolation of the five previously unscoped report
 *     endpoints (payments, expenses, stock movements, purchase summary,
 *     supplier payables).
 *   - Cross-business rejection of category/brand/unit references on the
 *     product PATCH endpoint.
 *   - Category-parent ownership validation on create.
 *   - Serial-to-sale-item linkage: a serial sold once must come back via
 *     refund (the refund path keys off serial_numbers.sale_item_id).
 *   - Checkout rollback: a failed sale must leave consumed serials
 *     available and usable again.
 *
 * They exercise real endpoints against a REAL PostgreSQL database and
 * INSERT records. Double-guarded like the other integration suites: they
 * run ONLY when BOTH conditions hold —
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

describe("P0 regression integration", { skip: !runIntegration }, () => {
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
    // Test fixture (ezpos_test ONLY): seed the trial plan so created
    // businesses get trialing subscriptions and the write paths are
    // exercisable.
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

    const app = buildApp();
    server = app.listen(0);
    const address = server!.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(() => {
    server?.close();
  });

  const uniqueEmail = () =>
    `p0-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;

  let tokenA = "";
  let tokenB = "";
  let businessA = 0;
  let businessB = 0;

  async function registerAndCreateBusiness(
    email: string,
    businessName: string,
  ): Promise<{ token: string; businessId: number }> {
    const reg = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "P0 Test",
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

    // Every business fixture gets a default location: location-scoped
    // endpoints refuse to operate otherwise (Phase 1 location layer).
    const loc = await fetch(`${baseUrl}/api/locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Business-Id": String(bizBody.business.id),
      },
      body: JSON.stringify({ name: "Main Store" }),
    });
    assert.equal(loc.status, 201);

    return { token, businessId: bizBody.business.id };
  }

  async function api(
    token: string,
    businessId: number,
    method: string,
    path: string,
    body?: unknown,
  ): Promise<Response> {
    const init: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Business-Id": String(businessId),
      },
    };
    if (body !== undefined) init.body = JSON.stringify(body);
    return fetch(`${baseUrl}${path}`, init);
  }

  interface UnitPayload {
    unitName: string;
    abbreviation: string;
  }

  interface CategoryPayload {
    categoryName: string;
    parentCategoryId: number | null;
    description: string;
    status: "active" | "inactive";
  }

  interface ProductPayload {
    name: string;
    categoryId: number | null;
    brandId: number | null;
    unitId: number;
    description: string;
    productType: "physical" | "service" | "digital";
    hasVariants: boolean;
    trackingType: "none" | "batch" | "serial";
    supplierId: number | null;
    status: "draft" | "active" | "inactive";
    imageUrl: null;
    imageFile: null;
    source: "opening" | "purchase";
    variants: {
      sku: string;
      barcode: null;
      sellingPrice: number;
      alertQuantity: number;
      isDefault: boolean;
      status: "active" | "inactive";
      imageUrl: null;
      imageFile: null;
      batchNumber: string;
      purchasePrice: number;
      quantity: number;
      expiryDate: null;
      serialNumbers?: { serial: string }[];
    }[];
  }

  async function createUnit(token: string, businessId: number): Promise<number> {
    const payload: UnitPayload = { unitName: "Piece", abbreviation: "Pcs" };
    const res = await api(token, businessId, "POST", "/api/product/unit", payload);
    assert.equal(res.status, 201);
    const body = (await res.json()) as { data: { value: number } };
    return body.data.value;
  }

  async function createProduct(
    token: string,
    businessId: number,
    overrides: Partial<ProductPayload> & { variants: ProductPayload["variants"] },
  ): Promise<number> {
    const payload: ProductPayload = {
      name: "P0 Test Product",
      categoryId: null,
      brandId: null,
      unitId: 0,
      description: "",
      productType: "physical",
      hasVariants: false,
      trackingType: "none",
      supplierId: null,
      status: "active",
      imageUrl: null,
      imageFile: null,
      source: "opening",
      ...overrides,
    };
    const res = await api(token, businessId, "POST", "/api/product", payload);
    assert.equal(res.status, 201);
    // The create endpoint responds with a message only (the service does not
    // return the created row), so resolve the new product's id from the
    // business-scoped list; names are unique inside these fresh businesses.
    const listRes = await api(token, businessId, "GET", "/api/products");
    assert.equal(listRes.status, 200);
    const list = (await listRes.json()) as { id: number; name: string }[];
    const created = list.find((p) => p.name === payload.name);
    assert.ok(created, `created product "${payload.name}" not found in list`);
    return created.id;
  }

  async function getFirstVariantId(
    token: string,
    businessId: number,
    productId: number,
  ): Promise<number> {
    const res = await api(token, businessId, "GET", `/api/product/${productId}`);
    assert.equal(res.status, 200);
    // The controller returns the product object raw (no { data } wrapper).
    const body = (await res.json()) as { variants: { id: number }[] };
    assert.ok(body.variants.length > 0);
    return body.variants[0]!.id;
  }

  async function getAvailableSerials(
    token: string,
    businessId: number,
    variantId: number,
  ): Promise<string[]> {
    const res = await api(
      token,
      businessId,
      "GET",
      `/api/variants/${variantId}/serials`,
    );
    assert.equal(res.status, 200);
    const body = (await res.json()) as { data?: string[] };
    // The controller may wrap the list or return it directly; accept both.
    const list = Array.isArray(body) ? body : (body.data ?? []);
    return list as string[];
  }

  async function createSale(
    token: string,
    businessId: number,
    items: {
      variantId: number;
      quantity: number;
      unitPrice: number;
      discount: null;
      serialNumbers?: string[];
    }[],
    total: number,
  ) {
    const res = await api(token, businessId, "POST", "/api/sales", {
      saleDate: new Date().toISOString(),
      customerId: null,
      payments: [{ method: "cash", amount: total }],
      discount: null,
      vatPercent: 0,
      items,
    });
    return res;
  }

  let unitIdA = 0;
  let serialVariantIdA = 0;
  let simpleVariantIdA = 0;
  let categoryAId = 0;
  let supplierAId = 0;
  let saleAId = 0;

  it("sets up two isolated businesses with products, a sale, an expense and a purchase in A", async () => {
    const a = await registerAndCreateBusiness(
      uniqueEmail(),
      `P0 A ${Date.now()}`,
    );
    const b = await registerAndCreateBusiness(
      uniqueEmail(),
      `P0 B ${Date.now()}`,
    );
    tokenA = a.token;
    businessA = a.businessId;
    tokenB = b.token;
    businessB = b.businessId;
    assert.notEqual(businessA, businessB);

    unitIdA = await createUnit(tokenA, businessA);

    // Serial-tracked product with two serials in stock.
    const serialProductId = await createProduct(tokenA, businessA, {
      name: "Serial Product A",
      unitId: unitIdA,
      trackingType: "serial",
      variants: [
        {
          sku: "",
          barcode: null,
          sellingPrice: 100,
          alertQuantity: 0,
          isDefault: true,
          status: "active",
          imageUrl: null,
          imageFile: null,
          batchNumber: "",
          purchasePrice: 50,
          quantity: 2,
          expiryDate: null,
          serialNumbers: [{ serial: "SN-A-1" }, { serial: "SN-A-2" }],
        },
      ],
    });
    serialVariantIdA = await getFirstVariantId(
      tokenA,
      businessA,
      serialProductId,
    );

    // Simple stocked product for the purchase report.
    const simpleProductId = await createProduct(tokenA, businessA, {
      name: "Simple Product A",
      unitId: unitIdA,
      trackingType: "none",
      variants: [
        {
          sku: "",
          barcode: null,
          sellingPrice: 80,
          alertQuantity: 0,
          isDefault: true,
          status: "active",
          imageUrl: null,
          imageFile: null,
          batchNumber: "",
          purchasePrice: 40,
          quantity: 5,
          expiryDate: null,
        },
      ],
    });
    simpleVariantIdA = await getFirstVariantId(
      tokenA,
      businessA,
      simpleProductId,
    );

    // Category owned by A (used for cross-business reference tests).
    const catRes = await api(tokenA, businessA, "POST", "/api/product/category", {
      categoryName: "Category A",
      parentCategoryId: null,
      description: "",
      status: "active",
    } satisfies CategoryPayload);
    assert.equal(catRes.status, 201);
    const catBody = (await catRes.json()) as { data: { value: number } };
    categoryAId = catBody.data.value;

    // Expense owned by A.
    const expRes = await api(tokenA, businessA, "POST", "/api/expenses", {
      title: "Rent",
      expense_date: new Date().toISOString().slice(0, 10),
      amount: 500,
      category_id: null,
      payment_method: "Cash",
    });
    assert.equal(expRes.status, 201);

    // Supplier + unpaid purchase owned by A.
    const supRes = await api(tokenA, businessA, "POST", "/api/contacts/supplier", {
      supplierName: "Supplier A",
      phone: "+8801711000001",
      email: null,
      address: null,
    });
    assert.equal(supRes.status, 201);
    const supBody = (await supRes.json()) as { data: { supplierId: number } };
    supplierAId = supBody.data.supplierId;

    const purRes = await api(tokenA, businessA, "POST", "/api/purchases", {
      items: [
        {
          variantId: simpleVariantIdA,
          quantity: 3,
          purchasePrice: 40,
          discount: 0,
          tax: 0,
        },
      ],
      supplierId: supplierAId,
      purchaseDate: new Date().toISOString(),
      discount: 0,
      tax: 0,
      shippingCost: 0,
    });
    assert.equal(purRes.status, 201);

    // Sale of one serial (SN-A-1) with a cash payment.
    const saleRes = await createSale(
      tokenA,
      businessA,
      [
        {
          variantId: serialVariantIdA,
          quantity: 1,
          unitPrice: 100,
          discount: null,
          serialNumbers: ["SN-A-1"],
        },
      ],
      100,
    );
    assert.equal(saleRes.status, 201);
    const saleBody = (await saleRes.json()) as {
      data: { sale: { id: number } };
    };
    saleAId = saleBody.data.sale.id;
  });

  it("keeps the five report endpoints cross-business isolated", async () => {
    // Business B must see none of A's data on any of the five endpoints.
    // All report controllers wrap payloads as { success, data }.
    const paymentsB = await api(
      tokenB,
      businessB,
      "GET",
      "/api/reports/sales/payments",
    );
    assert.equal(paymentsB.status, 200);
    assert.equal(
      ((await paymentsB.json()) as { data: unknown[] }).data.length,
      0,
    );

    const expensesB = await api(
      tokenB,
      businessB,
      "GET",
      "/api/reports/financial/expenses",
    );
    assert.equal(expensesB.status, 200);
    assert.equal(
      ((await expensesB.json()) as { data: { total: number } }).data.total,
      0,
    );

    const movementsB = await api(
      tokenB,
      businessB,
      "GET",
      "/api/reports/inventory/movements",
    );
    assert.equal(movementsB.status, 200);
    assert.equal(
      ((await movementsB.json()) as { data: { data: unknown[] } }).data.data
        .length,
      0,
    );

    const summaryB = await api(
      tokenB,
      businessB,
      "GET",
      "/api/reports/purchases/summary",
    );
    assert.equal(summaryB.status, 200);
    const summaryBody = (await summaryB.json()) as {
      data: { totals: { grandTotalAmount: string | number } };
    };
    assert.equal(Number(summaryBody.data.totals.grandTotalAmount), 0);

    const payablesB = await api(
      tokenB,
      businessB,
      "GET",
      "/api/reports/purchases/payables",
    );
    assert.equal(payablesB.status, 200);
    const payablesBody = (await payablesB.json()) as {
      data: { suppliers: unknown[] };
    };
    assert.equal(payablesBody.data.suppliers.length, 0);

    // Business A still sees its own data on all five (correctness, not just
    // suppression).
    const paymentsA = await api(
      tokenA,
      businessA,
      "GET",
      "/api/reports/sales/payments",
    );
    assert.equal(paymentsA.status, 200);
    assert.equal(
      ((await paymentsA.json()) as { data: unknown[] }).data.length,
      1,
    );

    const expensesA = await api(
      tokenA,
      businessA,
      "GET",
      "/api/reports/financial/expenses",
    );
    assert.equal(expensesA.status, 200);
    assert.equal(
      ((await expensesA.json()) as { data: { total: number } }).data.total,
      1,
    );

    const movementsA = await api(
      tokenA,
      businessA,
      "GET",
      "/api/reports/inventory/movements",
    );
    assert.equal(movementsA.status, 200);
    assert.ok(
      ((await movementsA.json()) as { data: { data: unknown[] } }).data.data
        .length >= 1,
    );

    const summaryA = await api(
      tokenA,
      businessA,
      "GET",
      "/api/reports/purchases/summary",
    );
    assert.equal(summaryA.status, 200);
    const summaryABody = (await summaryA.json()) as {
      data: { totals: { grandTotalAmount: string | number } };
    };
    assert.ok(Number(summaryABody.data.totals.grandTotalAmount) > 0);

    const payablesA = await api(
      tokenA,
      businessA,
      "GET",
      "/api/reports/purchases/payables",
    );
    assert.equal(payablesA.status, 200);
    const payablesABody = (await payablesA.json()) as {
      data: { suppliers: unknown[] };
    };
    assert.equal(payablesABody.data.suppliers.length, 1);
  });

  it("rejects a cross-business category reference on product PATCH", async () => {
    // B creates its own category, unit, and product.
    const catRes = await api(tokenB, businessB, "POST", "/api/product/category", {
      categoryName: "Category B",
      parentCategoryId: null,
      description: "",
      status: "active",
    } satisfies CategoryPayload);
    assert.equal(catRes.status, 201);
    const catBody = (await catRes.json()) as { data: { value: number } };

    const unitIdB = await createUnit(tokenB, businessB);
    const productB = await createProduct(tokenB, businessB, {
      name: "Product B",
      categoryId: catBody.data.value,
      unitId: unitIdB,
      trackingType: "none",
      variants: [
        {
          sku: "",
          barcode: null,
          sellingPrice: 10,
          alertQuantity: 0,
          isDefault: true,
          status: "active",
          imageUrl: null,
          imageFile: null,
          batchNumber: "",
          purchasePrice: 5,
          quantity: 1,
          expiryDate: null,
        },
      ],
    });

    // Patching B's product with A's category must be rejected.
    const badRes = await api(
      tokenB,
      businessB,
      "PATCH",
      `/api/products/updated_product/${productB}`,
      { categoryId: categoryAId },
    );
    assert.equal(badRes.status, 404);

    // Patching with B's own category must succeed.
    const okRes = await api(
      tokenB,
      businessB,
      "PATCH",
      `/api/products/updated_product/${productB}`,
      { categoryId: catBody.data.value },
    );
    assert.equal(okRes.status, 200);

    // The PATCH route must update, not duplicate (route-binding regression).
    const listRes = await api(tokenB, businessB, "GET", "/api/products");
    assert.equal(listRes.status, 200);
    const listBody = (await listRes.json()) as { data?: unknown[] };
    const products = Array.isArray(listBody) ? listBody : (listBody.data ?? []);
    assert.equal(products.length, 1);
  });

  it("rejects a cross-business parent category on create", async () => {
    const badRes = await api(tokenB, businessB, "POST", "/api/product/category", {
      categoryName: "Child of A",
      parentCategoryId: categoryAId,
      description: "",
      status: "active",
    } satisfies CategoryPayload);
    assert.equal(badRes.status, 404);
  });

  it("links sold serials to the sale item so refunds restore them", async () => {
    // SN-A-1 was consumed by the fixture sale; only SN-A-2 is available.
    assert.deepEqual(await getAvailableSerials(tokenA, businessA, serialVariantIdA), [
      "SN-A-2",
    ]);

    // Find the sale item id from the fixture sale's receipt.
    const receiptRes = await api(
      tokenA,
      businessA,
      "GET",
      `/api/sales/${saleAId}/receipt`,
    );
    assert.equal(receiptRes.status, 200);
    const receipt = (await receiptRes.json()) as {
      items: { id: number; variantId: number }[];
    };
    const saleItemId = receipt.items[0]!.id;

    // Refund with restock disposition.
    const refundRes = await api(
      tokenA,
      businessA,
      "POST",
      `/api/sold_products/refund/${saleItemId}`,
      { reason: "customer_request", disposition: "restock" },
    );
    assert.equal(refundRes.status, 200);

    // The serial must be back in stock — this only works when the sale
    // linked serial_numbers.sale_item_id (the P0 fix).
    assert.deepEqual(await getAvailableSerials(tokenA, businessA, serialVariantIdA), [
      "SN-A-1",
      "SN-A-2",
    ]);
  });

  it("rolls back serial consumption when checkout fails", async () => {
    // Second item references a nonexistent variant → whole sale fails.
    const badSale = await createSale(
      tokenA,
      businessA,
      [
        {
          variantId: serialVariantIdA,
          quantity: 1,
          unitPrice: 100,
          discount: null,
          serialNumbers: ["SN-A-2"],
        },
        {
          variantId: 99999999,
          quantity: 1,
          unitPrice: 100,
          discount: null,
        },
      ],
      200,
    );
    assert.equal(badSale.status, 404);

    // The consumed serial must still be available.
    assert.deepEqual(await getAvailableSerials(tokenA, businessA, serialVariantIdA), [
      "SN-A-1",
      "SN-A-2",
    ]);

    // And a valid sale using that serial must succeed afterwards.
    const goodSale = await createSale(
      tokenA,
      businessA,
      [
        {
          variantId: serialVariantIdA,
          quantity: 1,
          unitPrice: 100,
          discount: null,
          serialNumbers: ["SN-A-2"],
        },
      ],
      100,
    );
    assert.equal(goodSale.status, 201);
    assert.deepEqual(await getAvailableSerials(tokenA, businessA, serialVariantIdA), [
      "SN-A-1",
    ]);
  });

  it("refunds a discounted due sale at its real value and clears the customer's due", async () => {
    // Regression for the refund money model: a 10%-discounted 200 sale has a
    // final total of 180 — the refund must be 180 (pro-rata cart-discount
    // allocation), not the raw 200 line total, and the customer's due must
    // drop to zero.
    const custRes = await api(tokenA, businessA, "POST", "/api/customers", {
      name: "Due Customer",
      phone: "1711000002",
    });
    assert.equal(custRes.status, 201);
    const customer = (await custRes.json()) as { id: number };

    const productRes = await createProduct(tokenA, businessA, {
      name: "Discounted Product",
      unitId: unitIdA,
      trackingType: "none",
      variants: [
        {
          sku: "",
          barcode: null,
          sellingPrice: 200,
          alertQuantity: 0,
          isDefault: true,
          status: "active",
          imageUrl: null,
          imageFile: null,
          batchNumber: "",
          purchasePrice: 80,
          quantity: 3,
          expiryDate: null,
        },
      ],
    });
    const variantId = await getFirstVariantId(tokenA, businessA, productRes);

    const saleRes = await api(tokenA, businessA, "POST", "/api/sales", {
      saleDate: new Date().toISOString(),
      customerId: customer.id,
      payments: [{ method: "due", amount: 180 }],
      discount: { type: "percentage", value: 10 },
      vatPercent: 0,
      items: [
        { variantId, quantity: 1, unitPrice: 200, discount: null },
      ],
    });
    assert.equal(saleRes.status, 201);
    const saleBody = (await saleRes.json()) as {
      data: { sale: { id: number } };
    };
    const dueSaleId = saleBody.data.sale.id;

    const refundRes = await api(
      tokenA,
      businessA,
      "POST",
      `/api/sold_products/refunds_all/${dueSaleId}`,
      { reason: "customer_request", disposition: "restock" },
    );
    assert.equal(refundRes.status, 200);

    // The refund record carries the pro-rata value (180), not the raw line
    // total (200).
    const refundsReport = await api(
      tokenA,
      businessA,
      "GET",
      "/api/reports/sales/refunds",
    );
    assert.equal(refundsReport.status, 200);
    const refundsBody = (await refundsReport.json()) as {
      data: { data: { refundTotal: string | number }[] };
    };
    const thisRefund = refundsBody.data.data.find(
      (row) => Number(row.refundTotal) > 0,
    );
    assert.ok(thisRefund, "refund row missing from the refunds report");
    assert.equal(Number(thisRefund.refundTotal), 180);

    // The customer's due must be cleared: the sale no longer contributes to
    // the receivables summary.
    const dueRes = await api(tokenA, businessA, "GET", "/api/due_by_customers");
    assert.equal(dueRes.status, 200);
    const dues = (await dueRes.json()) as {
      customerId: number;
      totalDue: string | number;
    }[];
    const customerDue = dues.find((row) => row.customerId === customer.id);
    assert.ok(
      customerDue === undefined || Number(customerDue.totalDue) === 0,
      "refunded due sale still contributes to the customer's due",
    );
  });
});
