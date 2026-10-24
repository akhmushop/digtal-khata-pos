import { eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "../../db/schema/index.js";
import { products } from "../../db/schema/products.js";
import type { ProductsTypes } from "../../types/product-types.js";
import { productVariants } from "../../db/schema/productVariants.js";
import { variantTypes } from "../../db/schema/variantTypes.js";
import { variantOptions } from "../../db/schema/variantOptions.js";
import { variantValues } from "../../db/schema/variantValues.js";
import { inventoryStock } from "../../db/schema/inventoryStock.js";
import { inventoryBatches } from "../../db/schema/inventoryBatches.js";

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
  return db.update(products).set({ quantity }).where(eq(products.id, id));
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
  return db
    .update(products)
    .set({ quantity: newStock, status: status })
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
    productName: `${productData.productName} (copy)`,
    barcode: `${productData.productName} (copy)`,
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
