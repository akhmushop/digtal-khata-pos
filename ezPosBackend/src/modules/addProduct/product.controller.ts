import type { Request, Response } from "express";
import { handleError } from "../../utils/handleError.js";
import * as productService from "./product.service.js";
import { productSchema } from "./schemas/product.schema.js";

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
export async function createProduct(req: Request, res: Response) {
  try {
    const result = productSchema.safeParse(req.body)
    console.log(result)
  } catch (err: unknown) {
    handleError(res, err);
  }
}
