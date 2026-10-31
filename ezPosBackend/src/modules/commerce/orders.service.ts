import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db/schema/index.js";
import { customers } from "../../db/schema/customers.js";
import { inventoryMovements } from "../../db/schema/inventoryMovements.js";
import { inventoryStock } from "../../db/schema/inventoryStock.js";
import { products } from "../../db/schema/products.js";
import { productVariants } from "../../db/schema/productVariants.js";
import { saleItems } from "../../db/schema/saleItems.js";
import { sales } from "../../db/schema/sales.js";
import { businesses } from "../../db/schema/businesses.js";
import { integrations } from "../../db/schema/integrations.js";
import { locations } from "../../db/schema/locations.js";
import {
  consumeStockFifo,
} from "../sales/sales.service.js";
import { emitWebhookEventInTx } from "../webhooks/webhookDelivery.service.js";
import {
  confirmReservationsForSaleInTx,
  createReservationsInTx,
  releaseReservationsForSaleInTx,
} from "./reservations.service.js";

/**
 * Unified online orders (Phase 9.1). An online order IS a `sales` row —
 * same items, refunds, and accounting rules as the POS — with channel
 * metadata and a reservation-based two-phase inventory flow:
 *
 *   create  → sale 'pending'/'unpaid' + active reservations (stock held)
 *   confirm → FIFO stock consumption + movements + 'completed'/'paid'
 *   cancel  → reservations released + sale 'cancelled'
 *
 * Client-submitted prices are ignored: every price is fetched from
 * product_variants inside the transaction. Serial-tracked variants are
 * rejected in v1 (serial selection is a POS workflow). VAT is treated as
 * tax-inclusive in v1 (architecture doc §11.2).
 */

const DEFAULT_RESERVATION_MINUTES = 30;

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface OnlineOrderLineInput {
  variantId: number;
  quantity: number;
}

export interface OnlineOrderCustomerInput {
  name: string;
  phone?: string | null | undefined;
  email?: string | null | undefined;
  address?: string | null | undefined;
}

export interface CreateOnlineOrderInput {
  businessId: number;
  channel: "woocommerce" | "custom_storefront";
  integrationId: number | null;
  externalOrderId?: string | null;
  externalOrderNumber?: string | null;
  locationId?: number | null;
  customer: OnlineOrderCustomerInput;
  lines: OnlineOrderLineInput[];
  /** Stable key for duplicate-submission protection. */
  idempotencyKey: string;
  /** Payment method recorded for the eventual payment ("cod", "online", …). */
  paymentMethod?: string | null;
  note?: string | null;
}

export interface OnlineOrderResult {
  saleId: number;
  invoiceNumber: string;
  status: "pending" | "completed" | "cancelled";
  total: number;
  currency: "BDT";
  duplicated: boolean;
}

function normalizePhone(phone?: string | null): string | null {
  const trimmed = phone?.replace(/[\s-]/g, "").trim();
  return trimmed ? trimmed : null;
}

/** Round to 2dp in the numeric domain (same rule as the POS pricing util). */
function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

async function resolveLocationId(
  tx: Tx,
  businessId: number,
  integrationId: number | null,
  requested?: number | null,
): Promise<number> {
  if (requested) {
    const [location] = await tx
      .select({ id: locations.id })
      .from(locations)
      .where(
        and(
          eq(locations.id, requested),
          eq(locations.businessId, businessId),
        ),
      );
    if (!location) throw new Error("Requested location does not exist.");
    return requested;
  }
  if (integrationId) {
    const [integration] = await tx
      .select({ locationId: integrations.locationId })
      .from(integrations)
      .where(eq(integrations.id, integrationId));
    if (integration?.locationId) return integration.locationId;
  }
  const [defaultLocation] = await tx
    .select({ id: locations.id })
    .from(locations)
    .where(
      and(
        eq(locations.businessId, businessId),
        eq(locations.isDefault, true),
      ),
    );
  if (!defaultLocation) {
    throw new Error("Business has no default location to fulfill from.");
  }
  return defaultLocation.id;
}

async function resolveCustomerId(
  tx: Tx,
  businessId: number,
  customer: OnlineOrderCustomerInput,
): Promise<number | null> {
  const phone = normalizePhone(customer.phone);
  const email = customer.email?.trim().toLowerCase() || null;
  if (!phone && !email) return null; // guest checkout without contact info

  // Phone is the primary matching key; email secondary. Name never matches.
  const [existing] = await tx
    .select({ id: customers.id })
    .from(customers)
    .where(
      and(
        eq(customers.businessId, businessId),
        phone
          ? eq(
              sql`regexp_replace(${customers.phone}, '[\\s-]', '', 'g')`,
              phone,
            )
          : email
            ? eq(customers.email, email)
            : sql`false`,
      ),
    )
    .limit(1);
  if (existing) return existing.id;

  const [created] = await tx
    .insert(customers)
    .values({
      businessId,
      name: customer.name.trim() || "Online customer",
      phone: phone ?? null,
      email,
      address: customer.address ?? null,
    })
    .returning({ id: customers.id });
  return created?.id ?? null;
}

