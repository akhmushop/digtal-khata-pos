import axios from "../../api/axios.js";
import { CartType, CashForm } from "./types/cart.types.js";
import { CreateSalePayload } from "@/features/pos/schemas/cart.schema.js";
import { SalesStoreType } from "@/features/pos/types/sales.types.js";

export async function getSalesApi() {
  const { data } = await axios.get("/sold_products");
  return data;
}
export async function createSaleApi(data: CreateSalePayload) {
  console.log(data)
  return await axios.post("/sales", data);
}
export async function createSingleReturnApi(item: SalesStoreType) {
  return await axios.post(`/sold_products/refund/${item.saleItemsId}`);
}
export async function createFullReturnApi(id: number) {
  return await axios.post(`/sold_products/refunds_all/${id}`);
}
