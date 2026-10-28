import axios from "../../api/axios.js";
import { AddCategorySchemaType } from "./addCategory.schema.js";
import { BrandSchemaType } from "./brand.schema.js";
import { ProductTypeInput, ProductTypeOutput } from "./product.schema.js";
import {
  StockAdjustmentInput,
  StockAdjustmentResult,
} from "./product.types.js";
import { UnitSchemaType } from "./schemas/unit.schema.js";
import {
  VariantOptionSchemaType,
  VariantTypeSchemaType,
} from "./schemas/variant.schema.js";
export async function getProductsApi() {
  const { data } = await axios.get("/products");
  return data;
}
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
export async function getProductForEditApi(id: number) {
  const { data } = await axios.get<ProductTypeInput>(`/product/${id}`);
  return data;
}
export async function updateProductApi(id: number, data: ProductTypeOutput) {
  const { data: response } = await axios.put<{
    data: {
      productId: number;
      addedVariants: { id: number; sku: string }[];
    };
  }>(`/product/${id}`, data);
  return response.data;
}
export async function adjustVariantStockApi(
  variantId: number,
  data: StockAdjustmentInput,
) {
  const { data: response } = await axios.post<{
    data: StockAdjustmentResult;
  }>(`/products/variants/${variantId}/adjust-stock`, data);
  return response.data;
}
export async function createCategoryApi(data: AddCategorySchemaType) {
  return axios.post("/product/category", data);
}
export async function updateCategoryApi(
  id: number,
  data: AddCategorySchemaType,
) {
  return axios.put(`/product/category/${id}`, data);
}
export async function deleteCategoryApi(id: number) {
  return axios.delete(`/product/category/${id}`);
}
export async function createBrandApi(data: BrandSchemaType) {
  return axios.post("/product/brand", data);
}
export async function updateBrandApi(id: number, data: BrandSchemaType) {
  return axios.put(`/product/brand/${id}`, data);
}
export async function deleteBrandApi(id: number) {
  return axios.delete(`/product/brand/${id}`);
}
export async function createUnitApi(data: UnitSchemaType) {
  return axios.post("/product/unit", data);
}
export async function updateUnitApi(id: number, data: UnitSchemaType) {
  return axios.put(`/product/unit/${id}`, data);
}
export async function deleteUnitApi(id: number) {
  return axios.delete(`/product/unit/${id}`);
}
export async function createVariantTypeApi(data: VariantTypeSchemaType) {
  return axios.post("/product/variant-type", data);
}
export async function updateVariantTypeApi(
  id: number,
  data: VariantTypeSchemaType,
) {
  return axios.put(`/product/variant-type/${id}`, data);
}
export async function deleteVariantTypeApi(id: number) {
  return axios.delete(`/product/variant-type/${id}`);
}
export async function createVariantOptionApi(data: VariantOptionSchemaType) {
  return axios.post("/product/variant-option", data);
}
export async function updateVariantOptionApi(id: number, value: string) {
  return axios.put(`/product/variant-option/${id}`, { value });
}
export async function deleteVariantOptionApi(id: number) {
  return axios.delete(`/product/variant-option/${id}`);
}
