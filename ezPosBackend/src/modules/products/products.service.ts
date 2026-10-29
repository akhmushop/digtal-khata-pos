import { and, asc, eq, getTableColumns, gt, inArray, sql } from "drizzle-orm";
import { db } from "../../db/schema/index.js";
import { products } from "../../db/schema/products.js";
import type { ProductsTypes } from "../../types/product-types.js";
import { productVariants } from "../../db/schema/productVariants.js";
import { variantTypes } from "../../db/schema/variantTypes.js";
import { variantOptions } from "../../db/schema/variantOptions.js";
import { variantValues } from "../../db/schema/variantValues.js";
import { inventoryStock } from "../../db/schema/inventoryStock.js";
import { inventoryBatches } from "../../db/schema/inventoryBatches.js";
import { inventoryMovements } from "../../db/schema/inventoryMovements.js";
import { serialNumbers } from "../../db/schema/serialNumbers.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../utils/handleError.js";

type StockAdjustment = {
  newQuantity: number;
  reason: "count_correction" | "damaged" | "expired" | "lost" | "found";
  batchNumber?: string | undefined;
  unitCost?: number | undefined;
  serialNumbers?: string[] | undefined;
};

export async function adjustVariantStock(
  variantId: number,
  adjustment: StockAdjustment,
) {
  return db.transaction(async (tx) => {
    const [variant] = await tx
      .select({
        id: productVariants.id,
        trackingType: products.trackingType,
      })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .where(eq(productVariants.id, variantId))
      .for("update");

    if (!variant) {
      throw new NotFoundError("Product variant not found.");
    }

    const [stock] = await tx
      .select()
      .from(inventoryStock)
      .where(eq(inventoryStock.variantId, variantId))
      .for("update");

    if (!stock) {
      throw new NotFoundError("Inventory record not found for this variant.");
    }

    const previousQuantity = stock.quantity ?? 0;
    const change = adjustment.newQuantity - previousQuantity;
    if (change === 0) {
      return {
        variantId,
        previousQuantity,
        quantity: previousQuantity,
        change,
      };
    }
    if (
      change > 0 &&
      ["damaged", "expired", "lost"].includes(adjustment.reason)
    ) {
      throw new BadRequestError(
        "Use Found stock or Stock count correction when increasing stock.",
      );
    }
    if (change < 0 && adjustment.reason === "found") {
      throw new BadRequestError(
        "Found stock can only be used when increasing stock.",
      );
    }

    const trackingType = variant.trackingType ?? "none";
    const serialList = adjustment.serialNumbers ?? [];
    if (trackingType !== "serial" && serialList.length > 0) {
      throw new BadRequestError(
        "Serial numbers can only be adjusted for serial-tracked products.",
      );
    }
    if (trackingType === "serial" && serialList.length !== Math.abs(change)) {
      throw new BadRequestError(
        `Provide exactly ${Math.abs(change)} serial number(s) for this adjustment.`,
      );
    }
    if (new Set(serialList).size !== serialList.length) {
      throw new BadRequestError("Serial numbers must be unique.");
    }
    if (
      change > 0 &&
      trackingType === "batch" &&
      !adjustment.batchNumber?.trim()
    ) {
      throw new BadRequestError(
        "A batch number is required when adding stock to a batch-tracked product.",
      );
    }

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

    if (change < 0 && trackingType === "serial") {
      const selectedSerials = await tx
        .select({
          id: serialNumbers.id,
          serialNumber: serialNumbers.serialNumber,
          batchId: serialNumbers.batchId,
        })
        .from(serialNumbers)
        .where(
          and(
            eq(serialNumbers.variantId, variantId),
            eq(serialNumbers.status, "in_stock"),
            inArray(serialNumbers.serialNumber, serialList),
          ),
        )
        .for("update");

      if (selectedSerials.length !== serialList.length) {
        throw new BadRequestError(
          "Every serial number to remove must belong to this variant and be in stock.",
        );
      }

      const nextSerialStatus =
        adjustment.reason === "damaged" || adjustment.reason === "expired"
          ? "damaged"
          : "lost";
      await tx
        .update(serialNumbers)
        .set({ status: nextSerialStatus })
        .where(
          inArray(
            serialNumbers.id,
            selectedSerials.map((serial) => serial.id),
          ),
        );

      const quantitiesByBatch = new Map<number, number>();
      for (const serial of selectedSerials) {
        if (serial.batchId !== null) {
          quantitiesByBatch.set(
            serial.batchId,
            (quantitiesByBatch.get(serial.batchId) ?? 0) + 1,
          );
        }
      }
      for (const [batchId, quantity] of quantitiesByBatch) {
        const batch = batches.find((item) => item.id === batchId);
        if (!batch || batch.quantityRemaining < quantity) {
          throw new BadRequestError(
            "Serial inventory does not match its batch stock. Reconcile the batch before adjusting.",
          );
        }
        await tx
          .update(inventoryBatches)
          .set({ quantityRemaining: batch.quantityRemaining - quantity })
          .where(eq(inventoryBatches.id, batchId));
      }
    } else if (change < 0) {
      let remaining = Math.abs(change);
      for (const batch of batches) {
        if (remaining === 0) break;
        const take = Math.min(batch.quantityRemaining, remaining);
        await tx
          .update(inventoryBatches)
          .set({ quantityRemaining: batch.quantityRemaining - take })
          .where(eq(inventoryBatches.id, batch.id));
        remaining -= take;
      }
      if (remaining > 0) {
        throw new BadRequestError(
          "Not enough batch stock is available to fulfill this adjustment.",
        );
      }
    } else {
      let batchNumber =
        adjustment.batchNumber?.trim() || `ADJ-${Date.now()}-${variantId}`;
      if (batchNumber.length > 100) {
        throw new BadRequestError(
          "Batch number must be 100 characters or fewer.",
        );
      }

      const currentCostValue = batches.reduce(
        (total, batch) => total + batch.purchasePrice * batch.quantityRemaining,
        0,
      );
      const currentBatchQuantity = batches.reduce(
        (total, batch) => total + batch.quantityRemaining,
        0,
      );
      const currentAverageCost =
        currentBatchQuantity > 0 ? currentCostValue / currentBatchQuantity : 0;
      const [createdBatch] = await tx
        .insert(inventoryBatches)
        .values({
          variantId,
          locationId: stock.locationId,
          batchNumber,
          purchasePrice: adjustment.unitCost ?? currentAverageCost,
          quantityReceived: change,
          quantityRemaining: change,
        })
        .returning({ id: inventoryBatches.id });

      if (!createdBatch) {
        throw new Error(
          "Could not create an inventory batch for the adjustment.",
        );
      }

      if (trackingType === "serial") {
        const existingSerials = await tx
          .select({
            id: serialNumbers.id,
            variantId: serialNumbers.variantId,
            status: serialNumbers.status,
            serialNumber: serialNumbers.serialNumber,
          })
          .from(serialNumbers)
          .where(inArray(serialNumbers.serialNumber, serialList))
          .for("update");

        if (existingSerials.length > 0) {
          if (adjustment.reason !== "found") {
            throw new ConflictError(
              "These serial numbers already exist. Use the Found stock reason to restore lost or damaged serials.",
            );
          }
          const restorableSerials = existingSerials.filter(
            (serial) =>
              serial.variantId === variantId &&
              (serial.status === "lost" || serial.status === "damaged"),
          );
          if (restorableSerials.length !== existingSerials.length) {
            throw new ConflictError(
              "Existing serial numbers must belong to this variant and be marked lost or damaged before they can be restored.",
            );
          }
          await tx
            .update(serialNumbers)
            .set({ status: "in_stock", batchId: createdBatch.id })
            .where(
              inArray(
                serialNumbers.id,
                restorableSerials.map((serial) => serial.id),
              ),
            );
        }

        const existingValues = new Set(
          existingSerials.map((serial) => serial.serialNumber),
        );
        const newSerials = serialList.filter(
          (serial) => !existingValues.has(serial),
        );
        if (newSerials.length > 0) {
          await tx.insert(serialNumbers).values(
            newSerials.map((serialNumber) => ({
              variantId,
              batchId: createdBatch.id,
              serialNumber,
            })),
          );
        }
      }
    }

    const [updatedStock] = await tx
      .update(inventoryStock)
      .set({ quantity: adjustment.newQuantity })
      .where(eq(inventoryStock.variantId, variantId))
      .returning({ quantity: inventoryStock.quantity });
    if (
      updatedStock?.quantity === null ||
      updatedStock?.quantity === undefined
    ) {
      throw new Error("Failed to update variant inventory.");
    }

    await tx.insert(inventoryMovements).values({
      variantId,
      locationId: stock.locationId,
      movementType: "adjustment",
      quantity: change,
      referenceType: `stock_adjustment:${adjustment.reason}`,
    });

    return {
      variantId,
      previousQuantity,
      quantity: updatedStock.quantity,
      change,
    };
  });
}

