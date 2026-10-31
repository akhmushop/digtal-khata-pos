import express from "express";
import * as usersController from "./users.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireBusinessContext, requireFullAccess } from "../../middleware/business.js";
import { requirePermission } from "../../middleware/permissions.js";

const router = express.Router();
const read = [
  requireAuth,
  requireBusinessContext(),
  requirePermission("users.view"),
] as const;
const write = [...read, requireFullAccess] as const;

router.get("/api/users", ...read, usersController.getUsers);
router.post("/api/users", ...write, requirePermission("users.create"), usersController.postUser);
router.patch("/api/users/:userId", ...write, requirePermission("users.edit"), usersController.patchUser);
router.post(
  "/api/users/:userId/reset-password",
  ...write,
  requirePermission("users.edit"),
  usersController.postUserPasswordReset,
);

export default router;
