import axios from "./axios.js";

export async function getAddProductsSelectOptionsApi() {
  const { data } = await axios.get("/add-product/select-options");
  return data;
}
export async function getAddProductVariantOptionsApi() {
const {data} = await axios.get("/add-product/variant-options")
return data
}