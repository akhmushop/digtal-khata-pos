import type { Request, Response } from "express";
import * as purchasesService from "./purchases.service.js";
import type {
  createPurchaseInput,
  purchasesUpdateInput,
} from "../../types/purchases-type.js";
import { handleError } from "../../utils/handleError.js";

export async function createPurchase(req: Request, res: Response) {
  try {
    const input = req.body as createPurchaseInput;
    const insertedItems = await purchasesService.createPurchase(input);
    return res.status(201).json(insertedItems);
  } catch (err) {
    handleError(res, err);
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
export async function createPurchaseUpdate(req: Request, res: Response) {
  try {
    const input = req.body as purchasesUpdateInput;
    const result = await purchasesService.createPurchaseUpdate(input);
    res
      .status(200)
      .json({ message: "Purchase order updated successfully", ...result });
  } catch (err) {
    handleError(res, err);
  }
}
