import z from "zod";

export const addCategorySchema = z.object({
  categoryName: z.string().min(1, { message: "Category name is required" }),
  parentCategoryId: z.number().int().nullable(),
  description: z.string().max(120),
  status: z.enum(["active", "inactive"]),
});
export type AddCategorySchemaType = z.infer<typeof addCategorySchema>