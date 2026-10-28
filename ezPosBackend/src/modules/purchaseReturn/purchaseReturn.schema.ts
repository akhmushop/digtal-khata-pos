import { z } from "zod";

export const createPurchaseReturnSchema = z.object({
  orderId: z.number().int().positive(),
  reason: z.string().max(300).optional(),
  changedItems: z
    .array(
      z.object({
        purchaseItemId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Select at least one item to return."),
});

export type CreatePurchaseReturnInput = z.infer<
  typeof createPurchaseReturnSchema
>;
