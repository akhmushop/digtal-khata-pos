import { asc, eq } from "drizzle-orm";
import { db } from "../../db/schema/index.js";
import { suppliers } from "../../db/schema/suppliers.js";
import type { SupplierSchemaTypeOutput } from "./schemas/supplier.schema.js";

// Every function takes the caller's server-verified businessId (from
// requireBusinessContext) and scopes all reads and writes to it.
export async function getSuppliers(businessId: number) {
  return db
    .select()
    .from(suppliers)
    .where(eq(suppliers.businessId, businessId))
    .orderBy(asc(suppliers.name));
}

export async function createSupplier(
  businessId: number,
  data: SupplierSchemaTypeOutput,
) {
  const [supplier] = await db
    .insert(suppliers)
    .values({
      businessId,
      name: data.supplierName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      status: data.status,
    })
    .returning({ supplierId: suppliers.id });
  return supplier;
}
