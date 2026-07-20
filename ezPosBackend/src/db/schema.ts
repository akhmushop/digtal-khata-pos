import {
  pgTable,
  foreignKey,
  serial,
  integer,
  text,
  timestamp,
  varchar,
  numeric,
  jsonb,
  unique,
  date,
  bigserial,
  bigint,
  check,
  boolean,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { paymentStatusEnum, statusEnum } from "../types/purchases-type.js";

export const saleRefunds = pgTable(
  "sale_refunds",
  {
    id: serial().primaryKey().notNull(),
    saleId: integer("sale_id"),
    reason: text(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    status: varchar({ length: 20 }),
    refundTotal: numeric("refund_total", { mode: "number" }),
  },
  (table) => [
    foreignKey({
      columns: [table.saleId],
      foreignColumns: [sales.id],
      name: "refunds_sale_id_fkey",
    }),
  ],
);

export const test = pgTable("test", {
  tags: jsonb(),
});

export const sales = pgTable(
  "sales",
  {
    id: serial().primaryKey().notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    status: varchar({ length: 30 }).default("completed"),
    invoiceNumber: varchar("invoice_number", { length: 50 }),
    saleDate: date("sale_date").default(sql`CURRENT_DATE`),
    subtotal: numeric({ precision: 10, scale: 2 }),
    discount: numeric({ precision: 10, scale: 2 }).default("0"),
    vat: numeric({ precision: 10, scale: 2 }).default("0"),
    finalTotal: numeric("final_total", { precision: 10, scale: 2 }),
    paymentStatus: varchar("payment_status", { length: 20 }).default("paid"),
    dueAmount: numeric("due_amount", { precision: 10, scale: 2 }).default("0"),
    note: text(),
    customerId: integer("customer_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: "sales_customer_id_fkey",
    }),
    unique("sales_invoice_number_key").on(table.invoiceNumber),
  ],
);

export const purchases = pgTable("purchases", {
  id: serial().primaryKey().notNull(),
  supplierName: varchar("supplier_name", { length: 255 }),
  subtotal: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
  discount: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
  finalTotal: numeric("final_total", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  paidAmount: numeric("paid_amount", {
    precision: 10,
    scale: 2,
    mode: "number",
  })
    .default(0)
    .notNull(),
  dueAmount: numeric("due_amount", { precision: 10, scale: 2, mode: "number" })
    .default(0)
    .notNull(),
  paymentStatus: paymentStatusEnum("payment_status")
    .default("unpaid")
    .notNull(),
  note: text(),
  createdAt: timestamp("created_at", { mode: "string" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  status: statusEnum("status").default("ordered").notNull(),
});

export const supplierLedger = pgTable(
  "supplier_ledger",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    supplierId: bigint("supplier_id", { mode: "number" }).notNull(),
    transactionType: varchar("transaction_type", { length: 30 }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    referenceId: bigint("reference_id", { mode: "number" }),
    debit: numeric({ precision: 12, scale: 2 }).default("0"),
    credit: numeric({ precision: 12, scale: 2 }).default("0"),
    note: text(),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.supplierId],
      foreignColumns: [suppliers.id],
      name: "supplier_ledger_supplier_id_fkey",
    }),
  ],
);

export const suppliers = pgTable(
  "suppliers",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    supplierCode: varchar("supplier_code", { length: 30 }),
    name: varchar({ length: 150 }).notNull(),
    contactPerson: varchar("contact_person", { length: 150 }),
    phone: varchar({ length: 30 }),
    email: varchar({ length: 150 }),
    companyName: varchar("company_name", { length: 150 }),
    address: text(),
    openingBalance: numeric("opening_balance", {
      precision: 12,
      scale: 2,
    }).default("0"),
    openingBalanceType: varchar("opening_balance_type", { length: 10 }),
    status: boolean().default(true),
    note: text(),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp("updated_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    unique("suppliers_supplier_code_key").on(table.supplierCode),
    check(
      "suppliers_opening_balance_type_check",
      sql`(opening_balance_type)::text = ANY ((ARRAY['payable'::character varying, 'receivable'::character varying])::text[])`,
    ),
  ],
);

export const products = pgTable(
  "products",
  {
    id: serial().primaryKey().notNull(),
    barcode: varchar({ length: 40 }),
    productName: varchar("product_name", { length: 100 }).notNull(),
    productUnit: varchar("product_unit", { length: 20 }),
    productType: varchar("product_type", { length: 20 }),
    alertQuantity: integer("alert_quantity").notNull(),
    cost: doublePrecision().notNull(),
    price: doublePrecision().notNull(),
    discountPercent: numeric("discount_percent").default("0"),
    flatDiscount: numeric("flat_discount").default("0"),
    quantity: integer().notNull(),
    batchNumber: varchar("batch_number", { length: 200 }),
    expiryDate: varchar("expiry_date", { length: 30 }),
    description: varchar({ length: 200 }),
    brand: varchar({ length: 30 }),
    category: varchar({ length: 50 }),
    supplier: varchar({ length: 50 }),
    image: varchar({ length: 200 }),
    status: varchar({ length: 30 }),
    createdAt: varchar("created_at", { length: 30 }).default(sql`CURRENT_DATE`),
    sku: varchar({ length: 100 }),
    weight: varchar({ length: 20 }),
    dimensions: varchar({ length: 80 }),
    variations: varchar({ length: 300 }),
    finalPrice: numeric("final_price"),
    tags: jsonb(),
  },
  (table) => [unique("products_barcode_key").on(table.barcode)],
);

export const saleRefundItems = pgTable(
  "sale_refund_items",
  {
    id: serial().notNull(),
    refundId: integer("refund_id"),
    saleItemId: integer("sale_item_id"),
    productId: integer("product_id"),
    quantity: integer(),
    refundPrice: numeric("refund_price"),
    refundTotal: numeric("refund_total", { mode: "number" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.refundId],
      foreignColumns: [saleRefunds.id],
      name: "fk_sale_refunds_items",
    }),
  ],
);

