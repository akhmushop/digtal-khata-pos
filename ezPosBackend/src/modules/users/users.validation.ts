import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

export const createStaffUserSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("A valid email is required").max(255),
  password: passwordSchema,
  roleIds: z.array(z.number().int().positive()).min(1, "Assign at least one role"),
  locationIds: z.array(z.number().int().positive()).optional(),
});

export const updateStaffUserSchema = z
  .object({
    isActive: z.boolean().optional(),
    roleIds: z
      .array(z.number().int().positive())
      .min(1, "Assign at least one role")
      .optional(),
    locationIds: z.array(z.number().int().positive()).optional(),
  })
  .refine(
    (data) =>
      data.isActive !== undefined ||
      data.roleIds !== undefined ||
      data.locationIds !== undefined,
    "Nothing to update.",
  );

export const resetStaffPasswordSchema = z.object({
  password: passwordSchema,
});

export type CreateStaffUserInput = z.infer<typeof createStaffUserSchema>;
export type UpdateStaffUserInput = z.infer<typeof updateStaffUserSchema>;
export type ResetStaffPasswordInput = z.infer<typeof resetStaffPasswordSchema>;