/** Idempotency lookup: same integration + external order id → same sale. */
async function findExistingOrder(
  tx: Tx,
  businessId: number,
  integrationId: number | null,
  externalOrderId: string | null,
  idempotencyKey: string,
): Promise<{ id: number; invoiceNumber: string; status: string; finalTotal: number | null } | null> {
  if (integrationId && externalOrderId) {
    const [row] = await tx
      .select({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        status: sales.status,
        finalTotal: sales.finalTotal,
      })
      .from(sales)
      .where(
        and(
          eq(sales.businessId, businessId),
          eq(sales.integrationId, integrationId),
          eq(sales.externalOrderId, externalOrderId),
        ),
      )
      .limit(1);
    if (row) return row;
  }
  // Idempotency-key path: covers integrations without external ids and
  // plain storefront retries.
  const [byKey] = await tx
    .select({
      id: sales.id,
      invoiceNumber: sales.invoiceNumber,
      status: sales.status,
      finalTotal: sales.finalTotal,
    })
    .from(sales)
    .where(
      and(
        eq(sales.businessId, businessId),
        eq(sales.idempotencyKey, idempotencyKey),
      ),
    )
    .limit(1);
  return byKey ?? null;
}

export async function createOnlineOrder(
  input: CreateOnlineOrderInput,
): Promise<OnlineOrderResult> {
  if (input.lines.length === 0) {
    throw new Error("An order requires at least one line.");
  }

  return db.transaction(async (tx) => {
    const existing = await findExistingOrder(
      tx,
      input.businessId,
      input.integrationId,
      input.externalOrderId ?? null,
      input.idempotencyKey,
    );
    if (existing) {
      return {
        saleId: existing.id,
        invoiceNumber: existing.invoiceNumber,
        status: existing.status as OnlineOrderResult["status"],
        total: Number(existing.finalTotal ?? 0),
        currency: "BDT" as const,
        duplicated: true,
      };
    }

    const locationId = await resolveLocationId(
      tx,
      input.businessId,
      input.integrationId,
      input.locationId,
    );

    // Server-side prices and validation. Serial-tracked variants are
    // rejected — serial selection is a POS workflow (v1).
    const variantIds = [...new Set(input.lines.map((l) => l.variantId))];
    const variants = await tx
      .select({
        id: productVariants.id,
        sellingPrice: productVariants.sellingPrice,
        trackingType: products.trackingType,
      })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .where(
        and(
          eq(productVariants.businessId, input.businessId),
          inArray(productVariants.id, variantIds),
        ),
      );
    const variantById = new Map(variants.map((v) => [v.id, v]));
    if (variantById.size !== variantIds.length) {
      throw new Error("One or more products do not exist for this business.");
    }
    for (const line of input.lines) {
      const variant = variantById.get(line.variantId)!;
      if (variant.trackingType === "serial") {
        throw new Error(
          "Serial-tracked products cannot be sold through storefronts yet.",
        );
      }
    }

    const subtotal = roundMoney(
      input.lines.reduce(
        (sum, line) =>
          sum +
          Number(variantById.get(line.variantId)!.sellingPrice) * line.quantity,
        0,
      ),
    );
    const customerId = await resolveCustomerId(tx, input.businessId, input.customer);

    const [sale] = await tx
      .insert(sales)
      .values({
        businessId: input.businessId,
        status: "pending",
        channel: input.channel,
        integrationId: input.integrationId,
        externalOrderId: input.externalOrderId ?? null,
        externalOrderNumber: input.externalOrderNumber ?? null,
        locationId,
        subtotal,
        discount: 0,
        vat: 0,
        finalTotal: subtotal,
        paymentStatus: "unpaid",
        dueAmount: subtotal,
        customerId,
        idempotencyKey: input.idempotencyKey,
        note:
          input.note ??
          (input.paymentMethod ? `Payment method: ${input.paymentMethod}` : null),
      })
      .returning({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
      });
    if (!sale) throw new Error("Sale insert returned no row.");

    for (const line of input.lines) {
      await tx.insert(saleItems).values({
        businessId: input.businessId,
        saleId: sale.id,
        variantId: line.variantId,
        quantity: line.quantity,
        sellingPrice: Number(variantById.get(line.variantId)!.sellingPrice),
        costAtSale: 0, // cost is computed at confirmation, when stock is consumed
        lineTotal: roundMoney(
          Number(variantById.get(line.variantId)!.sellingPrice) * line.quantity,
        ),
        discount: 0,
      });
    }

    // Hold the stock. Insufficient online availability aborts everything.
    await createReservationsInTx(tx, {
      businessId: input.businessId,
      locationId,
      integrationId: input.integrationId,
      saleId: sale.id,
      lines: input.lines,
      idempotencyKey: input.idempotencyKey,
      expiresAt: new Date(
        Date.now() + DEFAULT_RESERVATION_MINUTES * 60 * 1000,
      ),
    });

    const result = {
      saleId: sale.id,
      invoiceNumber: sale.invoiceNumber,
      status: "pending" as const,
      total: subtotal,
      currency: "BDT" as const,
      duplicated: false,
    };
    // Delivery rows commit atomically with the order — no race with the
    // delivery sweep.
    await emitWebhookEventInTx(tx, input.businessId, "order.created", {
      orderId: result.saleId,
      invoiceNumber: result.invoiceNumber,
      total: result.total,
      channel: input.channel,
      externalOrderId: input.externalOrderId ?? null,
    });
    return result;
  });
}

