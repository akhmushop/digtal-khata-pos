import express from "express";
import * as productsController from "./products.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  requireBusinessContext,
  requireFullAccess,
} from "../../middleware/business.js";

const router = express.Router();
// Read chain: authenticated + verified owner membership + tenant context.
const read = [requireAuth, requireBusinessContext()] as const;
// State-changing chain additionally requires full subscription access.
const write = [...read, requireFullAccess] as const;

router.get("/api/products", ...read, productsController.getProducts);
router.post("/api/products", ...write, productsController.createProduct);
router.put("/api/products/:id", ...write, productsController.decrementQuantity);
router.put(
  "/api/products/remove/:id",
  ...write,
  productsController.decrementQuantity,
);
router.put(
  "/api/products/add/:id",
  ...write,
  productsController.incrementQuantity,
);
router.put(
  "/api/products/restore/:id",
  ...write,
  productsController.restoreQuantity,
);
router.put(
  "/api/products/restore_all/:id",
  ...write,
  productsController.restoreAllQuantity,
);
router.put("/api/products/custom/:id", ...write, productsController.customQuantity);
router.put(
  "/api/products/update_stock/:id",
  ...write,
  productsController.updateStock,
);
router.post(
  "/api/products/variants/:variantId/adjust-stock",
  ...write,
  productsController.adjustVariantStock,
);
router.post(
  "/api/products/duplicate-product/:id",
  ...write,
  productsController.duplicateProduct,
);
router.patch(
  "/api/products/updated_product/:id",
  ...write,
  productsController.patchProduct,
);
export default router;
