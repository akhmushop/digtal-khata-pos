import axios from "../../api/axios.js";
import { CreatePurchaseInput } from "./purchase.types.js";
import { ReceiveItemsFormValues } from "./schemas/receiveItem.schema.js";

export async function createPurchaseApi(data:CreatePurchaseInput) {
  return axios.post("/purchases", data);
}
export async function createReceivePurchaseApi(data:ReceiveItemsFormValues) {
  return axios.post("/purchases/receive", data);
}
