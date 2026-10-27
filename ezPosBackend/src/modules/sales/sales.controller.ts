import type { NextFunction, Request, Response } from "express";
import * as salesService from "./sales.service.js";
import { handleError } from "../../utils/handleError.js";
import type { saleDataInput } from "../../types/sales-types.js";
import {
  createSalePayloadSchema,
  saleRefundRequestSchema,
  updateAvailableSerialSchema,
} from "./schemas/sales.schema.js";

export async function getSalesData(req: Request, res: Response) {
  try {
    const salesData = await salesService.getSalesData();
    res.status(200).json(salesData);
  } catch (err) {
    handleError(res, err);
  }
}
export async function createSale(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = createSalePayloadSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid sale data",
        errors: result.error.flatten(),
      });
    }
    const sale = await salesService.createSale(result.data);
    return res
      .status(201)
      .json({ message: "Sale created successfully", data: sale });
  } catch (err: unknown) {
    next(err);
  }
}
export async function createSingleRefund(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid sale item ID" });
    }
    const result = saleRefundRequestSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid refund options",
        errors: result.error.flatten(),
      });
    }
    const { message, refundId } = await salesService.createSingleRefund(
      id,
      result.data,
    );
    res.status(200).json({ message, refundId });
  } catch (err) {
    handleError(res, err);
  }
}
export async function createMultipleRefunds(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid sale ID" });
    }
    const result = saleRefundRequestSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid refund options",
        errors: result.error.flatten(),
      });
    }
    const { message, refundId } = await salesService.createMultipleRefunds(
      id,
      result.data,
    );
    res.status(200).json({ message, refundId });
  } catch (err) {
    handleError(res, err);
  }
}
export async function getDashboardSummary(req: Request, res: Response) {
  try {
    const summary = await salesService.getDashboardSummary();
    res.status(200).json(summary);
  } catch (err) {
    handleError(res, err);
  }
}
export async function getAvailableSerials(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const variantId = Number(req.params.variantId);
    if (isNaN(variantId)) {
      return res.status(400).json({ message: "Invalid Variant ID" });
    }
    const availableSerials = await salesService.getAvailableSerials(variantId);

    res.status(200).json(availableSerials);
  } catch (err: unknown) {
    next(err);
  }
}

export async function updateAvailableSerial(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const variantId = Number(req.params.variantId);
    if (!Number.isInteger(variantId) || variantId <= 0) {
      return res.status(400).json({ message: "Invalid Variant ID" });
    }

    const result = updateAvailableSerialSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid serial number data",
        errors: result.error.flatten(),
      });
    }

    const serialNumber = await salesService.updateAvailableSerial(
      variantId,
      result.data.currentSerial,
      result.data.serialNumber,
    );
    return res.status(200).json({ serialNumber });
  } catch (err: unknown) {
    next(err);
  }
}
