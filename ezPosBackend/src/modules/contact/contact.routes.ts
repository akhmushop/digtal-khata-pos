import express from "express";
import * as contactController from "./contact.controller.js";
const router = express.Router();
router.get("/api/contacts/suppliers", contactController.getSuppliers);
router.post("/api/contacts/supplier", contactController.createSupplier);
export default router;
