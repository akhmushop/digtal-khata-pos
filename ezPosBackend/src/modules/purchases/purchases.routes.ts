import express from "express";
import * as purchasesController from "./purchases.controller.js";
const router = express.Router();
router.post("/api/purchases", purchasesController.createPurchase);
router.get("/api/purchases", purchasesController.getPurchasesSummary);
router.get("/api/purchases/items", purchasesController.getPurchasesItems);
router.post("/api/purchases/updates", purchasesController.createPurchaseUpdate);
export default router;
