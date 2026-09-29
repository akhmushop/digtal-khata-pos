import type { NextFunction, Request, Response } from "express";
import * as purchasesService from "./purchases.service.js";
import type {
  createPurchaseInput,
  purchasesUpdateInput,
} from "./purchase.types.js";
import { handleError } from "../../utils/handleError.js";
import { createPurchaseSchema } from "./schemas/purchase.schema.js";
import { receiveItemsFormSchema } from "./schemas/receiveItem.schema.js";

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
    const purchase = await purchasesService.createPurchase(result.data);
    return res.status(201).json({
      message: "Purchase created successfully",
      data: purchase,
    });
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
export async function createReceivePurchase(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = receiveItemsFormSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid Purchase Data",
        errors: result.error.flatten(),
      });
    }
    const receivedItems = await purchasesService.createReceivePurchase(
      result.data,
    );
    res.status(201).json({
      message: "Purchase order updated successfully",
      data: receivedItems,
    });
  } catch (err: unknown) {
    next(err);
  }
}
