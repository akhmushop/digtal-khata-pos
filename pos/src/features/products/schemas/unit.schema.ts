import z from "zod";

export const unitSchema = z.object({
  unitName: z.string().min(1, { message: "Unit name is required" }),
  abbreviation: z.string().min(1, { message: "Abbreviation is required" }),
});
export type UnitSchemaType = z.infer<typeof unitSchema>;
