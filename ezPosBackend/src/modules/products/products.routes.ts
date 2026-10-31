import express from "express";
import * as productsController from "./products.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  requireBusinessContext,
  requireFullAccess,
} from "../../middleware/business.js";
import { requirePermission } from "../../middleware/permissions.js";

const router = express.Router();
// Read chain: authenticated + verified owner membership + tenant context.
const read = [requireAuth, requireBusinessContext()] as const;
// State-changing chain additionally requires full subscription access.
const write = [...read, requireFullAccess] as const;

router.get(
  "/api/products",
  ...read,
  requirePermission("products.view"),
  productsController.getProducts,
);
router.post(
  "/api/products",
  ...write,
  requirePermission("products.create"),
  productsController.createProduct,
);
router.put(
  "/api/products/:id",
  ...write,
  requirePermission("products.edit"),
  productsController.decrementQuantity,
);
router.put(
  "/api/products/remove/:id",
  ...write,
  requirePermission("products.edit"),
  productsController.decrementQuantity,
);
router.put(
  "/api/products/add/:id",
  ...write,
  requirePermission("products.edit"),
  productsController.incrementQuantity,
);
router.put(
  "/api/products/restore/:id",
  ...write,
  requirePermission("products.edit"),
  productsController.restoreQuantity,
);
router.put(
  "/api/products/restore_all/:id",
  ...write,
  requirePermission("products.edit"),
  productsController.restoreAllQuantity,
);
router.put(
  "/api/products/custom/:id",
  ...write,
  requirePermission("products.edit"),
  productsController.customQuantity,
);
router.put(
  "/api/products/update_stock/:id",
  ...write,
  requirePermission("products.edit"),
  productsController.updateStock,
);
router.post(
  "/api/products/variants/:variantId/adjust-stock",
  ...write,
  requirePermission("inventory.adjust"),
  productsController.adjustVariantStock,
);
router.post(
  "/api/products/duplicate-product/:id",
  ...write,
  requirePermission("products.create"),
  productsController.duplicateProduct,
);
router.patch(
  "/api/products/updated_product/:id",
  ...write,
  requirePermission("products.edit"),
  productsController.patchProduct,
);
export default router;