/**
 * Payment confirmed (webhook / portal). Consumes stock through the SAME
 * FIFO/batch rules the POS uses, writes the movement, confirms the
 * reservations, and completes the sale — one transaction, locked against
 * concurrent confirmations.
 */
export async function confirmOnlineOrder(
  businessId: number,
  saleId: number,
): Promise<OnlineOrderResult> {
  return db.transaction(async (tx) => {
    const [sale] = await tx
      .select({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        status: sales.status,
        finalTotal: sales.finalTotal,
        locationId: sales.locationId,
      })
      .from(sales)
      .where(and(eq(sales.id, saleId), eq(sales.businessId, businessId)))
      .for("update");
    if (!sale) throw new Error("Order not found.");
    if (sale.status === "completed") {
      return {
        saleId: sale.id,
        invoiceNumber: sale.invoiceNumber,
        status: "completed" as const,
        total: Number(sale.finalTotal ?? 0),
        currency: "BDT" as const,
        duplicated: true,
      };
    }
    if (sale.status !== "pending") {
      throw new Error(
        `Order ${sale.invoiceNumber} is ${sale.status} and cannot be confirmed.`,
      );
    }

    const items = await tx
      .select({
        id: saleItems.id,
        variantId: saleItems.variantId,
        quantity: saleItems.quantity,
      })
      .from(saleItems)
      .where(eq(saleItems.saleId, saleId));

    const locationId = sale.locationId;
    if (!locationId) throw new Error("Order has no fulfillment location.");

    for (const item of items) {
      // Same FIFO batch consumption the POS uses (locks the batches).
      const cost = await consumeStockFifo(
        tx,
        businessId,
        locationId,
        item.variantId,
        item.quantity,
      );
      await tx
        .update(saleItems)
        .set({ costAtSale: cost.costAtSale })
        .where(eq(saleItems.id, item.id));

      const updated = await tx
        .update(inventoryStock)
        .set({
          quantity: sql`${inventoryStock.quantity} - ${item.quantity}`,
        })
        .where(
          and(
            eq(inventoryStock.businessId, businessId),
            eq(inventoryStock.variantId, item.variantId),
            eq(inventoryStock.locationId, locationId),
          ),
        )
        .returning({ id: inventoryStock.id });
      if (updated.length !== 1) {
        throw new Error(`Stock update failed for variant ${item.variantId}.`);
      }
      await tx.insert(inventoryMovements).values({
        businessId,
        variantId: item.variantId,
        locationId,
        movementType: "sale",
        quantity: item.quantity,
        referenceType: "sale",
        referenceId: saleId,
      });
    }

    // Physical quantity drop replaces the hold.
    await confirmReservationsForSaleInTx(tx, businessId, saleId);

    await tx
      .update(sales)
      .set({
        status: "completed",
        paymentStatus: "paid",
        dueAmount: 0,
        fulfillmentStatus: "processing",
      })
      .where(eq(sales.id, saleId));

    const result = {
      saleId: sale.id,
      invoiceNumber: sale.invoiceNumber,
      status: "completed" as const,
      total: Number(sale.finalTotal ?? 0),
      currency: "BDT" as const,
      duplicated: false,
    };
    await emitWebhookEventInTx(tx, businessId, "order.paid", {
      orderId: result.saleId,
      invoiceNumber: result.invoiceNumber,
      total: result.total,
    });
    return result;
  });
}

/** Cancels a pending online order and releases its reservations. */
export async function cancelOnlineOrder(
  businessId: number,
  saleId: number,
  reason?: string,
): Promise<void> {
  return db.transaction(async (tx) => {
    const [sale] = await tx
      .select({ id: sales.id, status: sales.status })
      .from(sales)
      .where(and(eq(sales.id, saleId), eq(sales.businessId, businessId)))
      .for("update");
    if (!sale) throw new Error("Order not found.");
    if (sale.status !== "pending") {
      throw new Error(
        `Order is ${sale.status}; only pending orders can be cancelled.`,
      );
    }
    await releaseReservationsForSaleInTx(tx, businessId, saleId);
    await tx
      .update(sales)
      .set({ status: "cancelled" })
      .where(eq(sales.id, saleId));
    await emitWebhookEventInTx(tx, businessId, "order.cancelled", {
      orderId: saleId,
      reason: reason ?? null,
    });
    void reason;
  });
}
