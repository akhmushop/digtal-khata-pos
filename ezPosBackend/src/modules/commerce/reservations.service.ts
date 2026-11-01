import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db/schema/index.js";
import { channelInventoryAllocations } from "../../db/schema/channelInventoryAllocations.js";
import { integrations } from "../../db/schema/integrations.js";
import { inventoryReservations } from "../../db/schema/inventoryReservations.js";
import { inventoryStock } from "../../db/schema/inventoryStock.js";

/**
 * Stock reservation engine (Phase 9.1).
 *
 * ezPos is the single inventory source of truth. An active reservation
 * reduces the stock storefronts may sell; `inventory_stock.reserved_quantity`
 * is maintained as the per-row sum of active reservations. Physical POS
 * sales keep deducting `quantity` directly — locking the same stock rows is
 * what prevents cross-channel overselling at the database level.
 *
 * Availability (computed inside the locking transaction):
 *   available = stock.quantity - stock.reserved_quantity
 *   onlineAvailable = allocation 'reserved' ? min(allocatedQty, available)
 *                     : available
 *
 * The documented edge case: physical POS can oversell reserved stock (the
 * counter is master of its own shelf). A reservation whose confirmation then
 * finds insufficient batches fails loudly and the order stays pending for
 * manual resolution — surfaced by the integrations dashboard (Phase 9.3).
 */

export interface ReservationLineInput {
  variantId: number;
  quantity: number;
}

export interface CreatedReservation {
  reservationId: number;
  variantId: number;
  quantity: number;
  stockId: number;
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Creates active reservations for the given lines and bumps
 * reserved_quantity. Caller must run inside a transaction; the stock rows
 * are locked FOR UPDATE so concurrent checkouts serialize.
 */
export async function createReservationsInTx(
  tx: Tx,
  input: {
    businessId: number;
    locationId: number;
    integrationId?: number | null;
    saleId?: number | null;
    lines: ReservationLineInput[];
    idempotencyKey?: string | null;
    expiresAt: Date;
  },
): Promise<CreatedReservation[]> {
  const variantIds = [...new Set(input.lines.map((l) => l.variantId))];
  const stockRows = await tx
    .select({
      id: inventoryStock.id,
      variantId: inventoryStock.variantId,
      quantity: inventoryStock.quantity,
      reservedQuantity: inventoryStock.reservedQuantity,
    })
    .from(inventoryStock)
    .where(
      and(
        eq(inventoryStock.businessId, input.businessId),
        eq(inventoryStock.locationId, input.locationId),
        inArray(inventoryStock.variantId, variantIds),
      ),
    )
    .for("update");
  const stockByVariant = new Map(stockRows.map((row) => [row.variantId, row]));

  const allocations = await tx
    .select({
      variantId: channelInventoryAllocations.variantId,
      mode: channelInventoryAllocations.mode,
      allocatedQty: channelInventoryAllocations.allocatedQty,
    })
    .from(channelInventoryAllocations)
    .where(
      and(
        eq(channelInventoryAllocations.businessId, input.businessId),
        input.integrationId
          ? eq(channelInventoryAllocations.integrationId, input.integrationId)
          : sql`false`,
        inArray(channelInventoryAllocations.variantId, variantIds),
      ),
    );
  const allocationByVariant = new Map(
    allocations.map((row) => [row.variantId, row]),
  );

  const created: CreatedReservation[] = [];
  for (const line of input.lines) {
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw new Error(`Invalid reservation quantity for variant ${line.variantId}.`);
    }
    const stock = stockByVariant.get(line.variantId);
    if (!stock) {
      throw new Error(
        `No stock record for variant ${line.variantId} at this location.`,
      );
    }
    const available =
      (stock.quantity ?? 0) - (stock.reservedQuantity ?? 0);
    const allocation = allocationByVariant.get(line.variantId);
    const onlineAvailable =
      allocation && allocation.mode === "reserved"
        ? Math.min(allocation.allocatedQty, available)
        : available;
    if (onlineAvailable < line.quantity) {
      throw new Error(
        `Insufficient online stock for variant ${line.variantId}: requested ${line.quantity}, available ${onlineAvailable}.`,
      );
    }

    const [reservation] = await tx
      .insert(inventoryReservations)
      .values({
        businessId: input.businessId,
        variantId: line.variantId,
        locationId: input.locationId,
        saleId: input.saleId ?? null,
        integrationId: input.integrationId ?? null,
        stockId: stock.id,
        quantity: line.quantity,
        status: "active",
        idempotencyKey: input.idempotencyKey
          ? `${input.idempotencyKey}:${line.variantId}`
          : null,
        expiresAt: input.expiresAt,
      })
      .returning({ id: inventoryReservations.id });
    if (!reservation) {
      throw new Error("Reservation insert returned no row.");
    }

    await tx
      .update(inventoryStock)
      .set({
        reservedQuantity: sql`${inventoryStock.reservedQuantity} + ${line.quantity}`,
      })
      .where(eq(inventoryStock.id, stock.id));

    created.push({
      reservationId: reservation.id,
      variantId: line.variantId,
      quantity: line.quantity,
      stockId: stock.id,
    });
  }
  return created;
}

