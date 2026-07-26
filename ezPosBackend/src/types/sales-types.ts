import type { products } from "../db/schema/products.js";

export interface cart {
  id: number;
  sold_quantity: number;
  final_price: number;
  product_name: string;
  cost: number;
  
}
export interface cashForm {
  final_total: number;
  paid_amount: number;
  payment_method: string;
  customer_id: number;
}
export interface saleDataInput {
  cart: cart[];
  cashForm: cashForm;
}
