import express from "express";
import * as productController from "./product.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  requireBusinessContext,
  requireFullAccess,
} from "../../middleware/business.js";

const router = express.Router();
const read = [requireAuth, requireBusinessContext()] as const;
const write = [...read, requireFullAccess] as const;

router.get(
  "/api/product/select-options",
  ...read,
  productController.getProductSelectOptions,
);
router.get(
  "/api/product/variant-options",
  ...read,
  productController.getProductVariantOptions,
);
router.post("/api/product", ...write, productController.createProduct);
router.get("/api/product/:id", ...read, productController.getProductForEdit);
router.put("/api/product/:id", ...write, productController.updateProduct);
router.post("/api/product/category", ...write, productController.createCategory);
router.put(
  "/api/product/category/:id",
  ...write,
  productController.updateCategory,
);
router.delete(
  "/api/product/category/:id",
  ...write,
  productController.deleteCategory,
);
router.post("/api/product/brand", ...write, productController.createBrand);
router.put("/api/product/brand/:id", ...write, productController.updateBrand);
router.delete("/api/product/brand/:id", ...write, productController.deleteBrand);
router.post("/api/product/unit", ...write, productController.createUnit);
router.put("/api/product/unit/:id", ...write, productController.updateUnit);
router.delete("/api/product/unit/:id", ...write, productController.deleteUnit);
router.post(
  "/api/product/variant-type",
  ...write,
  productController.createVariantType,
);
router.put(
  "/api/product/variant-type/:id",
  ...write,
  productController.updateVariantType,
);
router.delete(
  "/api/product/variant-type/:id",
  ...write,
  productController.deleteVariantType,
);
router.post(
  "/api/product/variant-option",
  ...write,
  productController.createVariantOption,
);
router.put(
  "/api/product/variant-option/:id",
  ...write,
  productController.updateVariantOption,
);
router.delete(
  "/api/product/variant-option/:id",
  ...write,
  productController.deleteVariantOption,
);
export default router;
