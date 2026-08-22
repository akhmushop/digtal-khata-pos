import axios from "../../api/axios.js";
import { ProductsTypes } from "./products.types.js";

export async function getProductsApi() {
  const { data } = await axios.get("/products");
  return data;
}
export async function updateStockByIdApi(
  id: number,
  newStock: number,
  status: string,
) {
  return axios.put(`products/update_stock/${id}`, {
    newStock,
    status,
  });
}
export async function createProductApi(product: ProductsTypes) {
  return axios.post("/products", product);
}
export async function deleteProductByIdApi(id: number) {
  return axios.delete(`products/remove_product/${id}`);
}
export async function duplicateProductApi(product: ProductsTypes) {
  return axios.post(`products/duplicate-product/${product.id}`, product);
}
export async function updateProductByIdApi(
  id: number,
  updatedProduct: Partial<ProductsTypes>,
) {
  return axios.patch(`/products/updated_product/${id}`, updatedProduct);
}
