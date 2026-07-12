import { relations } from "drizzle-orm/relations";
import { sales, saleRefunds, customers, suppliers, supplierLedger, saleRefundItems, salePayments, purchaseReturns, purchaseReturnItems, purchaseItems, products, saleItems, purchases, expenseCategories, expenses } from "./schema";

export const saleRefundsRelations = relations(saleRefunds, ({one, many}) => ({
	sale: one(sales, {
		fields: [saleRefunds.saleId],
		references: [sales.id]
	}),
	saleRefundItems: many(saleRefundItems),
}));

export const salesRelations = relations(sales, ({one, many}) => ({
	saleRefunds: many(saleRefunds),
	customer: one(customers, {
		fields: [sales.customerId],
		references: [customers.id]
	}),
	salePayments: many(salePayments),
	saleItems: many(saleItems),
}));

export const customersRelations = relations(customers, ({many}) => ({
	sales: many(sales),
	salePayments: many(salePayments),
}));

export const supplierLedgerRelations = relations(supplierLedger, ({one}) => ({
	supplier: one(suppliers, {
		fields: [supplierLedger.supplierId],
		references: [suppliers.id]
	}),
}));

export const suppliersRelations = relations(suppliers, ({many}) => ({
	supplierLedgers: many(supplierLedger),
	purchaseReturns: many(purchaseReturns),
}));

export const saleRefundItemsRelations = relations(saleRefundItems, ({one}) => ({
	saleRefund: one(saleRefunds, {
		fields: [saleRefundItems.refundId],
		references: [saleRefunds.id]
	}),
}));

export const salePaymentsRelations = relations(salePayments, ({one}) => ({
	sale: one(sales, {
		fields: [salePayments.saleId],
		references: [sales.id]
	}),
	customer: one(customers, {
		fields: [salePayments.customerId],
		references: [customers.id]
	}),
}));

export const purchaseReturnItemsRelations = relations(purchaseReturnItems, ({one}) => ({
	purchaseReturn: one(purchaseReturns, {
		fields: [purchaseReturnItems.purchaseReturnId],
		references: [purchaseReturns.id]
	}),
	purchaseItem: one(purchaseItems, {
		fields: [purchaseReturnItems.purchaseItemId],
		references: [purchaseItems.id]
	}),
	product: one(products, {
		fields: [purchaseReturnItems.productId],
		references: [products.id]
	}),
}));

export const purchaseReturnsRelations = relations(purchaseReturns, ({one, many}) => ({
	purchaseReturnItems: many(purchaseReturnItems),
	purchase: one(purchases, {
		fields: [purchaseReturns.purchaseId],
		references: [purchases.id]
	}),
	supplier: one(suppliers, {
		fields: [purchaseReturns.supplierId],
		references: [suppliers.id]
	}),
}));

export const purchaseItemsRelations = relations(purchaseItems, ({one, many}) => ({
	purchaseReturnItems: many(purchaseReturnItems),
	product: one(products, {
		fields: [purchaseItems.productId],
		references: [products.id]
	}),
	purchase: one(purchases, {
		fields: [purchaseItems.purchaseId],
		references: [purchases.id]
	}),
}));

export const productsRelations = relations(products, ({many}) => ({
	purchaseReturnItems: many(purchaseReturnItems),
	saleItems: many(saleItems),
	purchaseItems: many(purchaseItems),
}));

export const saleItemsRelations = relations(saleItems, ({one}) => ({
	sale: one(sales, {
		fields: [saleItems.saleId],
		references: [sales.id]
	}),
	product: one(products, {
		fields: [saleItems.productId],
		references: [products.id]
	}),
}));

export const purchasesRelations = relations(purchases, ({many}) => ({
	purchaseItems: many(purchaseItems),
	purchaseReturns: many(purchaseReturns),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	expenseCategory: one(expenseCategories, {
		fields: [expenses.categoryId],
		references: [expenseCategories.id]
	}),
}));

export const expenseCategoriesRelations = relations(expenseCategories, ({many}) => ({
	expenses: many(expenses),
}));