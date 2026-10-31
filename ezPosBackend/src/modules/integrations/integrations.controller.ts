import type { Request, Response } from "express";
import { desc, eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/schema/index.js";
import { integrationSyncLogs } from "../../db/schema/integrationSync.js";
import { integrations } from "../../db/schema/integrations.js";
import {
  connectWoocommerceStore,
  disconnectIntegration,
  pushProducts,
  pushStockLevels,
  processOrderWebhook,
  processSyncJobs,
  processOrderWebhookByToken,
} from "./integrations.service.js";
import { getBusinessId } from "../../middleware/business.js";
import { sendSafeError } from "../../utils/safeError.js";

const connectSchema = z.object({
  name: z.string().trim().min(2, "Enter a store name").max(120),
  storeUrl: z
    .string()
    .trim()
    .url("Enter the full store URL (https://…)")
    .max(255),
  consumerKey: z.string().trim().min(10, "Enter the consumer key").max(255),
  consumerSecret: z
    .string()
    .trim()
    .min(10, "Enter the consumer secret")
    .max(255),
  locationId: z.number().int().positive().nullish(),
});

export async function connectStore(req: Request, res: Response) {
  const parsed = connectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid connection data.",
    });
  }
  try {
    const result = await connectWoocommerceStore(
      getBusinessId(req),
      parsed.data,
    );
    res.status(201).json({
      success: true,
      message:
        "Store connected. Initial product synchronization has been queued.",
      data: result,
    });
  } catch (err) {
    sendSafeError(res, err, "Unable to connect the store right now.");
  }
}

export async function listIntegrations(req: Request, res: Response) {
  try {
    const rows = await db
      .select({
        id: integrations.id,
        platform: integrations.platform,
        name: integrations.name,
        storeUrl: integrations.storeUrl,
        locationId: integrations.locationId,
        status: integrations.status,
        lastSyncAt: integrations.lastSyncAt,
        createdAt: integrations.createdAt,
      })
      .from(integrations)
      .where(eq(integrations.businessId, getBusinessId(req)))
      .orderBy(desc(integrations.id));
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    sendSafeError(res, err, "Unable to load integrations right now.");
  }
}

export async function disconnectStore(req: Request, res: Response) {
  const integrationId = Number(req.params.integrationId);
  if (!Number.isInteger(integrationId) || integrationId <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "A valid integration ID is required." });
  }
  try {
    await disconnectIntegration(getBusinessId(req), integrationId);
    res
      .status(200)
      .json({ success: true, message: "Store disconnected. History preserved." });
  } catch (err) {
    sendSafeError(res, err, "Unable to disconnect the store right now.");
  }
}

export async function syncProducts(req: Request, res: Response) {
  const integrationId = Number(req.params.integrationId);
  if (!Number.isInteger(integrationId) || integrationId <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "A valid integration ID is required." });
  }
  try {
    // Verify ownership before any external call.
    const [owned] = await db
      .select({ id: integrations.id })
      .from(integrations)
      .where(
        and(
          eq(integrations.id, integrationId),
          eq(integrations.businessId, getBusinessId(req)),
        ),
      );
    if (!owned) {
      return res
        .status(404)
        .json({ success: false, message: "Integration not found." });
    }
    const pushed = await pushProducts(integrationId);
    res.status(200).json({
      success: true,
      message: `Product synchronization pushed ${pushed} product(s).`,
      data: { pushed },
    });
  } catch (err) {
    sendSafeError(res, err, "Unable to synchronize products right now.");
  }
}

export async function syncStock(req: Request, res: Response) {
  const integrationId = Number(req.params.integrationId);
  if (!Number.isInteger(integrationId) || integrationId <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "A valid integration ID is required." });
  }
  try {
    const [owned] = await db
      .select({ id: integrations.id })
      .from(integrations)
      .where(
        and(
          eq(integrations.id, integrationId),
          eq(integrations.businessId, getBusinessId(req)),
        ),
      );
    if (!owned) {
      return res
        .status(404)
        .json({ success: false, message: "Integration not found." });
    }
    const pushed = await pushStockLevels(integrationId);
    res.status(200).json({
      success: true,
      message: `Stock levels pushed for ${pushed} mapped variant(s).`,
      data: { pushed },
    });
  } catch (err) {
    sendSafeError(res, err, "Unable to push stock levels right now.");
  }
}

export async function getSyncLogs(req: Request, res: Response) {
  const integrationId = Number(req.params.integrationId);
  if (!Number.isInteger(integrationId) || integrationId <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "A valid integration ID is required." });
  }
  try {
    const logs = await db
      .select({
        id: integrationSyncLogs.id,
        jobType: integrationSyncLogs.jobType,
        direction: integrationSyncLogs.direction,
        entityType: integrationSyncLogs.entityType,
        entityId: integrationSyncLogs.entityId,
        status: integrationSyncLogs.status,
        message: integrationSyncLogs.message,
        createdAt: integrationSyncLogs.createdAt,
      })
      .from(integrationSyncLogs)
      .where(
        and(
          eq(integrationSyncLogs.integrationId, integrationId),
          eq(integrationSyncLogs.businessId, getBusinessId(req)),
        ),
      )
      .orderBy(desc(integrationSyncLogs.id))
      .limit(100);
    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    sendSafeError(res, err, "Unable to load sync logs right now.");
  }
}

/**
 * WooCommerce webhook delivery (order.created/updated). Public by design:
 * authenticity comes from the HMAC-SHA256 signature over the raw body with
 * the per-integration webhook secret, and replay protection from the order
 * mapping. Never returns internals to the caller.
 */
export async function woocommerceWebhook(req: Request, res: Response) {
  const token = String(req.params.token ?? "");
  try {
    // Raw body was captured by the route-level json verifier (signature is
    // computed over the exact bytes WooCommerce sent).
    const rawBody = (req as Request & { __rawBody?: string }).__rawBody ?? "";
    const signature = String(req.headers["x-wc-webhook-signature"] ?? "");
    const outcome = await processOrderWebhookByToken(token, rawBody, signature);
    if (outcome.action === "ignored") {
      console.error("WH_DEBUG:", outcome.message, "rawLen:", rawBody.length, "sig:", signature);
    }
    if (outcome.action === "ignored" && /signature|unknown/i.test(outcome.message ?? "")) {
      return res.status(401).json({ success: false, message: "Rejected." });
    }
    res.status(200).json({ success: outcome.action !== "failed" });
  } catch (err) {
    console.error("WooCommerce webhook error:", err);
    res.status(200).json({ success: false });
  }
}
