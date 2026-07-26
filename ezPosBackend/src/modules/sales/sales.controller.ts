import type { Request, Response } from "express";
import * as salesService from "./sales.service.js";
import { handleError } from "../../utils/handleError.js";
import type { saleDataInput } from "../../types/sales-types.js";

export async function getSalesData(req: Request, res: Response) {
  try {
    const salesData = await salesService.getSalesData();
    res.status(200).json(salesData);
  } catch (err) {
    handleError(res, err);
  }
}
export async function createSale(req: Request, res: Response) {
  try {
    const input = req.body as saleDataInput;
    const saleId = await salesService.createSale(input);
    res.status(201).json({ message: "Sale created successfully", saleId });
  } catch (err) {
    handleError(res, err);
  }
}
export async function createSingleRefund(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { message, refundId } = await salesService.createSingleRefund(
      Number(id),
    );
    res.status(200).json({ message, refundId });
  } catch (err) {
    handleError(res, err);
  }
}
export async function createMultipleRefunds(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { message, refundId } = await salesService.createMultipleRefunds(
      Number(id),
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
