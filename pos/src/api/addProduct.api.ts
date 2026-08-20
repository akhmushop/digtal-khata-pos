import axios from "./axios.js";

export async function getAddProductsSelectOptionsApi() {
  const { data } = await axios.get("/add-product/brands");
  return data;
}
