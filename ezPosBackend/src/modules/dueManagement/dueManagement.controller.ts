import type { Request, Response, NextFunction } from "express";
import * as dueManagementService from "./dueManagement.service.js";
import { handleError } from "../../utils/handleError.js";

export async function getDueManagementSummary(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await dueManagementService.getDueManagementSummary();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCustomerDueRows(req: Request, res: Response) {
  try {
    const result = await dueManagementService.getCustomerDueRows();
    res.status(200).json(result);
  } catch (err) {
    handleError(res, err);
  }
}

export async function getSupplierDueRows(req: Request, res: Response) {
  try {
    const result = await dueManagementService.getSupplierDueRows();
    res.status(200).json(result);
  } catch (err) {
    handleError(res, err);
  }
}

export async function recordCustomerPayment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await dueManagementService.recordCustomerPayment(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function recordSupplierPayment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await dueManagementService.recordSupplierPayment(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerLedger(req: Request, res: Response) {
  try {
    const customerId = Number(req.params.customerId);
    if (!Number.isFinite(customerId)) {
      return res.status(400).json({ success: false, message: "Invalid customerId" });
    }

    const result = await dueManagementService.getCustomerLedger(customerId);
    res.status(200).json(result);
  } catch (err) {
    handleError(res, err);
  }
}

export async function getSupplierLedger(req: Request, res: Response) {
  try {
    const supplierId = Number(req.params.supplierId);
    if (!Number.isFinite(supplierId)) {
      return res.status(400).json({ success: false, message: "Invalid supplierId" });
    }

    const result = await dueManagementService.getSupplierLedger(supplierId);
    res.status(200).json(result);
  } catch (err) {
    handleError(res, err);
  }
}
