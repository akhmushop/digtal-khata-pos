import type { Request, Response } from "express";
import * as purchaseReturnService from "./purchaseReturn.service.js";
import { handleError } from "../../utils/handleError.js";
import { createPurchaseReturnSchema } from "./purchaseReturn.schema.js";

export async function createPurchaseReturn(req: Request, res: Response) {
  try {
    const parsedInput = createPurchaseReturnSchema.safeParse(req.body);
    if (!parsedInput.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase return data.",
        errors: parsedInput.error.flatten(),
      });
    }
    const result =
      await purchaseReturnService.createPurchaseReturn(parsedInput.data);
    return res.status(201).json(result);
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
