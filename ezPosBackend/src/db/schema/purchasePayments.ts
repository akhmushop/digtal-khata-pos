import { pgTable, serial, integer, numeric, varchar, timestamp, pgEnum, text } from "drizzle-orm/pg-core";
import { purchases } from "./purchases.js";

// 1. Enum for Payment Method
export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "bank_transfer",
  "cheque",
  "card",
  "other",
]);

// 2. The Payments Table
export const purchasePayments = pgTable("purchase_payments", {
  id: serial("id").primaryKey(),
  
  // Link back to the main purchase order
  purchaseId: integer("purchase_id")
    .notNull()
    .references(() => purchases.id, { onDelete: "cascade" }),
    
  // How much was paid in THIS specific transaction
  amount: numeric("amount", { precision: 12, scale: 2 ,mode:"number"}).notNull(),
  
  // The method used for THIS transaction
  method: paymentMethodEnum("method").notNull(),
  
  // Optional notes for this specific payment (e.g., "Cheque #12345")
  notes: text("notes"),
  
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
});