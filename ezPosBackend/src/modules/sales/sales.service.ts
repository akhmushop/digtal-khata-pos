import { and, asc, desc, eq, gt, inArray, sql } from "drizzle-orm";
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
import type { CreateSalePayload } from "./schemas/sales.schema.js";
import { customers } from "../../db/schema/customers.js";
import {
  customerValidation,
  validatePayments,
  validateStock,
  validateVariants,
  type Items,
} from "./sales.validation.js";
import { roundMoney } from "../../utils/roundMoney.js";
import { getCartTotals, getLinePricing } from "./utils/cartPricing.js";
import { inventoryStock } from "../../db/schema/inventoryStock.js";
import { inventoryMovements } from "../../db/schema/inventoryMovements.js";
import type { DbTransaction } from "../purchases/purchase.types.js";
import { inventoryBatches } from "../../db/schema/inventoryBatches.js";
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
export async function calculateSubtotals(
  existingVariants: {
    id: number;
    sellingPrice: number;
  }[],
  items: Items[],
) {
  const variantMap = new Map(existingVariants.map((v) => [v.id, v]));

  const subTotal = items.reduce((sum, item) => {
    const variant = variantMap.get(item.variantId);
    if (!variant) {
      throw new Error(`Variant ${item.variantId} not found`);
    }
    return sum + item.quantity * Number(variant.sellingPrice);
  }, 0);
  return roundMoney(subTotal);
}

export async function consumeStockFifo(
  tx: DbTransaction,
  variantId: number,
  quantity: number,
) {
  // 1. Oldest batches first. .for("update") locks the rows, so two sales
  //    at the same moment can't take the same stock.
  const batches = await tx
    .select()
    .from(inventoryBatches)
    .where(
      and(
        eq(inventoryBatches.variantId, variantId),
        gt(inventoryBatches.quantityRemaining, 0),
      ),
    )
    .orderBy(asc(inventoryBatches.id))
    .for("update");

  let remaining = quantity;
  let totalCost = 0;

  // 2. Take from each batch until the quantity is covered
  for (const batch of batches) {
    if (remaining === 0) break;

    const take = Math.min(batch.quantityRemaining, remaining);

    await tx
      .update(inventoryBatches)
      .set({ quantityRemaining: batch.quantityRemaining - take })
      .where(eq(inventoryBatches.id, batch.id));

    totalCost += take * batch.purchasePrice;
    remaining -= take;
  }

  // 3. Not enough stock: throwing rolls back the whole sale transaction
  if (remaining > 0) {
    throw new Error(
      `Insufficient stock for variant ${variantId}: short by ${remaining}`,
    );
  }

  return {
    totalCost: roundMoney(totalCost),
    costAtSale: roundMoney(totalCost / quantity), // average cost per unit
  };
}
function getPaymentStatus(paid: number, due: number) {
  if (due <= 0) return "paid";
  if (paid > 0) return "partial";
  return "unpaid";
}

export async function createSale(data: CreateSalePayload) {
  const { customerId, items, discount, vatPercent, payments, saleDate } = data;

  return db.transaction(async (tx) => {
    // 1. Validate customer.
    await customerValidation(tx, customerId);

    // 2. Validate variants and lock their rows.
    const { variantIds, existingVariants } = await validateVariants(tx, items);

    // 3. Lock inventory rows and validate stock.
    await validateStock(tx, variantIds, items);

    // 4. Use authoritative database selling prices.
    const priceMap = new Map(
      existingVariants.map((variant) => [
        variant.id,
        Number(variant.sellingPrice),
      ]),
    );

    const trustedItems = items.map((item) => {
      const unitPrice = priceMap.get(item.variantId);

      if (
        unitPrice === undefined ||
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
      ) {
        throw new NotFoundError(
          `Valid selling price not found for variant ${item.variantId}.`,
        );
      }

      return { ...item, unitPrice };
    });

    // 5. Calculate every total from the same trusted items.
    const totals = getCartTotals(
      trustedItems,
      discount,
      Number(vatPercent ?? 0),
    );

    const totalDiscount = roundMoney(
      totals.itemDiscount + totals.cartDiscountAmount,
    );

    // 6. Validate payment amounts against the final total.
    const { change, dueAmount, paidAmount } = validatePayments(
      payments,
      totals.finalTotal,
      customerId,
    );

    const paymentStatus = getPaymentStatus(paidAmount, dueAmount);

    // 7. Insert the sale header.
    const [newSale] = await tx
      .insert(sales)
      .values({
        saleDate,
        customerId,
        subtotal: totals.itemsBase,
        discount: totalDiscount,
        vat: totals.vat,
        finalTotal: totals.finalTotal,
        dueAmount,
        paymentStatus,
        status: "completed",
      })
      .returning({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        subtotal: sales.subtotal,
        discount: sales.discount,
        vat: sales.vat,
        finalTotal: sales.finalTotal,
        dueAmount: sales.dueAmount,
        paymentStatus: sales.paymentStatus,
      });

    if (!newSale) {
      throw new Error("Failed to create sale.");
    }

    const saleId = newSale.id;

    // 8. Insert sale items with price and cost snapshots.
    for (const item of trustedItems) {
      const line = getLinePricing(item.unitPrice, item.quantity, item.discount);

      const { costAtSale } = await consumeStockFifo(
        tx,
        item.variantId,
        item.quantity,
      );

      if (!Number.isFinite(costAtSale) || costAtSale < 0) {
        throw new Error(
          `Invalid inventory cost for variant ${item.variantId}.`,
        );
      }

      await tx.insert(saleItems).values({
        saleId,
        variantId: item.variantId,
        quantity: item.quantity,
        sellingPrice: item.unitPrice,
        costAtSale,
        lineTotal: line.total,
        discount: line.discountAmount,
      });
    }

    // 9. Insert actual received payments.
    const receivedPayments = payments.filter(
      (payment) => payment.method !== "due" && (payment.amount ?? 0) > 0,
    );

    if (receivedPayments.length > 0) {
      await tx.insert(salePayments).values(
        receivedPayments.map((payment) => {
          if (payment.amount === undefined) {
            throw new NotFoundError("payment amount not found");
          }
          return {
            saleId,
            customerId,
            amount: payment.amount,
            paymentMethod: payment.method,
            reference:
              payment.method === "cash"
                ? null
                : payment.reference?.trim() || null,
            tendered:
              payment.method === "cash" ? (payment.tendered ?? null) : null,
          };
        }),
      );
    }

    // 10. Decrement stock and create movement records.
    for (const item of trustedItems) {
      const updatedRows = await tx
        .update(inventoryStock)
        .set({
          quantity: sql`${inventoryStock.quantity} - ${item.quantity}`,
        })
        .where(eq(inventoryStock.variantId, item.variantId))
        .returning({
          variantId: inventoryStock.variantId,
        });

      if (updatedRows.length !== 1) {
        throw new Error(
          `Failed to update stock for variant ${item.variantId}.`,
        );
      }

      // Adjust this insert if your movement schema requires
      // additional columns, such as referenceId or createdBy.
      await tx.insert(inventoryMovements).values({
        variantId: item.variantId,
        movementType: "sale",
        quantity: item.quantity,
        referenceType: "sale",
        referenceId: saleId,
      });
    }

    // 11. Return receipt data; transaction commits on success.
    return {
      sale: newSale,
      change,
      paidAmount,
      dueAmount,
    };
  });
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
