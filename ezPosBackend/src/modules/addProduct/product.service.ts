import {
  and,
  eq,
  inArray,
  sql,
  type ExtractTablesWithRelations,
} from "drizzle-orm";
import { brands } from "../../db/schema/brands.js";
import { categories } from "../../db/schema/categories.js";
import { db } from "../../db/schema/index.js";
import { suppliers } from "../../db/schema/suppliers.js";
import { units } from "../../db/schema/units.js";
import { variantOptions } from "../../db/schema/variantOptions.js";
import { variantTypes } from "../../db/schema/variantTypes.js";
import type { ProductType, VariantType } from "./schemas/product.schema.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../utils/handleError.js";
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
import type { BrandSchemaType } from "./schemas/brand.schema.js";
import type { UnitSchemaType } from "./schemas/unit.schema.js";
import type {
  VariantOptionSchemaType,
  VariantTypeSchemaType,
} from "./schemas/variant.schema.js";

async function getBrands() {
  return db
    .select({
      value: brands.id,
      label: brands.name,
      status: sql<string>`COALESCE(${brands.status}, 'active')`,
      productCount: sql<number>`(SELECT COUNT(*)::int FROM products WHERE brand_id = ${brands.id})`,
    })
    .from(brands);
}
async function getUnits() {
  return db
    .select({
      value: units.id,
      label: units.name,
      abbreviation: units.abbreviation,
      productCount: sql<number>`(SELECT COUNT(*)::int FROM products WHERE unit_id = ${units.id})`,
    })
    .from(units);
}
async function getCategories() {
  return db
    .select({
      value: categories.id,
      label: categories.name,
      parentCategoryId: categories.parentId,
      description: categories.description,
      status: sql<string>`COALESCE(${categories.status}, 'active')`,
      productCount: sql<number>`(SELECT COUNT(*)::int FROM products WHERE category_id = ${categories.id})`,
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
      options: sql<{ optionId: number; value: string }[]>`
        COALESCE(
          ARRAY_AGG(
              JSON_BUILD_OBJECT('optionId',${variantOptions.id},'value',${variantOptions.value})
              ORDER BY ${variantOptions.value}
            ) FILTER (WHERE ${variantOptions.id} IS NOT NULL),
            ARRAY[]::json[]
        )
      `,
    })
    .from(variantTypes)
    .leftJoin(variantOptions, eq(variantOptions.variantTypeId, variantTypes.id))
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
export async function getProductForEdit(id: number) {
  const [product] = await db.select().from(products).where(eq(products.id, id));
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const variants = await db
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      barcode: productVariants.barcode,
      sellingPrice: productVariants.sellingPrice,
      alertQuantity: productVariants.alertQuantity,
      isDefault: productVariants.isDefault,
      status: productVariants.status,
    })
    .from(productVariants)
    .where(eq(productVariants.productId, id));

  const optionRows =
    variants.length === 0
      ? []
      : await db
          .select({
            variantId: variantValues.variantId,
            typeId: variantTypes.id,
            typeName: variantTypes.name,
            optionId: variantOptions.id,
            value: variantOptions.value,
          })
          .from(variantValues)
          .innerJoin(
            variantOptions,
            eq(variantOptions.id, variantValues.optionId),
          )
          .innerJoin(
            variantTypes,
            eq(variantTypes.id, variantOptions.variantTypeId),
          )
          .where(
            inArray(
              variantValues.variantId,
              variants.map((variant) => variant.id),
            ),
          );
  const optionsByVariant = new Map<number, typeof optionRows>();
  for (const option of optionRows) {
    const options = optionsByVariant.get(option.variantId) ?? [];
    options.push(option);
    optionsByVariant.set(option.variantId, options);
  }

  return {
    name: product.name,
    categoryId: product.categoryId,
    brandId: product.brandId,
    unitId: product.unitId,
    description: product.description ?? "",
    productType: product.productType ?? "physical",
    hasVariants: product.hasVariants ?? false,
    trackingType: product.trackingType ?? "none",
    supplierId: null,
    status: product.status ?? "active",
    imageUrl: null,
    imageFile: null,
    source: "purchase",
    variants: variants.map((variant) => ({
      ...variant,
      options: (optionsByVariant.get(variant.id) ?? []).map(
        ({ typeId, typeName, optionId, value }) => ({
          typeId,
          typeName,
          optionId,
          value,
        }),
      ),
      barcode: variant.barcode ?? "",
      alertQuantity: variant.alertQuantity ?? 0,
      status: variant.status ?? "active",
      imageUrl: null,
      imageFile: null,
      batchNumber: "",
      purchasePrice: 0,
      quantity: 0,
      expiryDate: null,
      serialNumbers: [],
    })),
  };
}
export async function updateProduct(id: number, data: ProductType) {
  return db.transaction(async (tx) => {
    const [existingProduct] = await tx
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, id));
    if (!existingProduct) {
      throw new NotFoundError("Product not found");
    }

    await validateProductReferences(tx, data);
    validateProductRules(data);
    await validateVariantRulesAndRef(tx, data);

    const existingVariants = await tx
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(eq(productVariants.productId, id));
    const existingVariantIds = new Set(
      existingVariants.map((variant) => variant.id),
    );
    const submittedVariantIds = data.variants.map((variant) => variant.id);
    if (
      submittedVariantIds.length !== existingVariants.length ||
      submittedVariantIds.some((variantId) => variantId === undefined) ||
      new Set(submittedVariantIds).size !== existingVariants.length ||
      submittedVariantIds.some(
        (variantId) =>
          variantId === undefined || !existingVariantIds.has(variantId),
      )
    ) {
      throw new BadRequestError(
        "Existing variants cannot be added or removed while editing. Stock and variant history are preserved.",
      );
    }

    await tx
      .update(products)
      .set({
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
      .where(eq(products.id, id));

    for (const variant of data.variants) {
      const variantId = variant.id;
      if (variantId === undefined) {
        throw new BadRequestError("Variant ID is required while editing.");
      }

      await tx
        .update(productVariants)
        .set({
          sku: variant.sku.trim() || (await generateSku(tx)),
          barcode: variant.barcode?.trim() || null,
          sellingPrice: variant.sellingPrice,
          alertQuantity: variant.alertQuantity,
          isDefault: variant.isDefault,
          status: variant.status,
        })
        .where(
          and(
            eq(productVariants.id, variantId),
            eq(productVariants.productId, id),
          ),
        );

      await tx
        .delete(variantValues)
        .where(eq(variantValues.variantId, variantId));
      if (data.hasVariants && variant.options?.length) {
        await tx.insert(variantValues).values(
          variant.options.map((option) => ({
            variantId,
            optionId: option.optionId,
          })),
        );
      }
    }

    return { productId: id };
  });
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
    .returning({
      value: categories.id,
      label: categories.name,
      parentCategoryId: categories.parentId,
      description: categories.description,
      status: sql<string>`COALESCE(${categories.status}, 'active')`,
      productCount: sql<number>`0`,
    });
  return category;
}
export async function createBrand(data: BrandSchemaType) {
  const [brand] = await db
    .insert(brands)
    .values({
      name: data.brandName,
      status: data.status,
    })
    .returning({
      value: brands.id,
      label: brands.name,
      status: sql<string>`COALESCE(${brands.status}, 'active')`,
      productCount: sql<number>`0`,
    });
  return brand;
}
export async function createUnit(data: UnitSchemaType) {
  const [unit] = await db
    .insert(units)
    .values({
      name: data.unitName,
      abbreviation: data.abbreviation,
    })
    .returning({
      value: units.id,
      label: units.name,
      abbreviation: units.abbreviation,
      productCount: sql<number>`0`,
    });
  return unit;
}
export async function createVariantType(data: VariantTypeSchemaType) {
  const [variantType] = await db
    .insert(variantTypes)
    .values({
      name: data.variantTypeName,
    })
    .returning();
  return variantType;
}
export async function createVariantOption(data: VariantOptionSchemaType) {
  if (data.variantOptionName.length === 0) {
    throw new NotFoundError("Please add at least one variant option");
  }
  const optionsToInsert = data.variantOptionName.map((optionName) => ({
    variantTypeId: data.variantTypeId,
    value: optionName,
  }));
  const insertedOptions = await db
    .insert(variantOptions)
    .values(optionsToInsert)
    .returning();
  return insertedOptions;
}

