import express from "express";
import * as locationsController from "./locations.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireBusinessContext, requireFullAccess } from "../../middleware/business.js";
import { requirePermission } from "../../middleware/permissions.js";

const router = express.Router();
const read = [
  requireAuth,
  requireBusinessContext(),
  requirePermission("locations.view"),
] as const;
// Any active member may list their OWN accessible locations — the header
// switcher needs it regardless of role.
const memberRead = [requireAuth, requireBusinessContext()] as const;
const write = [...read, requireFullAccess] as const;

router.get(
  "/api/accessible-locations",
  ...memberRead,
  locationsController.getAccessibleLocations,
);
router.get("/api/locations", ...read, locationsController.getLocations);
router.post("/api/locations", ...write, requirePermission("locations.manage"), locationsController.postLocation);
router.patch("/api/locations/:locationId", ...write, requirePermission("locations.manage"), locationsController.patchLocation);
router.delete("/api/locations/:locationId", ...write, requirePermission("locations.manage"), locationsController.removeLocation);

export default router;
