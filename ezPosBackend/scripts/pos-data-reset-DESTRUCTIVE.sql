-- ============================================================================
-- ezPos POS-DATA CLEAN RESET — DESTRUCTIVE — SEPARATE APPROVAL REQUIRED
-- ============================================================================
-- NEVER run this script automatically. It is executed manually, once, only
-- after ALL of the following:
--   1. Explicit approval of THIS script by the project owner.
--   2. A verified backup: pg_dump -Fc + restore proof into a scratch DB with
--      per-table row-count comparison against the source.
--   3. Connection-target assertion: the script runner must pass the target
--      database name and refuse to run unless current_database() equals it.
--   4. It runs BEFORE the multitenancy migration on the approved path
--      (truncating on the old schema is valid — no business_id needed).
--
-- CASCADE CONTAINMENT (verified 2026-10-30 via pg_constraint): no table
-- outside this list references any table inside it. The 14 SaaS tables
-- (users, businesses, memberships, invitations, roles, permissions,
-- role_permissions, subscription_plans, subscriptions, subscription_payments,
-- refresh/email/password-reset tokens, document_sequences) are unreachable.
--
-- RESTART IDENTITY resets the tables' OWNED id-sequences (products_id_seq,
-- sales_id_seq, ...) — that reset is part of what this approval covers.
-- The three global document sequences (sale_invoice_number_seq,
-- purchase_order_seq, product_sku_seq) are NOT owned by tables and are
-- untouched.
-- ============================================================================

TRUNCATE TABLE
  sale_refund_items, sale_refunds, sale_payments, sale_items, sales,
  purchase_return_items, purchase_returns, purchase_payments, purchase_items, purchases,
  supplier_ledger, serial_numbers, inventory_movements, inventory_batches, inventory_stock,
  expenses, expense_categories, customers, suppliers,
  product_images, variant_images, variant_values, variant_options, variant_types,
  product_variants, products, categories, brands, units, locations
RESTART IDENTITY CASCADE;

-- POST-RESET VERIFICATION (run manually after):
--   SELECT COUNT(*) FROM <each of the 30 tables>;            -- all must be 0
--   SELECT COUNT(*) FROM users;                               -- unchanged
--   SELECT COUNT(*) FROM businesses;                          -- unchanged
--   SELECT current_database();                                -- re-assert target
