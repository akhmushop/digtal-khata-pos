import type { Request, Response } from "express";
import { handleError } from "../../utils/handleError.js";
import * as addProductService from "./addProduct.service.js";

export async function getAddProductsSelectOptions(req: Request, res: Response) {
  try {
    res.json(await addProductService.getAddProductsSelectOptions());
  } catch (err: unknown) {
    handleError(res, err);
  }
}
