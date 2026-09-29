import z from "zod";
export const batchSchema = z.object({
  batchNumber: z.string().min(1, { message: "Batch number is required" }),
  quantity: z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .pipe(z.number().min(1, { message: "Quantity must be a positive number" })),
  manufacturedDate: z
    .date({ message: "Invalid manufactured date" })
    .nullable()
    .refine((val) => val !== null, {
      message: "Manufactured date is required",
    }),
  expiryDate: z
    .date({ message: "Invalid Expiry date" })
    .nullable()
    .refine((val) => val !== null, {
      message: "Expiry date is required",
    }),
});
export type BatchSchemaTypeInput = z.input<typeof batchSchema>;
export type BatchSchemaTypeOutput = z.output<typeof batchSchema>;
