import { ProductsTypes } from "./products.types";

export interface Resizing {
  columnKey: string;
  startX: number;
  startWidth: number;
}
export interface SortConfig {
  key: keyof ProductsTypes | null;
  direction: "asc" | "desc";
}
