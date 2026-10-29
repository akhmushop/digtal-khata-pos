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
import { productVariants } from "./productVariants.js";
import { categories } from "./categories.js";
import { brands } from "./brands.js";
import { units } from "./units.js";
import { productImages } from "./productImages.js";
import { variantImages } from "./variantImages.js";
import { inventoryBatches } from "./inventoryBatches.js";
import { locations } from "./locations.js";
import { serialNumbers } from "./serialNumbers.js";
import { variantTypes } from "./variantTypes.js";
import { variantOptions } from "./variantOptions.js";
import { variantValues } from "./variantValues.js";
import { inventoryStock } from "./inventoryStock.js";
import { inventoryMovements } from "./inventoryMovements.js";
import { purchasePayments } from "./purchasePayments.js";
import { users } from "./users.js";
import { businesses } from "./businesses.js";
import { businessMemberships } from "./businessMemberships.js";
import { permissions } from "./permissions.js";
import { roles } from "./roles.js";
import { rolePermissions } from "./rolePermissions.js";
import { subscriptionPlans } from "./subscriptionPlans.js";
import { subscriptions } from "./subscriptions.js";
import { subscriptionPayments } from "./subscriptionPayments.js";
import { refreshTokens } from "./refreshTokens.js";
import { emailVerificationTokens } from "./emailVerificationTokens.js";
import { passwordResetTokens } from "./passwordResetTokens.js";
import { businessInvitations } from "./businessInvitations.js";
import { documentSequences } from "./documentSequences.js";

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
    productVariants: one(productVariants, {
      fields: [purchaseItems.variantId],
      references: [productVariants.id],
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
  variant: one(productVariants, {
    fields: [saleItems.variantId],
    references: [productVariants.id],
  }),
}));

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  purchaseItems: many(purchaseItems),
  purchaseReturns: many(purchaseReturns),
  supplier: one(suppliers, {
    fields: [purchases.supplierId],
    references: [suppliers.id],
  }),
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
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));
export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));
export const unitsRelations = relations(units, ({ many }) => ({
  products: many(products),
}));
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));
export const variantImagesRelations = relations(variantImages, ({ one }) => ({
  variant: one(productVariants, {
    fields: [variantImages.variantId],
    references: [productVariants.id],
  }),
}));
export const inventoryBatchesRelations = relations(
  inventoryBatches,
  ({ one }) => ({
    variant: one(productVariants, {
      fields: [inventoryBatches.variantId],
      references: [productVariants.id],
    }),
    location: one(locations, {
      fields: [inventoryBatches.locationId],
      references: [locations.id],
    }),
    purchaseItem: one(purchaseItems, {
      fields: [inventoryBatches.purchaseItemId],
      references: [purchaseItems.id],
    }),
  }),
);
export const serialNumbersRelations = relations(serialNumbers, ({ one }) => ({
  variant: one(productVariants, {
    fields: [serialNumbers.variantId],
    references: [productVariants.id],
  }),
  batch: one(inventoryBatches, {
    fields: [serialNumbers.batchId],
    references: [inventoryBatches.id],
  }),
  purchaseItem: one(purchaseItems, {
    fields: [serialNumbers.purchaseItemId],
    references: [purchaseItems.id],
  }),
  sale: one(saleItems, {
    fields: [serialNumbers.saleItemId],
    references: [saleItems.id],
  }),
}));
export const inventoryStockRelations = relations(inventoryStock, ({ one }) => ({
  variant: one(productVariants, {
    fields: [inventoryStock.variantId],
    references: [productVariants.id],
  }),
  location: one(locations, {
    fields: [inventoryStock.locationId],
    references: [locations.id],
  }),
}));
export const inventoryMovementsRelations = relations(
  inventoryMovements,
  ({ one }) => ({
    variant: one(productVariants, {
      fields: [inventoryMovements.variantId],
      references: [productVariants.id],
    }),
    location: one(locations, {
      fields: [inventoryMovements.locationId],
      references: [locations.id],
    }),
    batch: one(inventoryBatches, {
      fields: [inventoryMovements.batchId],
      references: [inventoryBatches.id],
    }),
  }),
);
export const purchasePaymentsRelations = relations(
  purchasePayments,
  ({ one }) => ({
    purchase: one(purchases, {
      fields: [purchasePayments.purchaseId],
      references: [purchases.id],
    }),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  createdBusinesses: many(businesses),
  businessMemberships: many(businessMemberships),
  refreshTokens: many(refreshTokens),
  emailVerificationTokens: many(emailVerificationTokens),
  passwordResetTokens: many(passwordResetTokens),
  sentInvitations: many(businessInvitations),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [businesses.createdByUserId],
    references: [users.id],
  }),
  memberships: many(businessMemberships),
  roles: many(roles),
  subscriptions: many(subscriptions),
  invitations: many(businessInvitations),
  documentSequences: many(documentSequences),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  business: one(businesses, {
    fields: [roles.businessId],
    references: [businesses.id],
  }),
  clonedFromRole: one(roles, {
    fields: [roles.clonedFromRoleId],
    references: [roles.id],
  }),
  rolePermissions: many(rolePermissions),
  memberships: many(businessMemberships),
  invitations: many(businessInvitations),
}));

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);

export const businessMembershipsRelations = relations(
  businessMemberships,
  ({ one }) => ({
    user: one(users, {
      fields: [businessMemberships.userId],
      references: [users.id],
    }),
    business: one(businesses, {
      fields: [businessMemberships.businessId],
      references: [businesses.id],
    }),
    role: one(roles, {
      fields: [businessMemberships.roleId],
      references: [roles.id],
    }),
  }),
);

export const subscriptionPlansRelations = relations(
  subscriptionPlans,
  ({ many }) => ({
    subscriptions: many(subscriptions),
  }),
);

export const subscriptionsRelations = relations(
  subscriptions,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [subscriptions.businessId],
      references: [businesses.id],
    }),
    plan: one(subscriptionPlans, {
      fields: [subscriptions.planId],
      references: [subscriptionPlans.id],
    }),
    payments: many(subscriptionPayments),
  }),
);

export const subscriptionPaymentsRelations = relations(
  subscriptionPayments,
  ({ one }) => ({
    subscription: one(subscriptions, {
      fields: [subscriptionPayments.subscriptionId],
      references: [subscriptions.id],
    }),
  }),
);

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const emailVerificationTokensRelations = relations(
  emailVerificationTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [emailVerificationTokens.userId],
      references: [users.id],
    }),
  }),
);

export const passwordResetTokensRelations = relations(
  passwordResetTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResetTokens.userId],
      references: [users.id],
    }),
  }),
);

export const businessInvitationsRelations = relations(
  businessInvitations,
  ({ one }) => ({
    business: one(businesses, {
      fields: [businessInvitations.businessId],
      references: [businesses.id],
    }),
    role: one(roles, {
      fields: [businessInvitations.roleId],
      references: [roles.id],
    }),
    invitedByUser: one(users, {
      fields: [businessInvitations.invitedByUserId],
      references: [users.id],
    }),
  }),
);

export const documentSequencesRelations = relations(
  documentSequences,
  ({ one }) => ({
    business: one(businesses, {
      fields: [documentSequences.businessId],
      references: [businesses.id],
    }),
  }),
);
