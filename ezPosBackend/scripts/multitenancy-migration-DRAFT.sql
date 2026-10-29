-- ============================================================================
-- ezPos MULTI-TENANCY MIGRATION — DRAFT (Gate B approval required)
-- ============================================================================
-- STATUS: DRAFT. This file is NOT in the drizzle/ folder and is NOT applied
-- by `npm run db:migrate`. It documents the exact schema change for approval.
-- At Gate B approval, the authoritative migration is generated with
--   npx drizzle-kit generate
-- (the Drizzle schema files are already the final state) and RECONCILED
-- against this draft before execution.
--
-- EXECUTION ORDER (revised Gate A plan):
--   0. pg_dump backup + restore verification          (Gate B)
--   1. PATH R ONLY: destructive POS-data reset script (separate approval)
--      — truncating BEFORE this migration means every statement below runs
--        on empty tables and cannot fail on data.
--      PATH B ONLY: backfill between steps M1a and M1b below (see notes).
--   2. Apply this migration (drizzle-kit wraps all pending migrations in ONE
--      transaction — verified in node_modules/drizzle-orm/pg-core/dialect.js
--      `session.transaction(...)` — so partial application is impossible;
--      any failure rolls the whole run back and db:migrate can be re-run).
--   3. Deploy the tenant-scoped application code (already in the repo).
--   4. Run integration tests against ezpos_test (Gate C).
--
-- PATH B ONLY (no reset): before enforcing NOT NULL, run parent-derived
-- backfills for all 15 child tables and an approved root-table mapping; the
-- SET NOT NULL statements are then extracted into a second, separately
-- executed script after the backfill's zero-NULL check passes.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. business_id columns (root tables)
-- ---------------------------------------------------------------------------
ALTER TABLE "categories"         ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "brands"             ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "units"              ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "variant_types"      ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "locations"          ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "customers"          ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "suppliers"          ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "expense_categories" ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "products"           ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "expenses"           ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "sales"              ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "sale_refunds"       ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "purchases"          ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "purchase_returns"   ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "supplier_ledger"    ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;

-- ---------------------------------------------------------------------------
-- 2. business_id columns (child tables)
-- ---------------------------------------------------------------------------
ALTER TABLE "product_variants"       ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "product_images"         ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "variant_images"         ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "variant_values"         ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "variant_options"        ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "sale_items"             ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "sale_payments"          ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "sale_refund_items"      ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "purchase_items"         ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "purchase_payments"      ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "purchase_return_items"  ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "inventory_batches"      ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "inventory_movements"    ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "inventory_stock"        ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;
ALTER TABLE "serial_numbers"         ADD COLUMN "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE RESTRICT;