export async function updateCategory(
  id: number,
  data: AddCategorySchemaType,
) {
  if (data.parentCategoryId === id) {
    throw new BadRequestError("A category cannot be its own parent");
  }
  let parentId = data.parentCategoryId;
  while (parentId !== null) {
    if (parentId === id) {
      throw new BadRequestError("A category cannot be moved under its child");
    }
    const [parent] = await db
      .select({ parentId: categories.parentId })
      .from(categories)
      .where(eq(categories.id, parentId))
      .limit(1);
    if (!parent) {
      throw new NotFoundError("Parent category does not exist");
    }
    parentId = parent.parentId;
  }
  const [category] = await db
    .update(categories)
    .set({
      name: data.categoryName,
      description: data.description,
      status: data.status,
      parentId: data.parentCategoryId,
    })
    .where(eq(categories.id, id))
    .returning({
      value: categories.id,
      label: categories.name,
      parentCategoryId: categories.parentId,
      description: categories.description,
      status: sql<string>`COALESCE(${categories.status}, 'active')`,
      productCount: sql<number>`(SELECT COUNT(*)::int FROM products WHERE category_id = ${categories.id})`,
    });
  if (!category) {
    throw new NotFoundError("Category does not exist");
  }
  return category;
}

export async function deleteCategory(id: number) {
  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.categoryId, id))
    .limit(1);
  if (product) {
    throw new ConflictError("Move or remove products in this category first");
  }
  const [child] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.parentId, id))
    .limit(1);
  if (child) {
    throw new ConflictError("Move or remove subcategories first");
  }
  const [category] = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning({ id: categories.id });
  if (!category) {
    throw new NotFoundError("Category does not exist");
  }
}

