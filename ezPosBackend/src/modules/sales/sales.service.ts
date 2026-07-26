import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db/schema/index.js";
import { products } from "../../db/schema/products.js";
import { saleItems } from "../../db/schema/saleItems.js";
import { sales } from "../../db/schema/sales.js";
import type { saleDataInput } from "../../types/sales-types.js";
import { salePayments } from "../../db/schema/salePayments.js";
import { NotFoundError } from "../../utils/handleError.js";
import { saleRefunds } from "../../db/schema/saleRefunds.js";
import { saleRefundItems } from "../../db/schema/saleRefundItems.js";
import {
  getExpensesSummary,
  getInvoiceDues,
  getLowStockSummary,
  getNetProfit,
  getProductsSummary,
  getProfitByCategory,
  getPurchasesSummary,
  getRecentSalesSummary,
  getReturnSummary,
  getSalesOverview,
  getSalesSummary,
  getTopCategories,
  getTopItemsByGross,
  getTopSellingProducts,
} from "./dashboardMatrix.service.js";

export async function getSalesData() {
  return await db
    .select({
      saleId: sales.id,
      saleItemsId: saleItems.id,
      id: products.id,
      productName: products.productName,
      category: products.category,
      cost: products.cost,
      price: products.price,
      soldQuantity: saleItems.soldQuantity,
      soldPrice: saleItems.soldPrice,
      createdAt: sales.createdAt,
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .innerJoin(products, eq(saleItems.productId, products.id))
    .where(
      and(eq(saleItems.status, "completed"), eq(sales.status, "completed")),
    );
}
const getPaymentStatus = (paid: number, due: number) => {
  if (due <= 0) return "paid";
  if (paid > 0 && due > 0) return "partial";
  if (paid === 0) return "unpaid";
};
export async function createSale(input: saleDataInput) {
  const { cart, cashForm } = input;
  const { final_total, paid_amount, payment_method, customer_id } = cashForm;
  const due_amount = final_total - paid_amount;

  const paymentStatus = getPaymentStatus(paid_amount, due_amount);
  const [insertSale] = await db
    .insert(sales)
    .values({ ...cashForm, paymentStatus: paymentStatus })
    .returning({ id: sales.id });
  if (!insertSale) throw new NotFoundError("Sale creation failed");
  const saleId = insertSale.id;
  if (paid_amount > 0) {
    await db.insert(salePayments).values({
      customerId: customer_id,
      saleId,
      paidAmount: paid_amount,
      paymentMethod: payment_method,
    });
  }
  for (let item of cart) {
    await db.insert(saleItems).values({
      saleId,
      productId: item.id,
      soldQuantity: item.sold_quantity,
      soldPrice: item.final_price,
      productNameAtSale: item.product_name,
      costAtSale: item.cost,
    });
    await db
      .update(products)
      .set({ quantity: sql`${products.quantity} - ${item.sold_quantity}` })
      .where(eq(products.id, item.id));
  }
  return saleId;
}
export async function createSingleRefund(id: number) {
  await db
    .update(saleItems)
    .set({ status: "refunded" })
    .where(eq(saleItems.id, id));
  const [saleItem] = await db
    .select()
    .from(saleItems)
    .where(eq(saleItems.id, id));
  if (!saleItem) {
    throw new NotFoundError("Sale item not found");
  }
  const refundTotal =
    Number(saleItem.soldPrice) * Number(saleItem.soldQuantity);
  const [saleRefund] = await db
    .insert(saleRefunds)
    .values({
      saleId: saleItem.saleId,
      refundTotal,
    })
    .returning({ id: saleRefunds.id });
  if (!saleRefund) {
    throw new NotFoundError("Sale refund not found");
  }
  await db.insert(saleRefundItems).values({
    refundId: saleRefund.id,
    saleItemId: saleItem.id,
    productId: saleItem.productId,
    quantity: saleItem.soldQuantity,
    refundPrice: saleItem.soldPrice,
    refundTotal,
  });
  await db.update(products).set({
    quantity: sql`${products.quantity} + ${saleItem.soldQuantity}`,
  });
  return { message: "Refund created successfully", refundId: saleRefund.id };
}
export async function createMultipleRefunds(id: number) {
  const items = await db
    .select()
    .from(saleItems)
    .where(and(eq(saleItems.saleId, id), eq(saleItems.status, "completed")));
  if (!items) {
    throw new NotFoundError("Sale Items not found");
  }
  const refundTotal = items.reduce(
    (total, item) => total + Number(item.soldPrice) * Number(item.soldQuantity),
    0,
  );
  const [saleRefundsId] = await db
    .insert(saleRefunds)
    .values({
      saleId: id,
      refundTotal,
    })
    .returning({ id: saleRefunds.id });
  if (!saleRefundsId) {
    throw new NotFoundError("Sale Refunds not found");
  }
  for (let item of items) {
    await db.insert(saleRefundItems).values({
      refundId: saleRefundsId.id,
      saleItemId: item.id,
      productId: item.productId,
      quantity: item.soldQuantity,
      refundPrice: item.soldPrice,
      refundTotal: sql`${item.soldPrice} * ${item.soldQuantity}`,
    });
    await db
      .update(products)
      .set({ quantity: sql`${products.quantity}+${item.soldQuantity}` })
      .where(eq(products.id, Number(item.productId)));
    await db
      .update(saleItems)
      .set({ status: "refunded" })
      .where(eq(saleItems.saleId, Number(item.saleId)));
  }
  await db.update(sales).set({ status: "refunded" }).where(eq(sales.id, id));
  return {
    message: "Refunds created successfully",
    refundId: saleRefundsId.id,
  };
}
export async function getDashboardSummary() {
  const [
    salesOverview,
    top_sold_products_by_category,
    profitByCategory,
    topItemsByGross,
    productsSummary,
    salesSummary,
    netProfit,
    invoiceDue,
    expensesSummary,
    purchasesSummary,
    return_summary,
    recentSalesSummary,
    lowStockSummary,
    topSellingProducts,
  ] = await Promise.all([
    getSalesOverview(),
    getTopCategories(),
    getProfitByCategory(),
    getTopItemsByGross(),
    getProductsSummary(),
    getSalesSummary(),
    getNetProfit(),
    getInvoiceDues(),
    getExpensesSummary(),
    getPurchasesSummary(),
    getReturnSummary(),
    getRecentSalesSummary(),
    getLowStockSummary(),
    getTopSellingProducts(),
  ]);
  return {
    salesOverview,
    top_sold_products_by_category,
    profitByCategory,
    topItemsByGross,
    productsSummary,
    salesSummary: salesSummary.rows,
    netProfit: netProfit.rows,
    invoiceDue: invoiceDue.rows,
    expensesSummary: expensesSummary.rows,
    purchasesSummary: purchasesSummary.rows,
    return_summary: return_summary.rows,
    recentSalesSummary,
    lowStockSummary,
    topSellingProducts,
  };
}
