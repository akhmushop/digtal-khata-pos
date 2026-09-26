import { z } from "zod";
export const receiveItemsFormSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.number(),
      receiveNow: z.number().min(0),
      unitCost: z.number().min(0),
      sellingPrice: z.number().min(0),
    }),
  ),
  payment_amount: z.number().min(0),
  paymentMethod: z.string(),
  payment_notes: z.string().optional(),
});
export type ReceiveItemsFormValues = z.infer<typeof receiveItemsFormSchema>;
