import { z } from "zod";

export const LOCATION_TYPES = [
  "store",
  "warehouse",
  "outlet",
  "head_office",
] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? undefined : value))
    .optional();

export const createLocationSchema = z.object({
  name: z.string().trim().min(1, "Location name is required").max(100),
  locationCode: optionalText(50),
  locationType: z.enum(LOCATION_TYPES).default("store"),
  phone: optionalText(20),
  email: optionalText(255),
  address: optionalText(255),
  city: optionalText(100),
  isDefault: z.boolean().optional(),
});

export const updateLocationSchema = z.object({
  name: z.string().trim().min(1, "Location name is required").max(100).optional(),
  locationCode: optionalText(50),
  locationType: z.enum(LOCATION_TYPES).optional(),
  phone: optionalText(20),
  email: optionalText(255),
  address: optionalText(255),
  city: optionalText(100),
  isDefault: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
