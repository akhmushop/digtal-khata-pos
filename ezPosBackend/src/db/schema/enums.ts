import { pgEnum } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", [
  "ordered",
  "received",
  "partially_received",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "received",
  "paid",
  "unpaid",
  "partial_paid",
]);
