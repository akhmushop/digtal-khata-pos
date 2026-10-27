import { and, asc, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { db } from "../../db/schema/index.js";
import { products } from "../../db/schema/products.js";
import { categories } from "../../db/schema/categories.js";
import { saleItems } from "../../db/schema/saleItems.js";
import { sales } from "../../db/schema/sales.js";
import { productVariants } from "../../db/schema/productVariants.js";
import type { saleDataInput } from "../../types/sales-types.js";
import { salePayments } from "../../db/schema/salePayments.js";
import {
  ConflictError,
  NotFoundError,
} from "../../utils/handleError.js";
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
import type { SaleRefundRequest } from "./schemas/sales.schema.js";
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
import { serialNumbers } from "../../db/schema/serialNumbers.js";
export async function getSalesData() {
  const rows = await db
    .select({
      saleId: sales.id,
      invoiceNumber: sales.invoiceNumber,
      saleTotal: sales.finalTotal,
      paymentStatus: sales.paymentStatus,
      saleStatus: sales.status,
      customerName: customers.name,
      saleItemsId: saleItems.id,
      id: products.id,
      variantId: productVariants.id,
      productName: products.name,
      category: categories.name,
      cost: saleItems.costAtSale,
      price: productVariants.sellingPrice,
      soldQuantity: saleItems.quantity,
      soldPrice: saleItems.sellingPrice,
      lineTotal: saleItems.lineTotal,
      createdAt: sales.createdAt,
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .innerJoin(productVariants, eq(saleItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(customers, eq(sales.customerId, customers.id))
    .where(inArray(sales.status, ["completed", "refunded"]));

  if (rows.length === 0) return [];

  const returnedRows = await db
    .select({
      saleItemId: saleRefundItems.saleItemId,
      quantity: saleRefundItems.quantity,
      reason: saleRefunds.reason,
      disposition: saleRefunds.status,
    })
    .from(saleRefundItems)
    .innerJoin(saleRefunds, eq(saleRefundItems.refundId, saleRefunds.id))
    .where(
      inArray(
        saleRefundItems.saleItemId,
        rows.map((row) => row.saleItemsId),
      ),
    );

  const returnsByItem = new Map<
    number,
    { quantity: number; reasons: string[]; dispositions: string[] }
  >();
  for (const returned of returnedRows) {
    if (returned.saleItemId === null) continue;
    const current = returnsByItem.get(returned.saleItemId) ?? {
      quantity: 0,
      reasons: [],
      dispositions: [],
    };
    current.quantity += returned.quantity ?? 0;
    if (returned.reason) current.reasons.push(returned.reason);
    if (returned.disposition) current.dispositions.push(returned.disposition);
    returnsByItem.set(returned.saleItemId, current);
  }

  return rows.map((row) => {
    const returned = returnsByItem.get(row.saleItemsId);
    return {
      ...row,
      returnedQuantity: returned?.quantity ?? 0,
      returnReason: returned?.reasons.join(", ") ?? null,
      returnDisposition: returned?.dispositions.at(-1) ?? null,
    };
  });
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
export async function consumeSerials(
  tx: DbTransaction,
  variantId: number,
  serials: string[],
) {
  if (serials.length === 0)
    throw new Error("Select at least one serial number");
  if (new Set(serials).size !== serials.length)
    throw new Error("Duplicate serial number");

  // 1. Find and lock the serials (must be in stock, and for this variant)
  const rows = await tx
    .select()
    .from(serialNumbers)
    .where(
      and(
        eq(serialNumbers.variantId, variantId),
        inArray(serialNumbers.serialNumber, serials),
        eq(serialNumbers.status, "in_stock"),
      ),
    )
    .for("update");

  if (rows.length !== serials.length) {
    throw new Error("One or more serial numbers are not available");
  }
  if (rows.some((r) => r.batchId == null)) {
    throw new Error("A serial number has no batch. Backfill it first.");
  }

  // 2. Count how many units come from each batch
  const perBatch = new Map<number, number>();
  for (const r of rows) {
    perBatch.set(r.batchId!, (perBatch.get(r.batchId!) ?? 0) + 1);
  }

  // 3. Lock those batches, reduce stock, add up the cost
  const batches = await tx
    .select()
    .from(inventoryBatches)
    .where(inArray(inventoryBatches.id, [...perBatch.keys()]))
    .for("update");

  let totalCost = 0;
  const used: { batchId: number; quantity: number; unitCost: number }[] = [];

  for (const batch of batches) {
    const take = perBatch.get(batch.id)!;
    if (batch.quantityRemaining < take) {
      throw new Error(`Batch ${batch.id} has less stock than expected`);
    }

    await tx
      .update(inventoryBatches)
      .set({ quantityRemaining: batch.quantityRemaining - take })
      .where(eq(inventoryBatches.id, batch.id));

    totalCost += take * batch.purchasePrice;
    used.push({
      batchId: batch.id,
      quantity: take,
      unitCost: batch.purchasePrice,
    });
  }

  // 4. Mark as sold now. saleItemId is linked after the sale_items insert.
  const serialIds = rows.map((r) => r.id);
  await tx
    .update(serialNumbers)
    .set({ status: "sold", soldAt: new Date() })
    .where(inArray(serialNumbers.id, serialIds));

  return {
    totalCost: roundMoney(totalCost),
    costAtSale: roundMoney(totalCost / serials.length),
    used,
    serialIds,
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

    // 2. Trusted prices and tracking types come from the database
    const variantMap = new Map(existingVariants.map((v) => [v.id, v]));

    const trustedItems = items
      .map((item) => {
        const variant = variantMap.get(item.variantId);
        const unitPrice = Number(variant?.sellingPrice);
        if (!variant || !Number.isFinite(unitPrice) || unitPrice < 0) {
          throw new NotFoundError(
            `Valid selling price not found for variant ${item.variantId}.`,
          );
        }
        return { ...item, unitPrice, trackingType: variant.trackingType };
      })
      .sort((a, b) => a.variantId - b.variantId); // same lock order for every cashier

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

      let cost: { totalCost: number; costAtSale: number; serialIds?: number[] };

      if (item.trackingType === "serial") {
        // read from the DB, never from the request
        const serials = item.serialNumbers ?? [];
        if (serials.length !== item.quantity) {
          throw new Error(
            `Select exactly ${item.quantity} serial number(s) for variant ${item.variantId}.`,
          );
        }
        cost = await consumeSerials(tx, item.variantId, serials);
      } else {
        cost = await consumeStockFifo(tx, item.variantId, item.quantity);
      }

      if (!Number.isFinite(cost.costAtSale) || cost.costAtSale < 0) {
        throw new Error(
          `Invalid inventory cost for variant ${item.variantId}.`,
        );
      }

      const [saleItem] = await tx
        .insert(saleItems)
        .values({
          saleId,
          variantId: item.variantId,
          quantity: item.quantity,
          sellingPrice: item.unitPrice,
          costAtSale: cost.costAtSale,
          lineTotal: line.total,
          discount: line.discountAmount,
        })
        .returning({ id: saleItems.id });
      if (!saleItem) throw new Error("Failed to create sale item.");
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
      await tx.insert(inventoryMovements).values({
        variantId: item.variantId,
        movementType: "sale",
        quantity: item.quantity,
        referenceType: "sale",
        referenceId: saleId,
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
    // 11. Return receipt data; transaction commits on success.
    console.log(dueAmount);
    return {
      sale: newSale,
      change,
      paidAmount,
      dueAmount,
    };
  });
}
async function applySaleRefund(
  tx: DbTransaction,
  saleId: number,
  items: (typeof saleItems.$inferSelect)[],
  options: SaleRefundRequest,
) {
  const reason = options.notes
    ? `${options.reason}: ${options.notes}`
    : options.reason;
  const refundTotal = items.reduce(
    (total, item) => total + Number(item.lineTotal),
    0,
  );
  const [refund] = await tx
    .insert(saleRefunds)
    .values({
      saleId,
      reason,
      status: options.disposition,
      refundTotal,
    })
    .returning({ id: saleRefunds.id });
  if (!refund) throw new NotFoundError("Could not create refund record");

  for (const item of items) {
    const [variant] = await tx
      .select({
        productId: productVariants.productId,
        trackingType: products.trackingType,
      })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(eq(productVariants.id, item.variantId))
      .limit(1);
    if (!variant) {
      throw new NotFoundError(`Variant ${item.variantId} not found`);
    }

    await tx.insert(saleRefundItems).values({
      refundId: refund.id,
      saleItemId: item.id,
      productId: variant.productId,
      quantity: item.quantity,
      refundPrice: item.sellingPrice,
      refundTotal: item.lineTotal,
    });

    const serialStatus =
      options.disposition === "restock"
        ? "in_stock"
        : options.disposition === "damaged"
          ? "damaged"
          : "returned";
    await tx
      .update(serialNumbers)
      .set({ status: serialStatus })
      .where(eq(serialNumbers.saleItemId, item.id));

    if (options.disposition !== "restock") continue;

    const [stock] = await tx
      .select()
      .from(inventoryStock)
      .where(eq(inventoryStock.variantId, item.variantId))
      .for("update");
    if (!stock) {
      throw new NotFoundError(
        `No inventory record exists for variant ${item.variantId}`,
      );
    }

    await tx
      .update(inventoryStock)
      .set({
        quantity: sql`coalesce(${inventoryStock.quantity}, 0) + ${item.quantity}`,
      })
      .where(eq(inventoryStock.id, stock.id));

    const [returnBatch] = await tx
      .insert(inventoryBatches)
      .values({
        variantId: item.variantId,
        locationId: stock.locationId,
        batchNumber: `RETURN-${refund.id}-${item.id}`,
        purchasePrice: item.costAtSale,
        quantityReceived: item.quantity,
        quantityRemaining: item.quantity,
      })
      .returning({ id: inventoryBatches.id });
    if (variant.trackingType === "serial" && returnBatch) {
      await tx
        .update(serialNumbers)
        .set({ batchId: returnBatch.id })
        .where(eq(serialNumbers.saleItemId, item.id));
    }

    await tx.insert(inventoryMovements).values({
      variantId: item.variantId,
      locationId: stock.locationId,
      batchId: returnBatch?.id ?? null,
      movementType: "return",
      quantity: item.quantity,
      referenceType: "sale_refund",
      referenceId: refund.id,
    });
  }

  const allSaleItems = await tx
    .select({ id: saleItems.id })
    .from(saleItems)
    .where(eq(saleItems.saleId, saleId))
    .for("update");
  const refundedSaleItems = await tx
    .select({ saleItemId: saleRefundItems.saleItemId })
    .from(saleRefundItems)
    .innerJoin(saleRefunds, eq(saleRefundItems.refundId, saleRefunds.id))
    .where(eq(saleRefunds.saleId, saleId));
  const refundedIds = new Set(
    refundedSaleItems.flatMap((row) =>
      row.saleItemId === null ? [] : [row.saleItemId],
    ),
  );
  if (
    allSaleItems.length > 0 &&
    allSaleItems.every((saleItem) => refundedIds.has(saleItem.id))
  ) {
    await tx
      .update(sales)
      .set({ status: "refunded" })
      .where(eq(sales.id, saleId));
  }

  return refund.id;
}

export async function createSingleRefund(
  id: number,
  options: SaleRefundRequest,
) {
  return db.transaction(async (tx) => {
    const [saleItem] = await tx
      .select()
      .from(saleItems)
      .where(eq(saleItems.id, id))
      .limit(1);
    if (!saleItem) throw new NotFoundError("Sale item not found");

    const [sale] = await tx
      .select({ id: sales.id, status: sales.status })
      .from(sales)
      .where(eq(sales.id, saleItem.saleId))
      .for("update");
    if (!sale) throw new NotFoundError("Sale not found");
    if (sale.status !== "completed") {
      throw new ConflictError("Only completed sales can be returned");
    }
    const [alreadyRefunded] = await tx
      .select({ id: saleRefundItems.id })
      .from(saleRefundItems)
      .where(eq(saleRefundItems.saleItemId, saleItem.id))
      .limit(1);
    if (alreadyRefunded) {
      throw new ConflictError("This sale item has already been returned");
    }

    const refundId = await applySaleRefund(
      tx,
      saleItem.saleId,
      [saleItem],
      options,
    );
    return { message: "Refund created successfully", refundId };
  });
}

export async function createMultipleRefunds(
  id: number,
  options: SaleRefundRequest,
) {
  return db.transaction(async (tx) => {
    const [sale] = await tx
      .select({ id: sales.id, status: sales.status })
      .from(sales)
      .where(eq(sales.id, id))
      .for("update");
    if (!sale) throw new NotFoundError("Sale not found");
    if (sale.status !== "completed") {
      throw new ConflictError("Only completed sales can be returned");
    }

    const items = await tx
      .select()
      .from(saleItems)
      .where(eq(saleItems.saleId, id))
      .for("update");
    if (items.length === 0) throw new NotFoundError("Sale items not found");

    const alreadyRefunded = await tx
      .select({ saleItemId: saleRefundItems.saleItemId })
      .from(saleRefundItems)
      .where(
        inArray(
          saleRefundItems.saleItemId,
          items.map((item) => item.id),
        ),
      );
    const refundedIds = new Set(
      alreadyRefunded.flatMap((row) =>
        row.saleItemId === null ? [] : [row.saleItemId],
      ),
    );
    const refundableItems = items.filter((item) => !refundedIds.has(item.id));
    if (refundableItems.length === 0) {
      throw new ConflictError("All items in this sale have already been returned");
    }

    const refundId = await applySaleRefund(
      tx,
      id,
      refundableItems,
      options,
    );
    return { message: "Refund created successfully", refundId };
  });
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
// GET /variants/:variantId/serials
export async function getAvailableSerials(variantId: number) {
  const rows = await db
    .select({ serialNumber: serialNumbers.serialNumber })
    .from(serialNumbers)
    .where(
      and(
        eq(serialNumbers.variantId, variantId),
        eq(serialNumbers.status, "in_stock"),
      ),
    )
    .orderBy(asc(serialNumbers.id));
  return rows.map((r) => r.serialNumber);
}

export async function updateAvailableSerial(
  variantId: number,
  currentSerial: string,
  serialNumber: string,
) {
  try {
    const [updated] = await db
      .update(serialNumbers)
      .set({ serialNumber })
      .where(
        and(
          eq(serialNumbers.variantId, variantId),
          eq(serialNumbers.serialNumber, currentSerial),
          eq(serialNumbers.status, "in_stock"),
        ),
      )
      .returning({ serialNumber: serialNumbers.serialNumber });

    if (!updated) {
      throw new NotFoundError("Available serial number not found");
    }

    return updated.serialNumber;
  } catch (err: unknown) {
    throw new ConflictError("Serial number is already in use");
  }
}