export async function getAllProducts() {
  return db
    .select({
      ...getTableColumns(products),
      variants: sql`
        COALESCE(json_agg(
          jsonb_build_object(
            'id', ${productVariants.id},
            'productId', ${productVariants.productId},
            'sku', ${productVariants.sku},
            'barcode', ${productVariants.barcode},
            'sellingPrice', ${productVariants.sellingPrice},
            'alertQuantity', ${productVariants.alertQuantity},
            'isDefault', ${productVariants.isDefault},
            'status', ${productVariants.status},
            'quantity', ${inventoryStock.quantity},
            'purchaseCost', (
                            SELECT
                              SUM(
                                ${inventoryBatches.purchasePrice} *
                                ${inventoryBatches.quantityRemaining}
                              ) / NULLIF(
                                SUM(${inventoryBatches.quantityRemaining}),
                                0
                              )
                            FROM ${inventoryBatches}
                            WHERE ${inventoryBatches.variantId} = ${productVariants.id}
                              AND ${inventoryBatches.quantityRemaining} > 0
                          ),
            'options', (
              SELECT json_agg(
                json_build_object(
                  'typeName', ${variantTypes.name},
                  'value', ${variantOptions.value}
                )
              )
              FROM ${variantValues}
              JOIN ${variantOptions} ON ${variantOptions.id} = ${variantValues.optionId}
              JOIN ${variantTypes} ON ${variantTypes.id} = ${variantOptions.variantTypeId}
              -- Removed inventoryStock from here!
              WHERE ${variantValues.variantId} = ${productVariants.id}
            )
          )
        ), '[]'::json) -- Returns [] instead of null if no variants exist
      `.as("variants"),
    })
    .from(products)
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(inventoryStock, eq(inventoryStock.variantId, productVariants.id))
    .groupBy(products.id);
}
export async function createProduct(product: ProductsTypes) {
  const [created] = await db.insert(products).values(product).returning();
  return created;
}
async function setQuantity(id: number, quantity: number) {
  // Legacy single-column stock endpoints predate variant-based inventory.
  // The products.quantity column no longer exists; stock now lives in
  // inventory_stock per variant. Fail with a clear message instead of a
  // cryptic query error.
  void id;
  void quantity;
  throw new BadRequestError(
    "Legacy product quantity endpoints are not supported with variant-based inventory. Use the stock adjustment flow instead.",
  );
}
export async function decrementQuantity(id: number, currentQuantity: number) {
  return setQuantity(id, currentQuantity - 1);
}
export async function incrementQuantity(id: number, currentQuantity: number) {
  return setQuantity(id, currentQuantity + 1);
}
export async function restoreQuantity(
  id: number,
  currentQuantity: number,
  soldQuantity: number,
) {
  return setQuantity(id, currentQuantity + soldQuantity);
}
export async function restoreAllQuantity(
  id: number,
  productsQuantity: number,
  soldQuantity: number,
) {
  return setQuantity(id, productsQuantity + soldQuantity);
}
export async function adjustCustomQuantity(
  id: number,
  newQuantity: number,
  prevQuantity: number,
  productsQuantity: number,
) {
  return setQuantity(id, productsQuantity - (newQuantity - prevQuantity));
}
export async function updateStock(
  id: number,
  newStock: number,
  status: string,
) {
  void newStock;
  void status;
  return setQuantity(id, 0);
  return db.update(products).set({ status: status }).where(eq(products.id, id));
  return db
    .update(products)
    .set({ status: status })
    .where(eq(products.id, id));
}
async function getProductById(id: number) {
  const [product] = await db.select().from(products).where(eq(products.id, id));
  return product;
}
export async function duplicateProduct(id: number) {
  const product = await getProductById(id);
  if (!product) return null;
  const { id: _, ...productData } = product;
  const duplicateProduct = {
    ...productData,
    name: `${productData.name} (copy)`,
  };
  const [created] = await db
    .insert(products)
    .values(duplicateProduct)
    .returning();
  return created;
}
export async function patchProduct(
  id: number,
  updates: Partial<ProductsTypes>,
) {
  return db.update(products).set(updates).where(eq(products.id, id));
}
// router.delete("/api/products/remove_product/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleteProduct = await pool.query(
//       "DELETE FROM products WHERE id = $1",
//       [id],
//     );
//   } catch (err) {
//     console.error(err);
//   }
// });
