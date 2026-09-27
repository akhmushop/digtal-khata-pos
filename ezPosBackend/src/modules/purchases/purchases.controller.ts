import type { NextFunction, Request, Response } from "express";
import * as purchasesService from "./purchases.service.js";
import type {
  createPurchaseInput,
  purchasesUpdateInput,
} from "../../types/purchases-type.js";
import { handleError } from "../../utils/handleError.js";
import { createPurchaseSchema } from "./schemas/purchase.schema.js";

export async function createPurchase(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = createPurchaseSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid purchase data",
        errors: result.error.flatten(),
      });
    }
    const purchase = await purchasesService.createPurchase(result.data)
    return res.status(201).json({
      message: "Purchase created successfully",
      data:purchase
    })
  } catch (err) {
    next(err);
  }
}
export async function getPurchasesSummary(req: Request, res: Response) {
  try {
    const result = await purchasesService.getPurchasesSummary();
    res.status(200).json(result);
  } catch (err) {
    handleError(res, err);
  }
}
export async function getPurchasesItems(req: Request, res: Response) {
  try {
    const result = await purchasesService.getPurchasesItems();
    res.status(200).json(result);
  } catch (err) {
    handleError(res, err);
  }
}
export async function createReceivePurchase(req: Request, res: Response) {
  try {
    console.log(req.body)
    const input = req.body as purchasesUpdateInput;
    const result = await purchasesService.createPurchaseUpdate(input);
    res
      .status(200)
      .json({ message: "Purchase order updated successfully", ...result });
  } catch (err) {
    handleError(res, err);
  }
}
