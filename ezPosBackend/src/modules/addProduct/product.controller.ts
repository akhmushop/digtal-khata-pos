import type { NextFunction, Request, Response } from "express";
import { handleError } from "../../utils/handleError.js";
import * as productService from "./product.service.js";
import { productSchema } from "./schemas/product.schema.js";
import { addCategorySchema } from "./schemas/category.schema.js";
import { brandSchema } from "./schemas/brand.schema.js";
import { unitSchema } from "./schemas/unit.schema.js";
import { variantTypeSchema } from "./schemas/variant.schema.js";

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
