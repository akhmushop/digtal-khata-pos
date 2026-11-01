import express from "express";
import * as portalController from "./supportPortal.controller.js";
import { requireAuth } from "../../middleware/auth.js";

const router = express.Router();

// Customer-portal support tickets — strictly scoped to the signed-in user's
// own tickets (ownership enforced in the service, not just here).
router.get("/api/support/tickets", requireAuth, portalController.getMyTickets);
router.post(
  "/api/support/tickets",
  requireAuth,
  portalController.createMyTicket,
);
router.get(
  "/api/support/tickets/:ticketId",
  requireAuth,
  portalController.getMyTicket,
);
router.post(
  "/api/support/tickets/:ticketId/messages",
  requireAuth,
  portalController.replyToMyTicket,
);

export default router;
