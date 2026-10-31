import express from "express";
import * as rolesController from "./roles.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireBusinessContext, requireFullAccess } from "../../middleware/business.js";
import { requirePermission } from "../../middleware/permissions.js";

const router = express.Router();
const read = [
  requireAuth,
  requireBusinessContext(),
  requirePermission("roles.view"),
] as const;
const write = [...read, requireFullAccess] as const;

router.get("/api/permissions", ...read, rolesController.getPermissionCatalog);
router.get("/api/roles", ...read, rolesController.getRoles);
router.post("/api/roles", ...write, requirePermission("roles.create"), rolesController.postRole);
router.patch("/api/roles/:roleId", ...write, requirePermission("roles.edit"), rolesController.patchRole);
router.delete("/api/roles/:roleId", ...write, requirePermission("roles.delete"), rolesController.removeRole);
router.get("/api/roles/:roleId/users", ...read, rolesController.getRoleUsers);

export default router;
