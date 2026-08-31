import z from "zod";

export const brandSchema = z.object({
  brandName: z.string().min(1, { message: "Brand name is required" }),
  status: z.enum(["active", "inactive"]),
});
export type BrandSchemaType = z.infer<typeof brandSchema>;
