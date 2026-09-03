import express from "express";
import * as productController from "./product.controller.js";
const router = express.Router();
router.get(
  "/api/product/select-options",
  productController.getProductSelectOptions,
);
router.get(
  "/api/product/variant-options",
  productController.getProductVariantOptions,
);
router.post("/api/product", productController.createProduct);
router.post("/api/product/category", productController.createCategory);
router.post("/api/product/brand", productController.createBrand);
router.post("/api/product/unit", productController.createUnit);
router.post("/api/product/variant-type", productController.createVariantType);
export default router;
