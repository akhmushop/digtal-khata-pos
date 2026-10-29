import type { NextFunction, Request, Response } from "express";
import { dateRangeSchema } from "./reports.validation.js";
import * as reportsService from "./reports.service.js";

function getValidatedParams(req: Request) {
  const parsed = dateRangeSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new Error(
      `Invalid report parameters: ${parsed.error.issues.map((i) => i.message).join(", ")}`
    );
  }
  return parsed.data;
}

export async function getSalesSummary(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const params = getValidatedParams(req);
    const data = await reportsService.getSalesSummaryReport(params);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getSalesByInvoice(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const params = getValidatedParams(req);
    const data = await reportsService.getSalesByInvoiceReport(params);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getProductSales(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const params = getValidatedParams(req);
    const data = await reportsService.getProductSalesReport(params);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerSales(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const params = getValidatedParams(req);
    const data = await reportsService.getCustomerSalesReport(params);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getPaymentMethods(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const params = getValidatedParams(req);
    const data = await reportsService.getPaymentMethodReport(params);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getSaleRefunds(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const params = getValidatedParams(req);
    const data = await reportsService.getSaleRefundsReport(params);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getProfit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const params = getValidatedParams(req);
    const data = await reportsService.getProfitReport(params);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getExpenses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const params = getValidatedParams(req);
    const data = await reportsService.getExpenseReport(params);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerReceivables(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const params = getValidatedParams(req);
    const data = await reportsService.getCustomerReceivablesReport(params);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getStock(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const params = getValidatedParams(req);
    const data = await reportsService.getStockReport(params);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getStockMovements(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const params = getValidatedParams(req);
    const data = await reportsService.getStockMovementReport(params);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getBatchExpiry(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const params = getValidatedParams(req);
    const data = await reportsService.getBatchExpiryReport(params);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getPurchaseSummary(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const params = getValidatedParams(req);
    const data = await reportsService.getPurchaseSummaryReport(params);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getSupplierPayables(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await reportsService.getSupplierPayablesReport();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