-- ---------------------------------------------------------------------------
-- 3. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX "categories_business_id_idx"         ON "categories" ("business_id");
CREATE INDEX "brands_business_id_idx"             ON "brands" ("business_id");
CREATE INDEX "units_business_id_idx"              ON "units" ("business_id");
CREATE INDEX "variant_types_business_id_idx"      ON "variant_types" ("business_id");
CREATE INDEX "locations_business_id_idx"          ON "locations" ("business_id");
CREATE INDEX "customers_business_id_idx"          ON "customers" ("business_id");
CREATE INDEX "suppliers_business_id_idx"          ON "suppliers" ("business_id");
CREATE INDEX "expense_categories_business_id_idx" ON "expense_categories" ("business_id");
CREATE INDEX "products_business_id_idx"           ON "products" ("business_id");
CREATE INDEX "expenses_business_id_idx"           ON "expenses" ("business_id");
CREATE INDEX "sales_business_id_idx"              ON "sales" ("business_id");
CREATE INDEX "sale_refunds_business_id_idx"       ON "sale_refunds" ("business_id");
CREATE INDEX "purchases_business_id_idx"          ON "purchases" ("business_id");
CREATE INDEX "purchase_returns_business_id_idx"   ON "purchase_returns" ("business_id");
CREATE INDEX "supplier_ledger_business_id_idx"    ON "supplier_ledger" ("business_id");
CREATE INDEX "product_variants_business_id_idx"       ON "product_variants" ("business_id");
CREATE INDEX "product_images_business_id_idx"         ON "product_images" ("business_id");
CREATE INDEX "variant_images_business_id_idx"         ON "variant_images" ("business_id");
CREATE INDEX "variant_values_business_id_idx"         ON "variant_values" ("business_id");
CREATE INDEX "variant_options_business_id_idx"        ON "variant_options" ("business_id");
CREATE INDEX "sale_items_business_id_idx"             ON "sale_items" ("business_id");
CREATE INDEX "sale_payments_business_id_idx"          ON "sale_payments" ("business_id");
CREATE INDEX "sale_refund_items_business_id_idx"      ON "sale_refund_items" ("business_id");
CREATE INDEX "purchase_items_business_id_idx"         ON "purchase_items" ("business_id");
CREATE INDEX "purchase_payments_business_id_idx"      ON "purchase_payments" ("business_id");
CREATE INDEX "purchase_return_items_business_id_idx"  ON "purchase_return_items" ("business_id");
CREATE INDEX "inventory_batches_business_id_idx"      ON "inventory_batches" ("business_id");
CREATE INDEX "inventory_movements_business_id_idx"    ON "inventory_movements" ("business_id");
CREATE INDEX "inventory_stock_business_id_idx"        ON "inventory_stock" ("business_id");
CREATE INDEX "serial_numbers_business_id_idx"         ON "serial_numbers" ("business_id");

-- ---------------------------------------------------------------------------
-- 4. Parent candidate keys for composite foreign keys
--    (UNIQUE (id, business_id) on every table referenced by a composite FK)
-- ---------------------------------------------------------------------------
ALTER TABLE "products"             ADD CONSTRAINT "products_id_business_uq"             UNIQUE ("id","business_id");
ALTER TABLE "product_variants"     ADD CONSTRAINT "product_variants_id_business_uq"     UNIQUE ("id","business_id");
ALTER TABLE "variant_types"        ADD CONSTRAINT "variant_types_id_business_uq"        UNIQUE ("id","business_id");
ALTER TABLE "variant_options"      ADD CONSTRAINT "variant_options_id_business_uq"      UNIQUE ("id","business_id");
ALTER TABLE "sales"                ADD CONSTRAINT "sales_id_business_uq"                UNIQUE ("id","business_id");
ALTER TABLE "sale_items"           ADD CONSTRAINT "sale_items_id_business_uq"           UNIQUE ("id","business_id");
ALTER TABLE "sale_refunds"         ADD CONSTRAINT "sale_refunds_id_business_uq"         UNIQUE ("id","business_id");
ALTER TABLE "purchases"            ADD CONSTRAINT "purchases_id_business_uq"            UNIQUE ("id","business_id");
ALTER TABLE "purchase_items"       ADD CONSTRAINT "purchase_items_id_business_uq"       UNIQUE ("id","business_id");
ALTER TABLE "purchase_returns"     ADD CONSTRAINT "purchase_returns_id_business_uq"     UNIQUE ("id","business_id");
ALTER TABLE "suppliers"            ADD CONSTRAINT "suppliers_id_business_uq"            UNIQUE ("id","business_id");
ALTER TABLE "locations"            ADD CONSTRAINT "locations_id_business_uq"            UNIQUE ("id","business_id");
ALTER TABLE "expense_categories"   ADD CONSTRAINT "expense_categories_id_business_uq"   UNIQUE ("id","business_id");
ALTER TABLE "inventory_batches"    ADD CONSTRAINT "inventory_batches_id_business_uq"    UNIQUE ("id","business_id");

