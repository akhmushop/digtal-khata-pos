import axios from "../../api/axios.js";
import { SupplierSchemaTypeOutput } from "./schemas/supplier.schema";

export async function createSupplierApi(data: SupplierSchemaTypeOutput) {
  return axios.post("/contacts/supplier", data);
}
