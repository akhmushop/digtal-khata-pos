import express from "express";
import * as addProductController from "./addProduct.controller.js";
const router = express.Router();
router.get(
  "/api/add-product/select-options",
  addProductController.getAddProductsSelectOptions,
);
router.get(
  "/api/add-product/variant-options",
  addProductController.getAddProductVariantOptions,
);
export default router;
