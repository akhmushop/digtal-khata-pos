import axios from "./axios.js";
import {
  PaymentDetails,
  PurchaseReturnInput,
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
  data: PurchaseReturnInput,
) {
  const response = await axios.post("/purchase-return", data);
  return response.data;
}
