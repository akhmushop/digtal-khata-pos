import type { Request, Response } from "express";
import { dateRangeSchema } from "./reports.validation.js";
import * as reportsService from "./reports.service.js";
import { getBusinessId } from "../../middleware/business.js";
import { ForbiddenError } from "../../utils/handleError.js";
import { sendSafeError } from "../../utils/safeError.js";
import { listAccessibleLocationIds } from "../locations/locations.service.js";
import { WILDCARD_PERMISSION } from "../../rbac/permissions.js";

// Every report handler forwards the server-verified businessId from
// requireBusinessContext into the service, which injects it into every
// raw-SQL fragment. No report can aggregate across businesses.

function getValidatedParams(req: Request) {
  const parsed = dateRangeSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new Error(
      `Invalid report parameters: ${parsed.error.issues.map((i) => i.message).join(", ")}`
    );
  }
  return parsed.data;
}

/**
 * Optional location scope from the ?locationId query parameter. Absent or
 * "all" = business-wide aggregate. A specific id is validated against the
 * caller's server-side location assignments (owners pass via wildcard) —
 * a report filtered to a location you cannot access is 403, never data.
 */
async function resolveReportLocation(req: Request): Promise<number | undefined> {
  const raw = req.query.locationId;
  if (raw === undefined || raw === "" || raw === "all") return undefined;
  const locationId = Number(raw);
  if (!Number.isInteger(locationId) || locationId <= 0) {
    throw new ForbiddenError("Invalid location filter.");
  }
  if (!req.user || !req.membership) {
    throw new ForbiddenError("Authentication required.");
  }
  const callerIsOwner = req.membership.permissions.includes(WILDCARD_PERMISSION);
  const accessible = await listAccessibleLocationIds(
    getBusinessId(req),
    req.user.id,
    callerIsOwner,
  );
  if (!accessible.includes(locationId)) {
    throw new ForbiddenError("You do not have access to this location.");
  }
  return locationId;
}

export async function getSalesSummary(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getSalesSummaryReport(
      getBusinessId(req),
      params,
      locationId,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

export async function getSalesByInvoice(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getSalesByInvoiceReport(
      getBusinessId(req),
      params,
      locationId,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

export async function getProductSales(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getProductSalesReport(
      getBusinessId(req),
      params,
      locationId,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

export async function getCustomerSales(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getCustomerSalesReport(
      getBusinessId(req),
      params,
      locationId,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

export async function getPaymentMethods(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getPaymentMethodReport(
      getBusinessId(req),
      params,
      locationId,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

export async function getSaleRefunds(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getSaleRefundsReport(
      getBusinessId(req),
      params,
      locationId,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

export async function getProfit(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getProfitReport(
      getBusinessId(req),
      params,
      locationId,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

export async function getExpenses(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getExpenseReport(
      getBusinessId(req),
      params,
      locationId,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

export async function getCustomerReceivables(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getCustomerReceivablesReport(
      getBusinessId(req),
      params,
      locationId,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

export async function getStock(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getStockReport(getBusinessId(req), params);
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

export async function getStockMovements(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getStockMovementReport(
      getBusinessId(req),
      params,
      locationId,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

export async function getBatchExpiry(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getBatchExpiryReport(
      getBusinessId(req),
      params,
      locationId,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

export async function getPurchaseSummary(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getPurchaseSummaryReport(
      getBusinessId(req),
      params,
      locationId,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

export async function getSupplierPayables(req: Request, res: Response) {
  try {
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getSupplierPayablesReport(
      getBusinessId(req),
      locationId,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

export async function getHourlySales(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getHourlySalesReport(
      getBusinessId(req),
      params,
      locationId,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

export async function getTaxReconciliation(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getTaxReconciliationReport(
      getBusinessId(req),
      params,
      locationId,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

export async function getInventoryShrinkage(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getInventoryShrinkageReport(
      getBusinessId(req),
      params,
      locationId,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

export async function getRegisterClose(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const locationId = await resolveReportLocation(req);
    const data = await reportsService.getRegisterCloseReport(
      getBusinessId(req),
      params,
      locationId,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

// Report errors never leak internals: log server-side, return a generic body.
export async function getLocationComparison(req: Request, res: Response) {
  try {
    const params = getValidatedParams(req);
    const data = await reportsService.getLocationComparisonReport(
      getBusinessId(req),
      params,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    sendSafe(err, res);
  }
}

function sendSafe(err: unknown, res: Response) {
  sendSafeError(res, err, "Unable to generate this report right now.");
}
