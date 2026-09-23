import axios from "../../api/axios.js";
import { CreatePurchaseInput } from "./purchase.types.js";

export async function createPurchaseApi(data:CreatePurchaseInput) {
  return axios.post("/purchases", data);
}
