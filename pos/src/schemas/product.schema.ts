import { z } from "zod";
const serialNumberSchema = z.object({
  serial: z.string().min(1),
});
const variantSchema = z.object({
  options: z
    .object({
      color: z.string().min(1, "Color is required"),
      size: z.string().min(1, "Size is required"),
    })
    .optional(),
  sku: z.string().min(1, { message: "SKU is required" }).max(100),
  barcode: z.string().max(100),
  sellingPrice: z.coerce.number().min(0),
  alertQuantity: z.coerce.number().min(0),
  isDefault: z.boolean(),
  status: z.string().nullable(),
  image: z.string().optional(),
  batchNumber: z.string().max(100),
  purchasePrice: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(0),
  expiryDate: z.coerce.date().nullable(),
  serialNumbers: z.array(serialNumberSchema),
});

export const productSchema = z
  .object({
    name: z.string().min(1, { message: "Product name is required" }).max(100),
    categoryId: z.number().int().nullable(),
    brandId: z.number().int().nullable(),
    unitId: z.number().int().nullable(),
    description: z.string().max(120),
    productType: z.string().nullable(),
    hasVariants: z.boolean().default(false),
    trackingType: z.string().nullable(),
    supplierId: z.number().int().nullable(),
    status: z.string().nullable(),
    image: z.string().optional(),
    source: z.string(),
    variants: z.array(variantSchema),
  })
  .superRefine((data, ctx) => {
    if (data.hasVariants) {
      if (data.variants.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["variants"],
          message: "Add at least one variant if the product has variants",
        });
      }
      data.variants.forEach((variant, index) => {
        if (!variant.options?.color) {
          ctx.addIssue({
            code: "custom",
            path: ["variants", index, "options", "color"],
            message: "Color is required",
          });
        }
        if (!variant.options?.size) {
          ctx.addIssue({
            code: "custom",
            path: ["variants", index, "options", "size"],
            message: "Size is required",
          });
        }
      });
    }
    // data.variants.map((variant, index) => {
    //   if (variant.serialNumbers.length === 0) {
    //     ctx.addIssue({
    //       code: "custom",
    //       path: ["variants", index, "serialNumber"],
    //       message:
    //         "Add Serial number if the product has serial number or remove it if not required",
    //     });
    //   }
    // });
  });
