import type { NextFunction, Request, Response } from "express";
import { handleError } from "../../utils/handleError.js";
import * as productService from "./product.service.js";
import { productSchema } from "./schemas/product.schema.js";
import { addCategorySchema } from "./schemas/category.schema.js";
import { brandSchema } from "./schemas/brand.schema.js";
import { unitSchema } from "./schemas/unit.schema.js";
import {
  variantOptionSchema,
  variantOptionValueSchema,
  variantTypeSchema,
} from "./schemas/variant.schema.js";

function getEntityId(req: Request, res: Response): number | null {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ message: "Invalid entity ID" });
    return null;
  }
  return id;
}

export async function getProductSelectOptions(req: Request, res: Response) {
  try {
    res.json(await productService.getProductSelectOptions());
  } catch (err: unknown) {
    handleError(res, err);
  }
}
export async function getProductVariantOptions(req: Request, res: Response) {
  try {
    res.json(await productService.getProductVariantOptions());
  } catch (err: unknown) {
    handleError(res, err);
  }
}
export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = productSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid product data",
        errors: result.error.flatten(),
      });
    }
    const product = await productService.createProduct(result.data);
    return res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (err: unknown) {
    next(err);
  }
}
export async function getProductForEdit(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    return res.json(await productService.getProductForEdit(id));
  } catch (err: unknown) {
    return handleError(res, err);
  }
}
export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const result = productSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid product data",
        errors: result.error.flatten(),
      });
    }
    const product = await productService.updateProduct(id, result.data);
    return res.json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (err: unknown) {
    return next(err);
  }
}
export async function createCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = addCategorySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid category data",
        errors: result.error.flatten(),
      });
    }
    const category = await productService.createCategory(result.data);
    return res.status(201).json({
      message: "Category created successfully",
      data: category,
    });
  } catch (err: unknown) {
    next(err);
  }
}
export async function updateCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = getEntityId(req, res);
  if (id === null) return;
  const result = addCategorySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid category data",
      errors: result.error.flatten(),
    });
  }
  try {
    const category = await productService.updateCategory(id, result.data);
    return res.json({ message: "Category updated successfully", data: category });
  } catch (err: unknown) {
    return next(err);
  }
}
export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = getEntityId(req, res);
  if (id === null) return;
  try {
    await productService.deleteCategory(id);
    return res.json({ message: "Category deleted successfully" });
  } catch (err: unknown) {
    return next(err);
  }
}
export async function createBrand(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = brandSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid brand data",
        errors: result.error.flatten(),
      });
    }
    const brand = await productService.createBrand(result.data);
    return res.status(201).json({
      message: "Brand created successfully",
      data: brand,
    });
  } catch (err: unknown) {
    next(err);
  }
}
export async function updateBrand(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = getEntityId(req, res);
  if (id === null) return;
  const result = brandSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid brand data",
      errors: result.error.flatten(),
    });
  }
  try {
    const brand = await productService.updateBrand(id, result.data);
    return res.json({ message: "Brand updated successfully", data: brand });
  } catch (err: unknown) {
    return next(err);
  }
}
export async function deleteBrand(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = getEntityId(req, res);
  if (id === null) return;
  try {
    await productService.deleteBrand(id);
    return res.json({ message: "Brand deleted successfully" });
  } catch (err: unknown) {
    return next(err);
  }
}
export async function createUnit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = unitSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid unit data",
        errors: result.error.flatten(),
      });
    }
    const unit = await productService.createUnit(result.data);
    return res.status(201).json({
      message: "Unit created successfully",
      data: unit,
    });
  } catch (err: unknown) {
    next(err);
  }
}
export async function updateUnit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = getEntityId(req, res);
  if (id === null) return;
  const result = unitSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid unit data",
      errors: result.error.flatten(),
    });
  }
  try {
    const unit = await productService.updateUnit(id, result.data);
    return res.json({ message: "Unit updated successfully", data: unit });
  } catch (err: unknown) {
    return next(err);
  }
}
export async function deleteUnit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = getEntityId(req, res);
  if (id === null) return;
  try {
    await productService.deleteUnit(id);
    return res.json({ message: "Unit deleted successfully" });
  } catch (err: unknown) {
    return next(err);
  }
}
export async function createVariantType(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = variantTypeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid Variant Type data",
        errors: result.error.flatten(),
      });
    }
    const variantType = await productService.createVariantType(result.data);
    return res.status(201).json({
      message: "Variant Type created successfully",
      data: variantType,
    });
  } catch (err: unknown) {
    next(err);
  }
}
export async function updateVariantType(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = getEntityId(req, res);
  if (id === null) return;
  const result = variantTypeSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid variant type data",
      errors: result.error.flatten(),
    });
  }
  try {
    const variantType = await productService.updateVariantType(id, result.data);
    return res.json({
      message: "Variant type updated successfully",
      data: variantType,
    });
  } catch (err: unknown) {
    return next(err);
  }
}
export async function deleteVariantType(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = getEntityId(req, res);
  if (id === null) return;
  try {
    await productService.deleteVariantType(id);
    return res.json({ message: "Variant type deleted successfully" });
  } catch (err: unknown) {
    return next(err);
  }
}
export async function createVariantOption(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = variantOptionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid Variant Option data",
        errors: result.error.flatten(),
      });
    }
    const variantOptions = await productService.createVariantOption(
      result.data,
    );
    return res.status(201).json({
      message: "Variant Options created successfully",
      data: variantOptions,
    });
  } catch (err: unknown) {
    next(err);
  }
}

export async function updateVariantOption(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = getEntityId(req, res);
  if (id === null) return;
  const result = variantOptionValueSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid variant option data",
      errors: result.error.flatten(),
    });
  }
  try {
    const option = await productService.updateVariantOption(id, result.data);
    return res.json({
      message: "Variant option updated successfully",
      data: option,
    });
  } catch (err: unknown) {
    return next(err);
  }
}

export async function deleteVariantOption(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = getEntityId(req, res);
  if (id === null) return;
  try {
    await productService.deleteVariantOption(id);
    return res.json({ message: "Variant option deleted successfully" });
  } catch (err: unknown) {
    return next(err);
  }
}
