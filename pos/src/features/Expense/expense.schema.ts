import z from "zod";

export const expenseSchema = z.object({
  title: z.string().trim().min(1, "Enter an expense title").max(255),
  expenseDate: z.string().min(1, "Choose an expense date"),
  amount: z.number().finite().positive("Amount must be greater than zero"),
  categoryId: z
    .string()
    .transform((value) => (value === "none" ? null : Number(value)))
    .pipe(z.number().int().positive().nullable()),
  paymentMethod: z.enum(["Cash", "Mobile", "Card"]),
  referenceNo: z.string().trim().max(100, "Reference number is too long"),
  note: z.string().trim(),
});

export type ExpenseFormInput = z.input<typeof expenseSchema>;
export type ExpenseFormOutput = z.output<typeof expenseSchema>;