export async function updateBrand(id: number, data: BrandSchemaType) {
  const [brand] = await db
    .update(brands)
    .set({ name: data.brandName, status: data.status })
    .where(eq(brands.id, id))
    .returning({
      value: brands.id,
      label: brands.name,
      status: sql<string>`COALESCE(${brands.status}, 'active')`,
      productCount: sql<number>`(SELECT COUNT(*)::int FROM products WHERE brand_id = ${brands.id})`,
    });
  if (!brand) {
    throw new NotFoundError("Brand does not exist");
  }
  return brand;
}

export async function deleteBrand(id: number) {
  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.brandId, id))
    .limit(1);
  if (product) {
    throw new ConflictError("Remove this brand from its products first");
  }
  const [brand] = await db
    .delete(brands)
    .where(eq(brands.id, id))
    .returning({ id: brands.id });
  if (!brand) {
    throw new NotFoundError("Brand does not exist");
  }
}

export async function updateUnit(id: number, data: UnitSchemaType) {
  const [unit] = await db
    .update(units)
    .set({ name: data.unitName, abbreviation: data.abbreviation })
    .where(eq(units.id, id))
    .returning({
      value: units.id,
      label: units.name,
      abbreviation: units.abbreviation,
      productCount: sql<number>`(SELECT COUNT(*)::int FROM products WHERE unit_id = ${units.id})`,
    });
  if (!unit) {
    throw new NotFoundError("Unit does not exist");
  }
  return unit;
}

export async function deleteUnit(id: number) {
  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.unitId, id))
    .limit(1);
  if (product) {
    throw new ConflictError("Move or update products using this unit first");
  }
  const [unit] = await db
    .delete(units)
    .where(eq(units.id, id))
    .returning({ id: units.id });
  if (!unit) {
    throw new NotFoundError("Unit does not exist");
  }
}

export async function updateVariantType(
  id: number,
  data: VariantTypeSchemaType,
) {
  const [variantType] = await db
    .update(variantTypes)
    .set({ name: data.variantTypeName })
    .where(eq(variantTypes.id, id))
    .returning();
  if (!variantType) {
    throw new NotFoundError("Variant type does not exist");
  }
  return variantType;
}

export async function deleteVariantType(id: number) {
  await db.transaction(async (tx) => {
    const [variantType] = await tx
      .select({ id: variantTypes.id })
      .from(variantTypes)
      .where(eq(variantTypes.id, id))
      .limit(1);
    if (!variantType) {
      throw new NotFoundError("Variant type does not exist");
    }

    const options = await tx
      .select({ id: variantOptions.id })
      .from(variantOptions)
      .where(eq(variantOptions.variantTypeId, id));
    const optionIds = options.map((option) => option.id);

    if (optionIds.length > 0) {
      const [usage] = await tx
        .select({ variantId: variantValues.variantId })
        .from(variantValues)
        .where(inArray(variantValues.optionId, optionIds))
        .limit(1);
      if (usage) {
        throw new ConflictError(
          "Remove this variant type's options from product variants before deleting the type",
        );
      }

      await tx
        .delete(variantOptions)
        .where(eq(variantOptions.variantTypeId, id));
    }

    await tx.delete(variantTypes).where(eq(variantTypes.id, id));
  });
}

export async function updateVariantOption(
  id: number,
  data: { value: string },
) {
  const [option] = await db
    .update(variantOptions)
    .set({ value: data.value })
    .where(eq(variantOptions.id, id))
    .returning();
  if (!option) {
    throw new NotFoundError("Variant option does not exist");
  }
  return option;
}

export async function deleteVariantOption(id: number) {
  const [usage] = await db
    .select({ variantId: variantValues.variantId })
    .from(variantValues)
    .where(eq(variantValues.optionId, id))
    .limit(1);
  if (usage) {
    throw new ConflictError(
      "This option is used by product variants and cannot be deleted",
    );
  }
  const [option] = await db
    .delete(variantOptions)
    .where(eq(variantOptions.id, id))
    .returning({ id: variantOptions.id });
  if (!option) {
    throw new NotFoundError("Variant option does not exist");
  }
}
