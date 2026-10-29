import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { z } from "zod";
import * as dueManagementService from "./dueManagement.service.js";
import { BadRequestError } from "../../utils/handleError.js";
import {
  customerPaymentSchema,
  dueRowQuerySchema,
  dueSummaryQuerySchema,
  idParamSchema,
  ledgerQuerySchema,
  supplierPaymentSchema,
} from "./dueManagement.schema.js";

function parseOrThrow<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Invalid request.";
    throw new BadRequestError(message);
  }
  return result.data;
}

export async function getDueManagementSummary(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = parseOrThrow(dueSummaryQuerySchema, req.query);
    const result = await dueManagementService.getDueManagementSummary(query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCustomerDueRows(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = parseOrThrow(dueRowQuerySchema, req.query);
    const result = await dueManagementService.getCustomerDueRows(query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getDueManagementTrend(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const days = z.coerce
      .number()
      .int()
      .min(1)
      .max(90)
      .default(14)
      .parse(req.query.days);
    const result = await dueManagementService.getDueManagementTrend(days);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCustomerDueBalances(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await dueManagementService.getCustomerDueBalances();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getSupplierDueRows(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = parseOrThrow(dueRowQuerySchema, req.query);
    const result = await dueManagementService.getSupplierDueRows(query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function recordCustomerPayment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const payload = parseOrThrow(customerPaymentSchema, req.body);
    const result = await dueManagementService.recordCustomerPayment(payload);
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
    const payload = parseOrThrow(supplierPaymentSchema, req.body);
    const result = await dueManagementService.recordSupplierPayment(payload);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getSalePaymentHistory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const saleId = parseOrThrow(idParamSchema, req.params.saleId);
    const result = await dueManagementService.getSalePayments(saleId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getPurchasePaymentHistory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const purchaseId = parseOrThrow(idParamSchema, req.params.purchaseId);
    const result = await dueManagementService.getPurchasePayments(purchaseId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCustomerLedger(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const customerId = parseOrThrow(idParamSchema, req.params.customerId);
    const query = parseOrThrow(ledgerQuerySchema, req.query);
    const result = await dueManagementService.getCustomerLedger(
      customerId,
      query,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getSupplierLedger(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const supplierId = parseOrThrow(idParamSchema, req.params.supplierId);
    const query = parseOrThrow(ledgerQuerySchema, req.query);
    const result = await dueManagementService.getSupplierLedger(
      supplierId,
      query,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
