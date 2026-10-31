import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "../../db/schema/index.js";
import { inventoryBatches } from "../../db/schema/inventoryBatches.js";
import { inventoryStock } from "../../db/schema/inventoryStock.js";
import { locations } from "../../db/schema/locations.js";
import { sales } from "../../db/schema/sales.js";
import { purchases } from "../../db/schema/purchases.js";
import { expenses } from "../../db/schema/expenses.js";
import { userLocationAssignments } from "../../db/schema/userLocationAssignments.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/handleError.js";
import type { CreateLocationInput, UpdateLocationInput } from "./locations.validation.js";
import { assertWithinLocationLimit } from "../../services/entitlements.js";

export interface LocationSummary {
  id: number;
  name: string;
  locationCode: string | null;
  locationType: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  isDefault: boolean;
  status: string;
  createdAt: Date | null;
}

function toSummary(row: typeof locations.$inferSelect): LocationSummary {
  return {
    id: row.id,
    name: row.name,
    locationCode: row.locationCode,
    locationType: row.locationType,
    phone: row.phone,
    email: row.email,
    address: row.address,
    city: row.city,
    isDefault: row.isDefault,
    status: row.status,
    createdAt: row.createdAt,
  };
}

export async function listLocations(businessId: number): Promise<LocationSummary[]> {
  const rows = await db
    .select()
    .from(locations)
    .where(eq(locations.businessId, businessId))
    .orderBy(asc(locations.id));
  return rows.map(toSummary);
}

export async function getDefaultLocation(
  businessId: number,
): Promise<LocationSummary | null> {
  const [row] = await db
    .select()
    .from(locations)
    .where(and(eq(locations.businessId, businessId), eq(locations.isDefault, true)));
  return row ? toSummary(row) : null;
}

export async function createLocation(
  businessId: number,
  input: CreateLocationInput,
): Promise<LocationSummary> {
  if (input.locationCode) {
    const [codeTaken] = await db
      .select({ id: locations.id })
      .from(locations)
      .where(
        and(
          eq(locations.businessId, businessId),
          eq(locations.locationCode, input.locationCode),
        ),
      );
    if (codeTaken) {
      throw new ConflictError("A location with this code already exists.");
    }
  }

  const [existingCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(locations)
    .where(eq(locations.businessId, businessId));
  const isFirstLocation = Number(existingCount?.count ?? 0) === 0;

  // The first location of a business automatically becomes the default;
  // thereafter the default only moves through an explicit isDefault flag.
  const makeDefault = isFirstLocation || input.isDefault === true;

  return db.transaction(async (tx) => {
    // Plan limit: location count vs the subscription plan's maxLocations,
    // checked inside the insert transaction (advisory-locked).
    await assertWithinLocationLimit(businessId, tx);
    if (makeDefault && !isFirstLocation) {
      await tx
        .update(locations)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(locations.businessId, businessId));
    }
    const [created] = await tx
      .insert(locations)
      .values({
        businessId,
        name: input.name,
        locationCode: input.locationCode ?? null,
        locationType: input.locationType,
        phone: input.phone ?? null,
        email: input.email ?? null,
        address: input.address ?? null,
        city: input.city ?? null,
        isDefault: makeDefault,
      })
      .returning();
    if (!created) {
      throw new Error("Location insert returned no row.");
    }
    return toSummary(created);
  });
}

export async function updateLocation(
  businessId: number,
  locationId: number,
  input: UpdateLocationInput,
): Promise<LocationSummary> {
  const [existing] = await db
    .select()
    .from(locations)
    .where(
      and(eq(locations.id, locationId), eq(locations.businessId, businessId)),
    );
  if (!existing) {
    throw new NotFoundError("Location not found.");
  }

  if (input.locationCode !== undefined && input.locationCode !== null) {
    const [codeTaken] = await db
      .select({ id: locations.id })
      .from(locations)
      .where(
        and(
          eq(locations.businessId, businessId),
          eq(locations.locationCode, input.locationCode),
        ),
      );
    if (codeTaken && codeTaken.id !== locationId) {
      throw new ConflictError("A location with this code already exists.");
    }
  }

  if (input.status === "inactive" && existing.status === "active") {
    await assertLocationNotLastActive(businessId, locationId);
  }

  await db.transaction(async (tx) => {
    if (input.isDefault === true && !existing.isDefault) {
      await tx
        .update(locations)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(locations.businessId, businessId));
    }
    await tx
      .update(locations)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.locationCode !== undefined
          ? { locationCode: input.locationCode }
          : {}),
        ...(input.locationType !== undefined
          ? { locationType: input.locationType }
          : {}),
        ...(input.phone !== undefined ? { phone: input.phone ?? null } : {}),
        ...(input.email !== undefined ? { email: input.email ?? null } : {}),
        ...(input.address !== undefined
          ? { address: input.address ?? null }
          : {}),
        ...(input.city !== undefined ? { city: input.city ?? null } : {}),
        ...(input.isDefault !== undefined
          ? { isDefault: input.isDefault }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        updatedAt: new Date(),
      })
      .where(eq(locations.id, locationId));
  });

  const [updated] = await db
    .select()
    .from(locations)
    .where(eq(locations.id, locationId));
  if (!updated) {
    throw new Error("Location update did not return the row.");
  }
  return toSummary(updated);
}

