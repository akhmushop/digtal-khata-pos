import axios from "../../api/axios.js";
import { AddCategorySchemaType } from "./addCategory.schema.js";
import { BrandSchemaType } from "./brand.schema.js";
import { ProductTypeOutput } from "./product.schema.js";
import { UnitSchemaType } from "./schemas/unit.schema.js";
import {
  VariantOptionSchemaType,
  VariantTypeSchemaType,
} from "./schemas/variant.schema.js";

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
export async function createUnitApi(data: UnitSchemaType) {
  return axios.post("/product/unit", data);
}
export async function createVariantTypeApi(data: VariantTypeSchemaType) {
  return axios.post("/product/variant-type", data);
}
export async function createVariantOptionApi(data: VariantOptionSchemaType) {
  return axios.post("/product/variant-option", data);
}
