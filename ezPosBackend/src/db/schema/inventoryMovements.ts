import { pgTable, serial, integer, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { productVariants } from "./productVariants.js";
import { locations } from "./locations.js";
import { inventoryBatches } from "./inventoryBatches.js";

// 1. Create an Enum for Movement Type
export const movementTypeEnum = pgEnum("movement_type", [
  "purchase",      // Stock received from a supplier
  "sale",          // Stock sold to a customer
  "return",        // Stock returned by a customer
  "adjustment",    // Manual stock take correction (+/-)
  "transfer_in",   // Stock moved from another location
  "transfer_out",  // Stock moved to another location
]);

// 2. Create the Table
export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  
  // Foreign Keys
  variantId: integer("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "restrict" }), // Don't delete a variant if it has history!
    
  locationId: integer("location_id")
    .references(() => locations.id, ),
    
  // Nullable: Only applies if the product tracks batches
  batchId: integer("batch_id")
    .references(() => inventoryBatches.id, ),
    
  // Movement Details
  movementType: movementTypeEnum("movement_type").notNull(),
  
  // Can be positive (in) or negative (out)
  quantity: integer("quantity").notNull(), 
  
  // Polymorphic Reference (Links to Purchase, Sale, or Adjustment)
  // e.g., referenceType = "purchase", referenceId = 15
  referenceType: varchar("reference_type", { length: 50 }).notNull(),
  referenceId: integer("reference_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});