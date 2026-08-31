import axios from "../../api/axios.js";
import { AddCategorySchemaType } from "./addCategory.schema.js";
import { BrandSchemaType } from "./brand.schema.js";
import { ProductTypeOutput } from "./product.schema.js";

export async function getProductSelectOptionsApi() {
  const { data } = await axios.get("/product/select-options");
  return data;
}
export async function getProductVariantOptionsApi() {
  const { data } = await axios.get("/product/variant-options");
  return data;
}
export async function createProductApi(data: ProductTypeOutput) {
  return axios.post("/product", data);
}
export async function createCategoryApi(data: AddCategorySchemaType) {
  return axios.post("/product/category", data);
}
export async function createBrandApi(data: BrandSchemaType) {
  return axios.post("/product/brand", data);
}
