import express from "express";
import * as productController from "./product.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  requireBusinessContext,
  requireFullAccess,
} from "../../middleware/business.js";
import { requireLocationAccess } from "../../middleware/location.js";
import { requirePermission } from "../../middleware/permissions.js";

const router = express.Router();
// Location-aware: the X-Location-Id header (or the business default) is
// validated against membership + assignment before any handler runs.
const read = [
  requireAuth,
  requireBusinessContext(),
  requireLocationAccess(),
] as const;
const write = [...read, requireFullAccess] as const;

router.get(
  "/api/product/select-options",
  ...read,
  requirePermission("products.view"),
  productController.getProductSelectOptions,
);
router.get(
  "/api/product/variant-options",
  ...read,
  requirePermission("products.view"),
  productController.getProductVariantOptions,
);
router.post(
  "/api/product",
  ...write,
  requirePermission("products.create"),
  productController.createProduct,
);
router.get(
  "/api/product/:id",
  ...read,
  requirePermission("products.view"),
  productController.getProductForEdit,
);
router.put(
  "/api/product/:id",
  ...write,
  requirePermission("products.edit"),
  productController.updateProduct,
);
router.post(
  "/api/product/category",
  ...write,
  requirePermission("products.edit"),
  productController.createCategory,
);
router.put(
  "/api/product/category/:id",
  ...write,
  requirePermission("products.edit"),
  productController.updateCategory,
);
router.delete(
  "/api/product/category/:id",
  ...write,
  requirePermission("products.delete"),
  productController.deleteCategory,
);
router.post(
  "/api/product/brand",
  ...write,
  requirePermission("products.edit"),
  productController.createBrand,
);
router.put(
  "/api/product/brand/:id",
  ...write,
  requirePermission("products.edit"),
  productController.updateBrand,
);
router.delete(
  "/api/product/brand/:id",
  ...write,
  requirePermission("products.delete"),
  productController.deleteBrand,
);
router.post(
  "/api/product/unit",
  ...write,
  requirePermission("products.edit"),
  productController.createUnit,
);
router.put(
  "/api/product/unit/:id",
  ...write,
  requirePermission("products.edit"),
  productController.updateUnit,
);
router.delete(
  "/api/product/unit/:id",
  ...write,
  requirePermission("products.delete"),
  productController.deleteUnit,
);
router.post(
  "/api/product/variant-type",
  ...write,
  requirePermission("products.manage_variants"),
  productController.createVariantType,
);
router.put(
  "/api/product/variant-type/:id",
  ...write,
  requirePermission("products.manage_variants"),
  productController.updateVariantType,
);
router.delete(
  "/api/product/variant-type/:id",
  ...write,
  requirePermission("products.manage_variants"),
  productController.deleteVariantType,
);
router.post(
  "/api/product/variant-option",
  ...write,
  requirePermission("products.manage_variants"),
  productController.createVariantOption,
);
router.put(
  "/api/product/variant-option/:id",
  ...write,
  requirePermission("products.manage_variants"),
  productController.updateVariantOption,
);
router.delete(
  "/api/product/variant-option/:id",
  ...write,
  requirePermission("products.manage_variants"),
  productController.deleteVariantOption,
);
export default router;
