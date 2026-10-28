import { asc } from "drizzle-orm";
import { db } from "../../db/schema/index.js";
import { suppliers } from "../../db/schema/suppliers.js";
import type { SupplierSchemaTypeOutput } from "./schemas/supplier.schema.js";

export async function getSuppliers() {
  return db.select().from(suppliers).orderBy(asc(suppliers.name));
}

export async function createSupplier(data: SupplierSchemaTypeOutput) {
  const [supplier] = await db
    .insert(suppliers)
    .values({
      name: data.supplierName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      status: data.status,
    })
    .returning({ supplierId: suppliers.id });
  return supplier;
}
