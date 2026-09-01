import z from "zod";

export const supplierSchema = z.object({
  supplierName: z.string().min(1, { message: "Supplier Name is required" }),
  phone: z
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .pipe(
      z
        .string()
        .regex(/^\+?[0-9]{7,15}$/, { message: "Invalid phone number" })
        .nullable(),
    ),
  email: z
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .pipe(z.string().email({ message: "Invalid email address" }).nullable()),
  address: z
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : (value ?? null))),
  status: z.enum(["active", "inactive"]).default("active"),
});
export type SupplierSchemaTypeInput = z.input<typeof supplierSchema>;
export type SupplierSchemaTypeOutput = z.output<typeof supplierSchema>;
