import express, { json } from "express";
import { pool } from "../config/db.js";
import { db } from "../db/schema/index.js";
import { products } from "../db/schema.js";
import type { ProductsTypes } from "../types/product-types.js";
import { eq } from "drizzle-orm";
const router = express.Router();

router.get("/api/products", async (req, res) => {
  try {
    const result = await db.select().from(products);
    res.json(result);
  } catch (err) {
    console.error(err);
  }
});
router.post("/api/products", async (req, res) => {
  try {
    const product = req.body;
    await db.insert(products).values(product);
  } catch (err: unknown) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMessage });
  }
});
router.put("/api/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { quantity } = req.body;
    const updatedQuantity = quantity - 1;
    await db
      .update(products)
      .set({ quantity: updatedQuantity })
      .where(eq(products.id, id));
  } catch (err) {
    console.error(err);
  }
});
router.put("/api/products/remove/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { quantity } = req.body;
    const updatedQuantity = quantity - 1;
    await db
      .update(products)
      .set({ quantity: updatedQuantity })
      .where(eq(products.id, id));
  } catch (err) {
    console.error(err);
  }
});
router.put("/api/products/add/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { quantity } = req.body;
    const updatedQuantity = quantity + 1;
    await db
      .update(products)
      .set({ quantity: updatedQuantity })
      .where(eq(products.id, id));
  } catch (err) {
    console.error(err);
  }
});
router.put("/api/products/restore/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { sold_quantity, quantity } = req.body;
    const updatedQuantity = quantity + sold_quantity;
    await db
      .update(products)
      .set({ quantity: updatedQuantity })
      .where(eq(products.id, id));
  } catch (err) {
    console.error(err);
  }
});
router.put("/api/products/custom/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { new_quantity, prev_quantity, products_quantity } = req.body;
    const updatedQuantity = products_quantity - (new_quantity - prev_quantity);
    await db
      .update(products)
      .set({ quantity: updatedQuantity })
      .where(eq(products.id, id));
  } catch (err) {
    console.error(err);
  }
});
router.put("/api/products/restore_all/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { sold_quantity, products_quantity } = req.body;
    const updatedQuantity = products_quantity + sold_quantity;
    await db
      .update(products)
      .set({ quantity: updatedQuantity })
      .where(eq(products.id, id));
  } catch (err) {
    console.error(err);
  }
});
router.put("/api/products/update_stock/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { newStock, status } = req.body;
  await db
    .update(products)
    .set({ quantity: newStock, status: status })
    .where(eq(products.id, id));
});
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
router.post("/api/products/duplicate-product/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const { id: _, ...productData } = product;
    const duplicateProduct = {
      ...productData,
      productName: `${productData.productName} (copy)`,
      barcode: `${productData.productName} (copy)`,
    };
    await db.insert(products).values(duplicateProduct);
    // res.json(newProduct.rows[0]);
  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMessage });
  }
});
router.patch("/api/products/updated_product/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const update_product = req.body;
    if (Object.keys(update_product).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
    await db.update(products).set(update_product).where(eq(products.id, id));
  } catch (err) {
    console.error(err);
  }
});
export default router;
