import { AllVariantsType } from "@/types/addProduct.types";
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
  sku: z.string().max(100),
  barcode: z.string().max(100),
  sellingPrice: z.coerce.number().min(0),
  alertQuantity: z.coerce.number().min(0),
  isDefault: z.boolean(),
  status: z.enum([ "active", "inactive"]),
  imageUrl: z.string().url("Invalid URL").nullable(),
  imageFile: z.instanceof(File).nullable(),
  batchNumber: z.string().max(100),
  purchasePrice: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(0),
  expiryDate: z.date().nullable(),
  serialNumbers: z.array(serialNumberSchema).optional(),
});

export const productSchema = z
  .object({
    name: z.string().min(1, { message: "Product name is required" }).max(100),
    categoryId: z.number().int().nullable(),
    brandId: z.number().int().nullable(),
    unitId: z.number().int().nullable(),
    description: z.string().max(120),
    productType: z.enum(["physical", "service", "digital"]),
    hasVariants: z.boolean(),
    trackingType: z.enum(["none", "batch", "serial"]),
    supplierId: z.number().int().nullable(),
    status: z.enum(["draft", "active", "inactive"]),
    imageUrl: z.string().url().nullable(),
    imageFile: z.instanceof(File).nullable(),
    source: z.enum(["purchase","opening"]),
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
    data.variants.forEach((variant, index) => {
      const openingRequiredFields = [
        { key: "quantity" as const, label: "Quantity" },
        { key: "purchasePrice" as const, label: "Purchase Price" },
        { key: "batchNumber" as const, label: "Batch Number" },
      ];
      if (data.source === "opening") {
        openingRequiredFields.forEach(({ key, label }) => {
          if (!variant[key]) {
            ctx.addIssue({
              code: "custom",
              path: ["variants", index, key],
              message: `${label} is required for opening stock`,
            });
          }
        });
      }
      if (data.source === "purchase") {
        if (variant.quantity && variant.quantity > 0) {
          ctx.addIssue({
            code: "custom",
            path: ["variants", index, "quantity"],
            message:
              "Quantity must be 0 when registering a product for future purchase.",
          });
        }
      }
    });
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

export const defaultValues:AddProductFormInput = {
  name: "",
  categoryId: null,
  brandId: null,
  unitId: null,
  description: "",
  productType: "physical",
  hasVariants: false,
  trackingType: "none",
  status: "active",
  imageUrl: null,
  imageFile: null,
  supplierId: null,
  source: "purchase",
  variants: [
    {
      sku: "",
      barcode: "",
      sellingPrice: 0,
      alertQuantity: 0,
      isDefault: true,
      status: "active",
      imageUrl: null,
      imageFile: null,
      purchasePrice: 0,
      quantity: 0,
      expiryDate: null,
      batchNumber: "",
      serialNumbers: [],
    },
  ],
};
export const createVariant = (variant: AllVariantsType):VariantType => ({
  sku: "",
  barcode: "",
  sellingPrice: 0,
  alertQuantity: 0,
  isDefault: false,
  status: "active",
  imageUrl: null,
  imageFile: null,
  batchNumber: "",
  purchasePrice: 0,
  quantity: 0,
  expiryDate: null,
  serialNumbers: [],
  options: {
    color: variant.color,
    size: variant.size,
  },
});
export const emptyVariant: VariantType = {
  sku: "",
  barcode: "",
  sellingPrice: 0,
  alertQuantity: 0,
  isDefault: true,
  status: "active",
  imageUrl: null,
  imageFile: null,
  batchNumber: "",
  purchasePrice: 0,
  quantity: 0,
  expiryDate: null,
  serialNumbers: [],
};
export type VariantType = z.infer<typeof variantSchema>
export type AddProductFormInput = z.input<typeof productSchema>;
export type AddProductFormOutput = z.output<typeof productSchema>;
