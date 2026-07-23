import type { products } from "../db/schema/products.js";

export type ProductsTypes = typeof products.$inferInsert;
