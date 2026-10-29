import { z } from "zod";

export const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z
    .enum([
      "today",
      "yesterday",
      "7d",
      "30d",
      "this_month",
      "last_month",
      "this_year",
      "custom",
    ])
    .optional()
    .default("this_month"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(50),
  customerId: z.coerce.number().int().optional(),
  supplierId: z.coerce.number().int().optional(),
  categoryId: z.coerce.number().int().optional(),
  brandId: z.coerce.number().int().optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.enum(["paid", "partial", "unpaid"]).optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type DateRangeQuery = z.infer<typeof dateRangeSchema>;

