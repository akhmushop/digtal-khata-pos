import express from "express";
import * as contactController from "./contact.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  requireBusinessContext,
  requireFullAccess,
} from "../../middleware/business.js";

const router = express.Router();
const read = [requireAuth, requireBusinessContext()] as const;
const write = [...read, requireFullAccess] as const;

router.get("/api/contacts/suppliers", ...read, contactController.getSuppliers);
router.post("/api/contacts/supplier", ...write, contactController.createSupplier);
export default router;
