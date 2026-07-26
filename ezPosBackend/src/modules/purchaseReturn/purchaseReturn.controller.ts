import type { Request, Response } from "express";
import * as purchaseReturnService from "./purchaseReturn.service.js";
import { handleError } from "../../utils/handleError.js";
import type { CreatePurchaseReturnInput } from "../../types/purchases-type.js";

export async function createPurchaseReturn(req: Request, res: Response) {
  try {
    const input = req.body as CreatePurchaseReturnInput;
    const result = await purchaseReturnService.createPurchaseReturn(input);
    res.status(201).json(result);
  } catch (err) {
    handleError(res, err);
  }
}
export async function getPurchaseReturnItems(req: Request, res: Response) {
  try {
    const returnItems = await purchaseReturnService.getPurchaseReturnItems();
    res.json(returnItems);
  } catch (err) {
    handleError(res, err);
  }
}
