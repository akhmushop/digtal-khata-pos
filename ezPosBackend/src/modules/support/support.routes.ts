import express from "express";
import { submitContactMessage } from "./support.controller.js";
import { contactRateLimit } from "../../middleware/rateLimit.js";

const router = express.Router();
router.post(
  "/api/support/contact",
  contactRateLimit,
  submitContactMessage,
);
export default router;
