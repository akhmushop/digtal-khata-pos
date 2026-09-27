import { z } from "zod";
export const receiveItemsFormSchema = z.object({
  purchaseId:z.number(),
  items: z.array(
    z
      .object({
        itemId: z.number(),
        trackingType: z.string(),
        receiveNow: z.number().min(0),
        unitCost: z.number().min(0),
        sellingPrice: z.number().min(0),
        batches: z.array(
          z.object({
            batchNumber: z.string().min(1),
            quantity: z.number().min(1),
            manufacturedDate: z.date(),
            expiryDate: z.date(),
          }),
        ),
        serialNumbers: z.array(
          z.string().min(1, "Serial number cannot be empty"),
        ),
      })
      .superRefine((data, ctx) => {
        if (data.trackingType === "serial" && data.receiveNow > 0) {
          if (data.serialNumbers.length !== data.receiveNow) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["serialNumbers"],
              message: `Quantity is ${data.receiveNow}, but you provided ${data.serialNumbers.length} serial numbers.`,
            });
          }
        }
        if (data.trackingType === "batch" && data.receiveNow >= 0) {
          const totalBatchQty = data.batches.reduce(
            (sum, b) => sum + b.quantity,
            0,
          );
          if (totalBatchQty !== data.receiveNow) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["batches"],
              message: `Batch total quantity (${totalBatchQty}) must equal receive quantity (${data.receiveNow}).`,
            });
          }
        }
      }),
  ),

  payment_amount: z.number().min(0),
  paymentMethod: z.string(),
  payment_notes: z.string().optional(),
});
export type ReceiveItemsFormValues = z.infer<typeof receiveItemsFormSchema>;