-- ---------------------------------------------------------------------------
-- 5. Composite foreign keys — primary parent relationships
--    (a child row can only point at a parent of the SAME business)
-- ---------------------------------------------------------------------------
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_business_fkey"  FOREIGN KEY ("product_id","business_id") REFERENCES "products"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "product_images"   ADD CONSTRAINT "product_images_product_business_fkey"    FOREIGN KEY ("product_id","business_id") REFERENCES "products"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "variant_images"   ADD CONSTRAINT "variant_images_variant_business_fkey"    FOREIGN KEY ("variant_id","business_id") REFERENCES "product_variants"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "variant_values"   ADD CONSTRAINT "variant_values_variant_business_fkey"    FOREIGN KEY ("variant_id","business_id") REFERENCES "product_variants"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "variant_values"   ADD CONSTRAINT "variant_values_option_business_fkey"     FOREIGN KEY ("option_id","business_id")  REFERENCES "variant_options"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "variant_options"  ADD CONSTRAINT "variant_options_type_business_fkey"      FOREIGN KEY ("variant_type_id","business_id") REFERENCES "variant_types"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "sale_items"       ADD CONSTRAINT "sale_items_sale_business_fkey"           FOREIGN KEY ("sale_id","business_id") REFERENCES "sales"("id","business_id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "sale_items"       ADD CONSTRAINT "sale_items_variant_business_fkey"        FOREIGN KEY ("variant_id","business_id") REFERENCES "product_variants"("id","business_id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "sale_payments"    ADD CONSTRAINT "sale_payments_sale_business_fkey"        FOREIGN KEY ("sale_id","business_id") REFERENCES "sales"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "sale_refunds"     ADD CONSTRAINT "refunds_sale_business_fkey"              FOREIGN KEY ("sale_id","business_id") REFERENCES "sales"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "sale_refund_items" ADD CONSTRAINT "sale_refund_items_refund_business_fkey" FOREIGN KEY ("refund_id","business_id") REFERENCES "sale_refunds"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "purchase_items"   ADD CONSTRAINT "purchase_items_purchase_business_fkey"   FOREIGN KEY ("purchase_id","business_id") REFERENCES "purchases"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "purchase_items"   ADD CONSTRAINT "purchase_items_variant_business_fkey"    FOREIGN KEY ("variant_id","business_id") REFERENCES "product_variants"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "purchase_payments" ADD CONSTRAINT "purchase_payments_purchase_business_fkey" FOREIGN KEY ("purchase_id","business_id") REFERENCES "purchases"("id","business_id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_purchase_business_fkey" FOREIGN KEY ("purchase_id","business_id") REFERENCES "purchases"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_supplier_business_fkey" FOREIGN KEY ("supplier_id","business_id") REFERENCES "suppliers"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_return_business_fkey" FOREIGN KEY ("purchase_return_id","business_id") REFERENCES "purchase_returns"("id","business_id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_item_business_fkey" FOREIGN KEY ("purchase_item_id","business_id") REFERENCES "purchase_items"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_product_business_fkey" FOREIGN KEY ("product_id","business_id") REFERENCES "products"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_variant_business_fkey" FOREIGN KEY ("variant_id","business_id") REFERENCES "product_variants"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_location_business_fkey" FOREIGN KEY ("location_id","business_id") REFERENCES "locations"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_purchase_item_business_fkey" FOREIGN KEY ("purchase_item_id","business_id") REFERENCES "purchase_items"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_variant_business_fkey" FOREIGN KEY ("variant_id","business_id") REFERENCES "product_variants"("id","business_id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_location_business_fkey" FOREIGN KEY ("location_id","business_id") REFERENCES "locations"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_batch_business_fkey" FOREIGN KEY ("batch_id","business_id") REFERENCES "inventory_batches"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "inventory_stock"  ADD CONSTRAINT "inventory_stock_variant_business_fkey"   FOREIGN KEY ("variant_id","business_id") REFERENCES "product_variants"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "serial_numbers"   ADD CONSTRAINT "serial_numbers_variant_business_fkey"    FOREIGN KEY ("variant_id","business_id") REFERENCES "product_variants"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "serial_numbers"   ADD CONSTRAINT "serial_numbers_batch_business_fkey"      FOREIGN KEY ("batch_id","business_id") REFERENCES "inventory_batches"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "serial_numbers"   ADD CONSTRAINT "serial_numbers_purchase_item_business_fkey" FOREIGN KEY ("purchase_item_id","business_id") REFERENCES "purchase_items"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "serial_numbers"   ADD CONSTRAINT "serial_numbers_sale_item_business_fkey"  FOREIGN KEY ("sale_item_id","business_id") REFERENCES "sale_items"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "supplier_ledger"  ADD CONSTRAINT "supplier_ledger_supplier_business_fkey"  FOREIGN KEY ("supplier_id","business_id") REFERENCES "suppliers"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "expenses"         ADD CONSTRAINT "expenses_category_business_fkey"         FOREIGN KEY ("category_id","business_id") REFERENCES "expense_categories"("id","business_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ---------------------------------------------------------------------------
-- 6. Repairs: sale_refund_items previously had NO FKs on sale_item_id and
--    product_id (verified 2026-10-30). The two composite constraints in
--    section 5 above create them for the first time.
--    NOTE (correction to the design review): the other previously flagged
--    "missing" FKs actually exist — verified via pg_constraint:
--      sale_refunds.refunds_sale_id_fkey, purchase_returns_purchase_id_fkey,
--      purchase_returns_supplier_id_fkey,
--      purchase_return_items_{purchase_return_id,purchase_item_id,product_id}_fkey,
--      supplier_ledger_supplier_id_fkey.
--    This migration REPLACES those simple FKs with composite versions
--    (DROP + ADD, generated by drizzle-kit from the schema diff).
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 7. Unique-constraint replacements (each verified individually)
-- ---------------------------------------------------------------------------
-- 7a. SKU/barcode: two businesses may both use SKU-000001 / same barcode.
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_sku_unique";
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_business_sku_unique" UNIQUE ("business_id","sku");
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_barcode_unique";
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_business_barcode_unique" UNIQUE ("business_id","barcode");

-- 7b. Invoice numbers: two businesses may both issue INV-2026-000001.
--     The column DEFAULT (global sale_invoice_number_seq) is intentionally
--     KEPT in this migration (explicit app values override it); dropping the
--     default and the sequence objects is optional, separately-approved
--     final-stage cleanup.
ALTER TABLE "sales" DROP CONSTRAINT "sales_invoice_number_unique";
ALTER TABLE "sales" ADD CONSTRAINT "sales_business_invoice_unique" UNIQUE ("business_id","invoice_number");

-- 7c. Purchase order numbers: same reasoning as invoices.
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_purchase_order_number_unique";
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_business_po_unique" UNIQUE ("business_id","purchase_order_number");

-- 7d. Expense category names: two businesses may both define "Rent".
ALTER TABLE "expense_categories" DROP CONSTRAINT "expense_categories_category_name_key";
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_business_name_unique" UNIQUE ("business_id","category_name");

-- 7e. Serial numbers: same physical serial may appear in two businesses.
ALTER TABLE "serial_numbers" DROP CONSTRAINT "serial_numbers_serial_number_unique";
ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_business_serial_unique" UNIQUE ("business_id","serial_number");

-- 7f. PENDING POLICY DECISION — NOT changed in this migration:
--     inventory_stock UNIQUE (variant_id) stays as-is (it does not block
--     tenancy: variant ids are already tenant-unique through
--     product_variants). Swapping to UNIQUE (business_id, variant_id,
--     location_id) with NOT NULL location_id + a per-business default
--     location happens only after the user approves the per-location model.
-- 7g. PENDING POLICY DECISION — NOT changed in this migration:
--     sale_payments UNIQUE (payment_method, reference) stays global. It WILL
--     block two businesses recording the same payment reference — must be
--     resolved (recommended: UNIQUE (business_id, payment_method, reference),
--     NULLS DISTINCT) before a second business records payments.