/** Releases every ACTIVE reservation of a sale; safe to call repeatedly. */
export async function releaseReservationsForSaleInTx(
  tx: Tx,
  businessId: number,
  saleId: number,
): Promise<number> {
  const active = await tx
    .select({
      id: inventoryReservations.id,
      stockId: inventoryReservations.stockId,
      quantity: inventoryReservations.quantity,
      status: inventoryReservations.status,
    })
    .from(inventoryReservations)
    .where(
      and(
        eq(inventoryReservations.businessId, businessId),
        eq(inventoryReservations.saleId, saleId),
        inArray(inventoryReservations.status, ["active", "expired"]),
      ),
    )
    .for("update");

  for (const reservation of active) {
    if (reservation.status === "active") {
      // Expired rows were already decremented by the expiry sweep.
      await tx
        .update(inventoryStock)
        .set({
          reservedQuantity: sql`greatest(0, ${inventoryStock.reservedQuantity} - ${reservation.quantity})`,
        })
        .where(eq(inventoryStock.id, reservation.stockId));
    }
    await tx
      .update(inventoryReservations)
      .set({ status: "released" })
      .where(eq(inventoryReservations.id, reservation.id));
  }
  return active.length;
}

/**
 * Marks a sale's reservations confirmed. Call AFTER the stock deduction in
 * the same transaction: the physical quantity drop replaces the hold, so
 * reserved_quantity is decremented here.
 */
export async function confirmReservationsForSaleInTx(
  tx: Tx,
  businessId: number,
  saleId: number,
): Promise<number> {
  const active = await tx
    .select({
      id: inventoryReservations.id,
      stockId: inventoryReservations.stockId,
      quantity: inventoryReservations.quantity,
    })
    .from(inventoryReservations)
    .where(
      and(
        eq(inventoryReservations.businessId, businessId),
        eq(inventoryReservations.saleId, saleId),
        eq(inventoryReservations.status, "active"),
      ),
    )
    .for("update");

  for (const reservation of active) {
    await tx
      .update(inventoryReservations)
      .set({ status: "confirmed" })
      .where(eq(inventoryReservations.id, reservation.id));
    await tx
      .update(inventoryStock)
      .set({
        reservedQuantity: sql`greatest(0, ${inventoryStock.reservedQuantity} - ${reservation.quantity})`,
      })
      .where(eq(inventoryStock.id, reservation.stockId));
  }
  return active.length;
}

/** Availability snapshot for storefront reads (Phase 9.2 builds on this). */
export async function getOnlineAvailability(
  businessId: number,
  locationId: number,
  integrationId: number | null,
  variantIds: number[],
): Promise<Map<number, number>> {
  const stockRows = await db
    .select({
      variantId: inventoryStock.variantId,
      quantity: inventoryStock.quantity,
      reservedQuantity: inventoryStock.reservedQuantity,
    })
    .from(inventoryStock)
    .where(
      and(
        eq(inventoryStock.businessId, businessId),
        eq(inventoryStock.locationId, locationId),
        inArray(inventoryStock.variantId, variantIds),
      ),
    );
  const allocations = integrationId
    ? await db
        .select({
          variantId: channelInventoryAllocations.variantId,
          mode: channelInventoryAllocations.mode,
          allocatedQty: channelInventoryAllocations.allocatedQty,
        })
        .from(channelInventoryAllocations)
        .where(
          and(
            eq(channelInventoryAllocations.businessId, businessId),
            eq(channelInventoryAllocations.integrationId, integrationId),
            inArray(channelInventoryAllocations.variantId, variantIds),
          ),
        )
    : [];
  const allocationByVariant = new Map(
    allocations.map((row) => [row.variantId, row]),
  );

  const result = new Map<number, number>();
  for (const row of stockRows) {
    const available = (row.quantity ?? 0) - (row.reservedQuantity ?? 0);
    const allocation = allocationByVariant.get(row.variantId);
    result.set(
      row.variantId,
      allocation && allocation.mode === "reserved"
        ? Math.max(0, Math.min(allocation.allocatedQty, available))
        : Math.max(0, available),
    );
  }
  return result;
}

export async function integrationExists(
  businessId: number,
  integrationId: number,
): Promise<boolean> {
  const [row] = await db
    .select({ id: integrations.id })
    .from(integrations)
    .where(
      and(
        eq(integrations.id, integrationId),
        eq(integrations.businessId, businessId),
      ),
    );
  return row !== undefined;
}