export const customers = pgTable("customers", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 20 }),
  address: text(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const expenseCategories = pgTable(
  "expense_categories",
  {
    id: serial().primaryKey().notNull(),
    categoryName: varchar("category_name", { length: 100 }).notNull(),
  },
  (table) => [
    unique("expense_categories_category_name_key").on(table.categoryName),
  ],
);

export const salePayments = pgTable(
  "sale_payments",
  {
    id: serial().primaryKey().notNull(),
    saleId: integer("sale_id"),
    customerId: integer("customer_id"),
    paidAmount: numeric("paid_amount", { precision: 10, scale: 2 }),
    paymentMethod: varchar("payment_method", { length: 50 }),
    paymentDate: timestamp("payment_date", { mode: "string" }).defaultNow(),
    notes: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.saleId],
      foreignColumns: [sales.id],
      name: "sale_payments_sale_id_fkey",
    }),
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: "sale_payments_customer_id_fkey",
    }),
  ],
);

export const purchaseReturnItems = pgTable(
  "purchase_return_items",
  {
    id: serial().primaryKey().notNull(),
    purchaseReturnId: integer("purchase_return_id").notNull(),
    purchaseItemId: integer("purchase_item_id").notNull(),
    productId: integer("product_id").notNull(),
    quantity: numeric({ precision: 10, scale: 2 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    lineTotal: numeric("line_total", {
      precision: 12,
      scale: 2,
    }).generatedAlwaysAs(sql`(quantity * unit_price)`),
  },
  (table) => [
    foreignKey({
      columns: [table.purchaseReturnId],
      foreignColumns: [purchaseReturns.id],
      name: "purchase_return_items_purchase_return_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.purchaseItemId],
      foreignColumns: [purchaseItems.id],
      name: "purchase_return_items_purchase_item_id_fkey",
    }),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: "purchase_return_items_product_id_fkey",
    }),
    check("purchase_return_items_quantity_check", sql`quantity > (0)::numeric`),
  ],
);

export const saleItems = pgTable(
  "sale_items",
  {
    id: serial().primaryKey().notNull(),
    saleId: integer("sale_id"),
    productId: integer("product_id"),
    soldQuantity: integer("sold_quantity"),
    soldPrice: numeric("sold_price"),
    status: varchar({ length: 20 }).default("completed"),
    productNameAtSale: text("product_name_at_sale"),
    costAtSale: numeric("cost_at_sale", { precision: 10, scale: 2 }),
  },
  (table) => [
    foreignKey({
      columns: [table.saleId],
      foreignColumns: [sales.id],
      name: "sale_items_sale_id_fkey",
    }),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: "sale_items_product_id_fkey",
    }),
  ],
);

export const purchaseItems = pgTable(
  "purchase_items",
  {
    id: serial().primaryKey().notNull(),
    purchaseId: integer("purchase_id").notNull(),
    productId: integer("product_id").notNull(),
    quantity: numeric({ precision: 12, scale: 2 }).notNull(),
    costPrice: numeric("cost_price", { precision: 12, scale: 2,mode:'number' }).notNull(),
    totalCost: numeric("total_cost", {
      precision: 12,
      scale: 2,
    }).generatedAlwaysAs(sql`(quantity * cost_price)`),
    receiveQuantity: integer("receive_quantity").default(0),
  },
  (table) => [
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: "purchase_items_product_id_fkey",
    }),
    foreignKey({
      columns: [table.purchaseId],
      foreignColumns: [purchases.id],
      name: "purchase_items_purchase_id_fkey",
    }),
  ],
);

export const purchaseReturns = pgTable(
  "purchase_returns",
  {
    id: serial().primaryKey().notNull(),
    purchaseId: integer("purchase_id").notNull(),
    supplierId: integer("supplier_id").notNull(),
    returnDate: timestamp("return_date", { mode: "string" })
      .defaultNow()
      .notNull(),
    reason: text(),
    status: varchar({ length: 20 }).default("pending").notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 })
      .default("0")
      .notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.purchaseId],
      foreignColumns: [purchases.id],
      name: "purchase_returns_purchase_id_fkey",
    }),
    foreignKey({
      columns: [table.supplierId],
      foreignColumns: [suppliers.id],
      name: "purchase_returns_supplier_id_fkey",
    }),
  ],
);

export const expenses = pgTable(
  "expenses",
  {
    id: serial().primaryKey().notNull(),
    title: varchar({ length: 255 }).notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    categoryId: integer("category_id"),
    paymentMethod: varchar("payment_method", { length: 50 }),
    referenceNo: varchar("reference_no", { length: 100 }),
    note: text(),
    expenseDate: date("expense_date").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp("updated_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [expenseCategories.id],
      name: "expenses_category_id_fkey",
    }),
    check("expenses_amount_check", sql`amount >= (0)::numeric`),
    check(
      "expenses_payment_method_check",
      sql`(payment_method)::text = ANY ((ARRAY['Cash'::character varying, 'Mobile'::character varying, 'Card'::character varying])::text[])`,
    ),
  ],
);
