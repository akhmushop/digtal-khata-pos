import axios from "./axios.js";
import { CartType, CashForm } from "../features/pos/types/cart.types.js";
import { SalesStoreType } from "../types/sales.types.js";

export async function getSalesApi() {
  const { data } = await axios.get("/sold_products");
  return data;
}
export async function createSaleApi(cart: CartType[], cashForm: CashForm) {
  return await axios.post("/sold_products", { cart, cashForm });
}
export async function createSingleReturnApi(item: SalesStoreType) {
  return await axios.post(`/sold_products/refund/${item.saleItemsId}`);
}
export async function createFullReturnApi(id: number) {
  return await axios.post(`/sold_products/refunds_all/${id}`);
}
