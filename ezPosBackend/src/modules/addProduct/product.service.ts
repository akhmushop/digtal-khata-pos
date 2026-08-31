import { eq, sql, type ExtractTablesWithRelations } from "drizzle-orm";
import { brands } from "../../db/schema/brands.js";
import { categories } from "../../db/schema/categories.js";
import { db } from "../../db/schema/index.js";
import { suppliers } from "../../db/schema/suppliers.js";
import { units } from "../../db/schema/units.js";
import { variantOptions } from "../../db/schema/variantOptions.js";
import { variantTypes } from "../../db/schema/variantTypes.js";
import type { ProductType, VariantType } from "./schemas/product.schema.js";
import { NotFoundError } from "../../utils/handleError.js";
import { error } from "node:console";
import { products } from "../../db/schema/products.js";
import { productVariants } from "../../db/schema/productVariants.js";
import { variantValues } from "../../db/schema/variantValues.js";
import { serialNumbers } from "../../db/schema/serialNumbers.js";
import { inventoryBatches } from "../../db/schema/inventoryBatches.js";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { inventoryStock } from "../../db/schema/inventoryStock.js";
import type { AddCategorySchemaType } from "./schemas/category.schema.js";
import { number } from "zod";

async function getBrands() {
  return db
    .select({
      value: brands.id,
      label: brands.name,
    })
    .from(brands);
}
async function getUnits() {
  return db
    .select({
      value: units.id,
      label: units.name,
    })
    .from(units);
}
async function getCategories() {
  return db
    .select({
      value: categories.id,
      label: categories.name,
    })
    .from(categories);
}
async function getSuppliers() {
  return db
    .select({
      value: suppliers.id,
      label: suppliers.name,
    })
    .from(suppliers);
}
export async function getProductSelectOptions() {
  const [allBrands, allUnits, allCategories, allSuppliers] = await Promise.all([
    getBrands(),
    getUnits(),
    getCategories(),
    getSuppliers(),
  ]);
  return {
    brands: allBrands,
    units: allUnits,
    categories: allCategories,
    suppliers: allSuppliers,
  };
}
export async function getProductVariantOptions() {
  return await db
    .select({
      typeId: variantTypes.id,
      typeName: variantTypes.name,
      options: sql<
        { optionId: number; value: string }[]
      >`ARRAY_AGG( JSON_BUILD_OBJECT('optionId',${variantOptions.id},'value',${variantOptions.value}) ORDER BY ${variantOptions.value})`,
    })
    .from(variantOptions)
    .innerJoin(variantTypes, eq(variantOptions.variantTypeId, variantTypes.id))
    .groupBy(variantTypes.id, variantTypes.name);
}
async function validateProductReferences(
  tx: PgTransaction<
    NodePgQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >,
  data: ProductType,
) {
  //1. category
  if (data.categoryId !== null) {
    const category = await tx
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, data.categoryId));
    if (category.length === 0) {
      throw new NotFoundError("Category does not exist");
    }
  }
  //2. brand
  if (data.brandId !== null) {
    const brand = await tx
      .select({ id: brands.id })
      .from(brands)
      .where(eq(brands.id, data.brandId));
    if (brand.length === 0) {
      throw new NotFoundError("Brand does not exist");
    }
  }
  //3. unit
  const unit = await tx
    .select({ id: units.id })
    .from(units)
    .where(eq(units.id, data.unitId));
  if (unit.length === 0) {
    throw new NotFoundError("Unit does not exist");
  }
  //4. validate suppliers
  if (data.supplierId !== null) {
    const supplier = await tx
      .select({ id: suppliers.id })
      .from(suppliers)
      .where(eq(suppliers.id, data.supplierId));
    if (supplier.length === 0) {
      throw new NotFoundError("Supplier does not exist");
    }
  }
}
function validateProductRules(data: ProductType) {
  // If product has variants, at least one variant is required
  if (data.hasVariants && data.variants.length === 0) {
    throw new NotFoundError(
      "Product with variants must have at least one variant",
    );
  }
  // validate default variants
  const defaultVariants = data.variants.filter((variant) => variant.isDefault);
  if (defaultVariants.length > 1) {
    throw new NotFoundError("Only one variant can be the default variant");
  }
  // validate one default
  if (
    data.hasVariants &&
    data.variants.length > 0 &&
    defaultVariants.length === 0
  ) {
    throw new NotFoundError("One variant must be selected as default");
  }
}
async function validateVariantRulesAndRef(
  tx: PgTransaction<
    NodePgQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >,
  data: ProductType,
) {
  for (const variant of data.variants) {
    // Options
    if (data.hasVariants) {
      if (!variant.options || variant.options.length === 0) {
        throw new NotFoundError("Variant options are required");
      }

      // Validate option IDs
      for (const option of variant.options) {
        const variantOption = await tx
          .select({ id: variantOptions.id })
          .from(variantOptions)
          .where(eq(variantOptions.id, option.optionId));

        if (variantOption.length === 0) {
          throw new NotFoundError(
            `Variant option ${option.optionId} does not exist`,
          );
        }
      }
    }

    // ==========================================================
    // OPENING STOCK VALIDATION
    // ==========================================================

    if (data.source === "opening") {
      if (variant.quantity < 0) {
        throw new NotFoundError("Opening quantity cannot be negative");
      }

      // NONE
      if (data.trackingType === "none") {
        if (variant.serialNumbers?.length) {
          throw new NotFoundError(
            "Serial numbers are not allowed for non-serial products",
          );
        }
      }

      // BATCH
      if (data.trackingType === "batch") {
        if (!variant.batchNumber) {
          throw new NotFoundError(
            "Batch number is required for batch-tracked products",
          );
        }

        if (variant.serialNumbers?.length) {
          throw new NotFoundError(
            "Serial numbers are not allowed for batch-tracked products",
          );
        }
      }

      // SERIAL
      if (data.trackingType === "serial") {
        if (!variant.serialNumbers) {
          throw new NotFoundError("Serial numbers are required");
        }

        if (variant.serialNumbers.length !== variant.quantity) {
          throw new NotFoundError(
            "Number of serial numbers must equal opening quantity",
          );
        }

        // Check duplicate serial numbers inside request
        const serials = variant.serialNumbers.map((item) => item.serial);

        const uniqueSerials = new Set(serials);

        if (uniqueSerials.size !== serials.length) {
          throw new NotFoundError("Duplicate serial numbers are not allowed");
        }
      }
    }
  }
}
async function insertProduct(
  tx: PgTransaction<
    NodePgQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >,
  data: ProductType,
) {
  const [productResult] = await tx
    .insert(products)
    .values({
      name: data.name,
      categoryId: data.categoryId,
      brandId: data.brandId,
      unitId: data.unitId,
      description: data.description,
      productType: data.productType,
      hasVariants: data.hasVariants,
      trackingType: data.trackingType,
      status: data.status,
    })
    .returning({ id: products.id });
  if (!productResult) {
    throw new NotFoundError("Product could not be created");
  }
  return productResult;
}
async function insertVariant(
  tx: PgTransaction<
    NodePgQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >,
  productId: number,
  variant: VariantType,
  sku: string,
) {
  const [variantResult] = await tx
    .insert(productVariants)
    .values({
      productId,
      sku,
      barcode: variant.barcode,
      sellingPrice: variant.sellingPrice,
      alertQuantity: variant.alertQuantity,
      isDefault: variant.isDefault,
      status: variant.status,
    })
    .returning({ id: productVariants.id });
  if (!variantResult) {
    throw new NotFoundError("variant could not be created");
  }
  return variantResult;
}
async function insertVariantOptions(
  tx: PgTransaction<
    NodePgQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >,
  data: ProductType,
  variant: VariantType,
  variantId: number,
) {
  if (data.hasVariants) {
    if (!variant.options) {
      throw new NotFoundError("Variant options are required");
    }
    for (const option of variant.options) {
      await tx.insert(variantValues).values({
        variantId,
        optionId: option.optionId,
      });
    }
  }
}
async function insertBatch(
  tx: PgTransaction<
    NodePgQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >,
  variant: VariantType,
  variantId: number,
) {
  const [batchResult] = await tx
    .insert(inventoryBatches)
    .values({
      variantId,
      locationId: null,
      purchaseItemId: null,
      batchNumber: variant.batchNumber ?? null,
      purchasePrice: variant.purchasePrice,
      quantityReceived: variant.quantity,
      quantityRemaining: variant.quantity,
      expiryDate: variant.expiryDate,
    })
    .returning({ id: inventoryBatches.id });
  if (!batchResult) {
    throw new NotFoundError("Batch could not be created");
  }
  return batchResult;
}
async function insertSerialNumber(
  tx: PgTransaction<
    NodePgQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >,
  variant: VariantType,
  variantId: number,
  batchId: number,
) {
  if (!variant.serialNumbers) {
    throw new NotFoundError("Serial numbers are required");
  }
  for (const serialNumber of variant.serialNumbers) {
    await tx.insert(serialNumbers).values({
      variantId,
      serialNumber: serialNumber.serial,
      batchId,
    });
  }
}
async function insertInventoryStock(
  tx: PgTransaction<
    NodePgQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >,
  variantId: number,
  quantity: number,
) {
  await tx.insert(inventoryStock).values({
    variantId,
    quantity,
  });
}
async function generateSku(
  tx: PgTransaction<
    NodePgQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >,
) {
  const result = await tx.execute(
    sql`SELECT nextval('product_sku_seq') AS number`,
  );
  const row = result.rows[0];
  if (!row) {
    throw new NotFoundError("Failed to generate product SKU");
  }
  const number = Number(row.number);
  return `SKU-${number.toString().padStart(6, "0")}`;
}
export async function createProduct(data: ProductType) {
  try {
    await db.transaction(async (tx) => {
      await validateProductReferences(tx, data);

      validateProductRules(data);

      await validateVariantRulesAndRef(tx, data);

      const product = await insertProduct(tx, data);

      for (const variant of data.variants) {
        const sku = variant.sku?.trim() || (await generateSku(tx));
        const createdVariant = await insertVariant(
          tx,
          product.id,
          variant,
          sku,
        );

        await insertVariantOptions(tx, data, variant, createdVariant.id);
        await insertInventoryStock(tx, createdVariant.id, variant.quantity);
        if (data.source === "opening") {
          const batch = await insertBatch(tx, variant, createdVariant.id);
          if (data.trackingType === "serial") {
            await insertSerialNumber(tx, variant, createdVariant.id, batch.id);
          }
        }
      }
      return { productId: product.id };
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}
export async function createCategory(data: AddCategorySchemaType) {
  const [category] = await db
    .insert(categories)
    .values({
      name: data.categoryName,
      description: data.description,
      status: data.status,
      parentId: data.parentCategoryId,
    })
    .returning({ value: categories.id, label: categories.name });
  return category;
}
