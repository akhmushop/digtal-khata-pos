import express from "express";
import * as contactController from "./contact.controller.js";
const router = express.Router();
router.post("/api/contacts/supplier", contactController.createSupplier);
export default router;
