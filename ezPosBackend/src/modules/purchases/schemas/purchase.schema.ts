import { z } from "zod";
export const createPurchaseSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.number().int().positive(),
        quantity: z.number().positive(),
        purchasePrice: z.number().nonnegative(),
      }),
    )
    .min(1, "At least one purchase item is required"),
  supplierId: z.number().int().positive().nullable(),
  purchaseDate: z.coerce.date(),
  notes: z
    .string()
    .max(300, "Notes are too long")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val?.trim() === "" ? null : val)),
});
export type CreatePurchaseInput =
  z.output<typeof createPurchaseSchema>;