import z from "zod";

export const variantTypeSchema = z.object({
  variantTypeName: z
    .string()
    .min(1, { message: "Variant type name is required" }),
});
export const variantOptionSchema = z.object({
  variantTypeId: z
    .number()
    .int()
    .min(1, { message: "Variant type is required" })
    .nullable(),
  variantOptionName: z
    .array(z.string().min(1, { message: "Option name cannot be empty" }))
    .min(1, { message: "Please add at least one variant option" }),
});
export type VariantTypeSchemaType = z.infer<typeof variantTypeSchema>;
export type VariantOptionSchemaType = z.infer<typeof variantOptionSchema>;
