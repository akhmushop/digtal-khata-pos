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
router.get("/api/product/:id", productController.getProductForEdit);
router.put("/api/product/:id", productController.updateProduct);
router.post("/api/product/category", productController.createCategory);
router.put("/api/product/category/:id", productController.updateCategory);
router.delete("/api/product/category/:id", productController.deleteCategory);
router.post("/api/product/brand", productController.createBrand);
router.put("/api/product/brand/:id", productController.updateBrand);
router.delete("/api/product/brand/:id", productController.deleteBrand);
router.post("/api/product/unit", productController.createUnit);
router.put("/api/product/unit/:id", productController.updateUnit);
router.delete("/api/product/unit/:id", productController.deleteUnit);
router.post("/api/product/variant-type", productController.createVariantType);
router.put("/api/product/variant-type/:id", productController.updateVariantType);
router.delete(
  "/api/product/variant-type/:id",
  productController.deleteVariantType,
);
router.post(
  "/api/product/variant-option",
  productController.createVariantOption,
);
router.put(
  "/api/product/variant-option/:id",
  productController.updateVariantOption,
);
router.delete(
  "/api/product/variant-option/:id",
  productController.deleteVariantOption,
);
export default router;
