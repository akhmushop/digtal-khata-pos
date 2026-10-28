import axios from "../../api/axios.js";
import type { SupplierSchemaTypeOutput } from "./schemas/supplier.schema";
import type { Supplier, CreateSupplierResponse } from "./contact.type";

export async function createSupplierApi(data: SupplierSchemaTypeOutput) {
  return axios.post<CreateSupplierResponse>("/contacts/supplier", data);
}

export async function getSuppliersApi() {
  const { data } = await axios.get<Supplier[]>("/contacts/suppliers");
  return data;
}
