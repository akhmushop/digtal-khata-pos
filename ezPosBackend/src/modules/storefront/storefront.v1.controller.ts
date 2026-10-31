import type { Request, Response } from "express";
import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import { sales } from "../../db/schema/sales.js";
import { db } from "../../db/schema/index.js";
import {
  getStorefrontProduct,
  listStorefrontBrands,
  listStorefrontCategories,
  listStorefrontProducts,
  resolveKeyLocation,
} from "./storefront.catalog.service.js";
import {
  createOnlineOrder,
} from "../commerce/orders.service.js";
import { getOnlineAvailability } from "../commerce/reservations.service.js";
import { sendSafeError } from "../../utils/safeError.js";

function ctx(req: Request) {
  return req.storefront!;
}

export async function getProducts(req: Request, res: Response) {
  try {
    const result = await listStorefrontProducts(ctx(req), {
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      categoryId: req.query.categoryId
        ? Number(req.query.categoryId)
        : undefined,
      brandId: req.query.brandId ? Number(req.query.brandId) : undefined,
      sort: typeof req.query.sort === "string"
        ? (["newest", "price_asc", "price_desc", "name"].includes(req.query.sort)
            ? (req.query.sort as "newest" | "price_asc" | "price_desc" | "name")
            : undefined)
        : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
    });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    sendSafeError(res, err, "Unable to load products right now.");
  }
}

export async function getProductDetail(req: Request, res: Response) {
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId) || productId <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "A valid product ID is required." });
  }
  try {
    const product = await getStorefrontProduct(ctx(req), productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    sendSafeError(res, err, "Unable to load the product right now.");
  }
}

export async function getCategories(req: Request, res: Response) {
  try {
    res.status(200).json({
      success: true,
      data: await listStorefrontCategories(ctx(req).businessId),
    });
  } catch (err) {
    sendSafeError(res, err, "Unable to load categories right now.");
  }
}

export async function getBrands(req: Request, res: Response) {
  try {
    res.status(200).json({
      success: true,
      data: await listStorefrontBrands(ctx(req).businessId),
    });
  } catch (err) {
    sendSafeError(res, err, "Unable to load brands right now.");
  }
}

export async function getAvailability(req: Request, res: Response) {
  const variantIds = String(req.query.variantIds ?? "")
    .split(",")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0)
    .slice(0, 200);
  if (variantIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Provide variantIds as a comma-separated list.",
    });
  }
  try {
    const locationId = await resolveKeyLocation(
      ctx(req).businessId,
      ctx(req).integrationId,
    );
    if (!locationId) {
      return res
        .status(200)
        .json({ success: true, data: { availability: {} } });
    }
    const availability = await getOnlineAvailability(
      ctx(req).businessId,
      locationId,
      ctx(req).integrationId,
      variantIds,
    );
    res.status(200).json({
      success: true,
      data: { availability: Object.fromEntries(availability) },
    });
  } catch (err) {
    sendSafeError(res, err, "Unable to load availability right now.");
  }
}

const createOrderSchema = z.object({
  lines: z
    .array(
      z.object({
        variantId: z.number().int().positive(),
        quantity: z.number().int().positive().max(999),
      }),
    )
    .min(1, "An order requires at least one line."),
  customer: z.object({
    name: z.string().trim().min(1).max(255),
    phone: z.string().trim().max(20).optional(),
    email: z.string().trim().max(255).optional(),
    address: z.string().trim().max(500).optional(),
  }),
  paymentMethod: z.string().trim().max(40).optional(),
  note: z.string().trim().max(1000).optional(),
  externalOrderId: z.string().trim().max(100).optional(),
  locationId: z.number().int().positive().optional(),
});

export async function createOrder(req: Request, res: Response) {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid order data.",
    });
  }
  // Duplicate-submission protection: the key header, then the integration's
  // external order id.
  const idempotencyKey = String(req.headers["idempotency-key"] ?? "").trim();
  if (idempotencyKey.length < 8 || idempotencyKey.length > 120) {
    return res.status(400).json({
      success: false,
      message:
        "An Idempotency-Key header (8-120 characters) is required for order submission.",
    });
  }
  try {
    const order = await createOnlineOrder({
      businessId: ctx(req).businessId,
      channel: "custom_storefront",
      integrationId: ctx(req).integrationId,
      externalOrderId: parsed.data.externalOrderId ?? null,
      locationId: parsed.data.locationId ?? null,
      customer: parsed.data.customer,
      lines: parsed.data.lines,
      idempotencyKey,
      paymentMethod: parsed.data.paymentMethod ?? null,
      note: parsed.data.note ?? null,
    });
    res.status(201).json({
      success: true,
      message: order.duplicated
        ? "This order was already submitted."
        : "Order created.",
      data: {
        orderId: order.saleId,
        invoiceNumber: order.invoiceNumber,
        status: order.status,
        total: order.total,
        currency: order.currency,
        duplicated: order.duplicated,
      },
    });
  } catch (err) {
    // Insufficient stock etc. is a client fixable condition.
    if (err instanceof Error && /insufficient online stock/i.test(err.message)) {
      return res.status(409).json({
        success: false,
        message: err.message,
      });
    }
    if (err instanceof Error && /serial-tracked/i.test(err.message)) {
      return res.status(400).json({ success: false, message: err.message });
    }
    sendSafeError(res, err, "Unable to create the order right now.");
  }
}

export async function getOrderStatus(req: Request, res: Response) {
  const orderId = Number(req.params.orderId);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "A valid order ID is required." });
  }
  try {
    const [order] = await db
      .select({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        status: sales.status,
        paymentStatus: sales.paymentStatus,
        fulfillmentStatus: sales.fulfillmentStatus,
        total: sales.finalTotal,
        createdAt: sales.createdAt,
      })
      .from(sales)
      .where(
        and(
          eq(sales.id, orderId),
          eq(sales.businessId, ctx(req).businessId),
          // Only storefront-originated orders are visible through the API.
          or(
            eq(sales.channel, "woocommerce"),
            eq(sales.channel, "custom_storefront"),
          )!,
        ),
      )
      .limit(1);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    sendSafeError(res, err, "Unable to load the order right now.");
  }
}
