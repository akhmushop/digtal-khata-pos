import axios from "./axios.js";
import {
  ChangedItems,
  PaymentDetails,
  UpdateStockChangedItems,
} from "../features/purchases/purchase.types.js";

export async function getPurchasesItemsApi() {
  const { data } = await axios.get("/purchases/items");
  return data;
}
export async function getPurchasesApi() {
  const { data } = await axios.get("/purchases");
  return data;
}
export async function getPurchasesReturnItemsApi() {
  const { data } = await axios.get("/purchases/return-items");
  return data;
}
export async function updateStockApi(
  paymentDetails: PaymentDetails,
  changedItems: UpdateStockChangedItems[],
) {
  const { data } = await axios.post("/purchases/updates", {
    paymentDetails,
    changedItems,
  });
  return data;
}
export async function purchaseReturnApi(
  orderId: number,
  changedItems: ChangedItems[],
) {
  const { data } = await axios.post("/purchase-return", {
    orderId,
    changedItems,
  });
  return data;
}