async function assertLocationNotLastActive(
  businessId: number,
  locationId: number,
): Promise<void> {
  const rows = await db
    .select({ id: locations.id, status: locations.status })
    .from(locations)
    .where(eq(locations.businessId, businessId));
  const activeOthers = rows.filter(
    (row) => row.status === "active" && row.id !== locationId,
  );
  if (activeOthers.length === 0) {
    throw new BadRequestError(
      "A business must keep at least one active location.",
    );
  }
}

/**
 * Locations holding historical transactions or stock cannot be deleted —
 * they are deactivated instead. Guards against silent history loss.
 */
export async function deleteLocation(
  businessId: number,
  locationId: number,
): Promise<void> {
  const [existing] = await db
    .select()
    .from(locations)
    .where(
      and(eq(locations.id, locationId), eq(locations.businessId, businessId)),
    );
  if (!existing) {
    throw new NotFoundError("Location not found.");
  }

  const usageChecks = await Promise.all([
    db
      .select({ id: sales.id })
      .from(sales)
      .where(and(eq(sales.locationId, locationId), eq(sales.businessId, businessId)))
      .limit(1),
    db
      .select({ id: purchases.id })
      .from(purchases)
      .where(
        and(eq(purchases.locationId, locationId), eq(purchases.businessId, businessId)),
      )
      .limit(1),
    db
      .select({ id: expenses.id })
      .from(expenses)
      .where(and(eq(expenses.locationId, locationId), eq(expenses.businessId, businessId)))
      .limit(1),
    db
      .select({ id: inventoryStock.id })
      .from(inventoryStock)
      .where(
        and(
          eq(inventoryStock.locationId, locationId),
          eq(inventoryStock.businessId, businessId),
          sql`${inventoryStock.quantity} > 0`,
        ),
      )
      .limit(1),
    db
      .select({ id: inventoryBatches.id })
      .from(inventoryBatches)
      .where(
        and(
          eq(inventoryBatches.locationId, locationId),
          eq(inventoryBatches.businessId, businessId),
          sql`${inventoryBatches.quantityRemaining} > 0`,
        ),
      )
      .limit(1),
  ]);

  if (usageChecks.some(([row]) => row !== undefined)) {
    throw new ConflictError(
      "This location has historical transactions or stock and cannot be deleted. Deactivate it instead.",
    );
  }

  await db.transaction(async (tx) => {
    await tx
      .delete(userLocationAssignments)
      .where(eq(userLocationAssignments.locationId, locationId));
    await tx.delete(locations).where(eq(locations.id, locationId));
  });
}

/**
 * Lists the location ids a staff member can access. Owners (wildcard) see
 * every location of the business; assignment rows are authoritative for
 * everyone else.
 */
export async function listAccessibleLocationIds(
  businessId: number,
  userId: number,
  callerIsOwner: boolean,
): Promise<number[]> {
  const rows = await db
    .select({ id: locations.id })
    .from(locations)
    .where(eq(locations.businessId, businessId));
  if (callerIsOwner) return rows.map((row) => row.id);
  const assignments = await db
    .select({ locationId: userLocationAssignments.locationId })
    .from(userLocationAssignments)
    .where(
      and(
        eq(userLocationAssignments.businessId, businessId),
        eq(userLocationAssignments.userId, userId),
      ),
    );
  return assignments.map((row) => row.locationId);
}

export async function setLocationAssignments(
  businessId: number,
  userId: number,
  locationIds: number[],
  callerIsOwner: boolean,
): Promise<void> {
  if (!callerIsOwner) {
    throw new ForbiddenError(
      "Only the owner can manage location assignments.",
    );
  }
  const uniqueIds = [...new Set(locationIds)];
  if (uniqueIds.length > 0) {
    const found = await db
      .select({ id: locations.id })
      .from(locations)
      .where(eq(locations.businessId, businessId));
    const owned = new Set(found.map((row) => row.id));
    const unknown = uniqueIds.filter((id) => !owned.has(id));
    if (unknown.length > 0) {
      throw new BadRequestError(
        "One or more locations do not belong to this business.",
      );
    }
  }
  await db.transaction(async (tx) => {
    await tx
      .delete(userLocationAssignments)
      .where(
        and(
          eq(userLocationAssignments.businessId, businessId),
          eq(userLocationAssignments.userId, userId),
        ),
      );
    if (uniqueIds.length > 0) {
      await tx.insert(userLocationAssignments).values(
        uniqueIds.map((locationId) => ({
          userId,
          businessId,
          locationId,
        })),
      );
    }
  });
}
