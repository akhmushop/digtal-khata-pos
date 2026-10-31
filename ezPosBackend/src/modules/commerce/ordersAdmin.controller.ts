import type { Request, Response } from "express";
import { z } from "zod";
import {
  getOrderDetail,
  listUnifiedOrders,
  markOnlineOrderPaid,
  updateFulfillmentStatus,
} from "../commerce/orders.service.js";
import { getBusinessId } from "../../middleware/business.js";
import { sendSafeError } from "../../utils/safeError.js";

const listSchema = z.object({
  channel: z.enum(["pos", "woocommerce", "custom_storefront"]).optional(),
  status: z.string().optional(),
  fulfillmentStatus: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export async function getOrders(req: Request, res: Response) {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid order filters." });
  }
  try {
    res.status(200).json({
      success: true,
      ...((await listUnifiedOrders(getBusinessId(req), parsed.data)) as object),
    });
  } catch (err) {
    sendSafeError(res, err, "Unable to load orders right now.");
  }
}

export async function getOrder(req: Request, res: Response) {
  const orderId = Number(req.params.orderId);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "A valid order ID is required." });
  }
  try {
    res.status(200).json({
      success: true,
      data: await getOrderDetail(getBusinessId(req), orderId),
    });
  } catch (err) {
    sendSafeError(res, err, "Order not found.");
  }
}

const fulfillmentSchema = z.object({
  status: z.enum(["processing", "shipped", "delivered"]),
});

export async function setFulfillmentStatus(req: Request, res: Response) {
  const orderId = Number(req.params.orderId);
  const parsed = fulfillmentSchema.safeParse(req.body);
  if (!Number.isInteger(orderId) || orderId <= 0 || !parsed.success) {
    return res.status(400).json({
      success: false,
      message: "A valid order ID and fulfillment status are required.",
    });
  }
  try {
    await updateFulfillmentStatus(
      getBusinessId(req),
      orderId,
      parsed.data.status,
    );
    res.status(200).json({
      success: true,
      message: `Fulfillment updated to ${parsed.data.status}.`,
    });
  } catch (err) {
    sendSafeError(res, err, "Unable to update fulfillment right now.");
  }
}

export async function markPaid(req: Request, res: Response) {
  const orderId = Number(req.params.orderId);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "A valid order ID is required." });
  }
  try {
    await markOnlineOrderPaid(getBusinessId(req), orderId);
    res.status(200).json({
      success: true,
      message: "Payment recorded. The order is confirmed and stock deducted.",
    });
  } catch (err) {
    sendSafeError(res, err, "Unable to record the payment right now.");
  }
}
