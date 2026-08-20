import express from "express";
import * as addProductController from "./addProduct.controller.js";
const router = express.Router();
router.get(
  "/api/add-product/brands",
  addProductController.getAddProductsSelectOptions,
);
export default router;
