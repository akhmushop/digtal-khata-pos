import express from "express";
import * as productsController from "./products.controller.js";
const router = express.Router();
router.get("/api/products", productsController.getProducts);
router.post("/api/products", productsController.createProduct);
router.put("/api/products/:id", productsController.decrementQuantity);
router.put("/api/products/remove/:id", productsController.decrementQuantity);
router.put("/api/products/add/:id", productsController.incrementQuantity);
router.put("/api/products/restore/:id", productsController.restoreQuantity);
router.put(
  "/api/products/restore_all/:id",
  productsController.restoreAllQuantity,
);
router.put("/api/products/custom/:id", productsController.customQuantity);
router.put("/api/products/update_stock/:id", productsController.updateStock);
router.post(
  "/api/products/variants/:variantId/adjust-stock",
  productsController.adjustVariantStock,
);
router.post(
  "/api/products/duplicate-product/:id",
  productsController.duplicateProduct,
);
router.patch(
  "/api/products/updated_product/:id",
  productsController.duplicateProduct,
);
export default router;
