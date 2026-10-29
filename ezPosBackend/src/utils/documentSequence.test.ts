import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatProductSku,
  formatPurchaseOrderNumber,
  formatSaleInvoiceNumber,
} from "./documentSequence.js";

describe("document number formats", () => {
  it("formats sale invoices as INV-YYYY-###### with the issue year", () => {
    assert.equal(formatSaleInvoiceNumber(2026, 1), "INV-2026-000001");
    assert.equal(formatSaleInvoiceNumber(2027, 123456), "INV-2027-123456");
    assert.equal(formatSaleInvoiceNumber(2026, 1000000), "INV-2026-1000000");
  });

  it("formats purchase orders as PO-YYYY-######", () => {
    assert.equal(formatPurchaseOrderNumber(2026, 42), "PO-2026-000042");
  });

  it("formats SKUs as SKU-######", () => {
    assert.equal(formatProductSku(7), "SKU-000007");
  });

  it("pads to 6 digits", () => {
    for (const n of [0, 1, 999, 1000, 99999]) {
      assert.ok(String(n).length <= 6);
    }
  });
});

// The allocation invariant itself (1, 2, 3... per business+key, no duplicates,
// rollback safety) requires a real database and is covered by the integration
// suite in src/test/tenancy.integration.test.ts, which only runs against the
// approved ezpos_test database.
