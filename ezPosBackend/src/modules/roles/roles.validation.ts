import { z } from "zod";
import { isValidPermissionKey } from "../../rbac/permissions.js";

export const createRoleSchema = z.object({
  name: z.string().trim().min(1, "Role name is required").max(100),
  permissionKeys: z
    .array(
      z
        .string()
        .refine(isValidPermissionKey, "Unknown permission key"),
    )
    .max(200),
});

export const updateRoleSchema = z.object({
  name: z.string().trim().min(1, "Role name is required").max(100).optional(),
  permissionKeys: z
    .array(
      z
        .string()
        .refine(isValidPermissionKey, "Unknown permission key"),
    )
    .max(200)
    .optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
