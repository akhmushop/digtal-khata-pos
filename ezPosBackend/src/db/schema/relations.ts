import { relations } from "drizzle-orm/relations";
import { saleRefunds } from "./saleRefunds.js";
import { sales } from "./sales.js";
import { saleRefundItems } from "./saleRefundItems.js";
import { customers } from "./customers.js";
import { salePayments } from "./salePayments.js";
import { saleItems } from "./saleItems.js";
import { supplierLedger } from "./supplierLedger.js";
import { suppliers } from "./suppliers.js";
import { purchaseReturns } from "./purchaseReturns.js";
import { purchaseReturnItems } from "./purchaseReturnItems.js";
import { purchaseItems } from "./purchaseItems.js";
import { products } from "./products.js";
import { purchases } from "./purchases.js";
import { expenses } from "./expenses.js";
import { expenseCategories } from "./expenseCategories.js";
import {
  productVariants,
  serialNumbers,
  variantOptions,
  variantTypes,
  variantValues,
} from "./productVariants.js";

export const saleRefundsRelations = relations(saleRefunds, ({ one, many }) => ({
  sale: one(sales, {
    fields: [saleRefunds.saleId],
    references: [sales.id],
  }),
  saleRefundItems: many(saleRefundItems),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  saleRefunds: many(saleRefunds),
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
  salePayments: many(salePayments),
  saleItems: many(saleItems),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  sales: many(sales),
  salePayments: many(salePayments),
}));

export const supplierLedgerRelations = relations(supplierLedger, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierLedger.supplierId],
    references: [suppliers.id],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  supplierLedgers: many(supplierLedger),
  purchaseReturns: many(purchaseReturns),
}));

export const saleRefundItemsRelations = relations(
  saleRefundItems,
  ({ one }) => ({
    saleRefund: one(saleRefunds, {
      fields: [saleRefundItems.refundId],
      references: [saleRefunds.id],
    }),
  }),
);

export const salePaymentsRelations = relations(salePayments, ({ one }) => ({
  sale: one(sales, {
    fields: [salePayments.saleId],
    references: [sales.id],
  }),
  customer: one(customers, {
    fields: [salePayments.customerId],
    references: [customers.id],
  }),
}));

export const purchaseReturnItemsRelations = relations(
  purchaseReturnItems,
  ({ one }) => ({
    purchaseReturn: one(purchaseReturns, {
      fields: [purchaseReturnItems.purchaseReturnId],
      references: [purchaseReturns.id],
    }),
    purchaseItem: one(purchaseItems, {
      fields: [purchaseReturnItems.purchaseItemId],
      references: [purchaseItems.id],
    }),
    product: one(products, {
      fields: [purchaseReturnItems.productId],
      references: [products.id],
    }),
  }),
);

export const purchaseReturnsRelations = relations(
  purchaseReturns,
  ({ one, many }) => ({
    purchaseReturnItems: many(purchaseReturnItems),
    purchase: one(purchases, {
      fields: [purchaseReturns.purchaseId],
      references: [purchases.id],
    }),
    supplier: one(suppliers, {
      fields: [purchaseReturns.supplierId],
      references: [suppliers.id],
    }),
  }),
);

export const purchaseItemsRelations = relations(
  purchaseItems,
  ({ one, many }) => ({
    purchaseReturnItems: many(purchaseReturnItems),
    product: one(products, {
      fields: [purchaseItems.productId],
      references: [products.id],
    }),
    purchase: one(purchases, {
      fields: [purchaseItems.purchaseId],
      references: [purchases.id],
    }),
  }),
);

export const productsRelations = relations(products, ({ many }) => ({
  purchaseReturnItems: many(purchaseReturnItems),
  saleItems: many(saleItems),
  purchaseItems: many(purchaseItems),
  productVariants: many(productVariants),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}));

export const purchasesRelations = relations(purchases, ({ many }) => ({
  purchaseItems: many(purchaseItems),
  purchaseReturns: many(purchaseReturns),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  expenseCategory: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
}));

export const expenseCategoriesRelations = relations(
  expenseCategories,
  ({ many }) => ({
    expenses: many(expenses),
  }),
);
export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    serialNumber: many(serialNumbers),
  }),
);
export const variantTypesRelations = relations(variantTypes, ({ many }) => ({
  variantOptions: many(variantOptions),
}));
export const variantOptionsRelations = relations(variantOptions, ({ one }) => ({
  variantType: one(variantTypes, {
    fields: [variantOptions.variantTypeId],
    references: [variantTypes.id],
  }),
}));
export const variantValuesRelations = relations(variantValues, ({ one }) => ({
  variant: one(productVariants, {
    fields: [variantValues.variantId],
    references: [productVariants.id],
  }),
  option: one(variantOptions, {
    fields: [variantValues.optionId],
    references: [variantOptions.id],
  }),
}));
export const serialNumbersRelations = relations(serialNumbers, ({ one }) => ({
  variant: one(productVariants, {
    fields: [serialNumbers.variantId],
    references: [productVariants.id],
  }),
}));
