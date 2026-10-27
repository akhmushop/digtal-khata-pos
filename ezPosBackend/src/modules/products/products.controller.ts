import type { Request, Response } from "express";
import * as productsService from "./products.service.js";
import {
  BadRequestError,
  handleError,
} from "../../utils/handleError.js";
import { z } from "zod";

const stockAdjustmentSchema = z.object({
  newQuantity: z.number().int().min(0),
  reason: z.enum([
    "count_correction",
    "damaged",
    "expired",
    "lost",
    "found",
  ]),
  batchNumber: z.string().trim().min(1).max(100).optional(),
  unitCost: z.number().finite().min(0).optional(),
  serialNumbers: z.array(z.string().trim().min(1).max(100)).optional(),
});
export async function getProducts(req: Request, res: Response) {
  try {
    res.json(await productsService.getAllProducts());
  } catch (err) {
    handleError(res, err);
  }
}
export async function createProduct(req: Request, res: Response) {
  try {
    const created = await productsService.createProduct(req.body);
    res.status(201).json(created);
  } catch (err) {
    handleError(res, err);
  }
}
export async function decrementQuantity(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { quantity } = req.body;
    await productsService.decrementQuantity(id, quantity);
    res.status(200).json({ message: "Quantity updated" });
  } catch (err) {
    handleError(res, err);
  }
}
export async function incrementQuantity(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { quantity } = req.body;
    await productsService.incrementQuantity(id, quantity);
    res.status(200).json({ message: "Quantity updated" });
  } catch (err) {
    handleError(res, err);
  }
}
export async function restoreQuantity(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { quantity, sold_quantity } = req.body;
    await productsService.restoreQuantity(id, quantity, sold_quantity);
    res.status(200).json({ message: "Quantity restored" });
  } catch (err) {
    handleError(res, err);
  }
}
export async function restoreAllQuantity(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { products_quantity, sold_quantity } = req.body;
    await productsService.restoreAllQuantity(
      id,
      products_quantity,
      sold_quantity,
    );
    res.status(200).json({ message: "Quantity restored" });
  } catch (err) {
    handleError(res, err);
  }
}
export async function customQuantity(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { new_quantity, prev_quantity, products_quantity } = req.body;
    await productsService.adjustCustomQuantity(
      id,
      new_quantity,
      prev_quantity,
      products_quantity,
    );
    res.status(200).json({ message: "Quantity updated" });
  } catch (err) {
    handleError(res, err);
  }
}
export async function updateStock(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { newStock, status } = req.body;
    await productsService.updateStock(id, newStock, status);
    res.status(200).json({ message: "Stock updated" });
  } catch (err) {
    handleError(res, err);
  }
}
export async function adjustVariantStock(req: Request, res: Response) {
  try {
    const variantId = Number(req.params.variantId);
    if (!Number.isInteger(variantId) || variantId < 1) {
      throw new BadRequestError("Invalid product variant ID.");
    }
    const parsed = stockAdjustmentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(
        parsed.error.issues.map((issue) => issue.message).join(" "),
      );
    }
    const result = await productsService.adjustVariantStock(
      variantId,
      parsed.data,
    );
    res.status(200).json({
      message: "Stock adjusted",
      data: result,
    });
  } catch (err) {
    handleError(res, err);
  }
}
export async function duplicateProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const created = await productsService.duplicateProduct(id);
    if (!created) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(201).json(created);
  } catch (err) {
    handleError(res, err);
  }
}
export async function patchProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const updates = req.body;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
    await productsService.patchProduct(id, updates);
    res.status(200).json({ message: "Product updated" });
  } catch (err) {
    handleError(res, err);
  }
}
