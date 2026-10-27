import { toast } from "@/components/ui/toast";
import { ProductTypeOutput } from "../product.schema";
import { CreateProductResponse } from "../product.types";

export async function createProductPromiseToast(
  data: ProductTypeOutput,
  createProduct: (data: ProductTypeOutput) => Promise<CreateProductResponse>,
) {
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const myPromise = async () => {
    // await sleep(1000);
    await createProduct(data);
  };
  return await toast.promise(myPromise(), {
    loading: "Creating product…",
    success: () => `${data.name} created successfully!`,
    error: (error) => error?.response?.data?.message ?? "Could not create product",
  });
}

export async function updateProductPromiseToast(
  data: ProductTypeOutput,
  updateProduct: () => Promise<void>,
) {
  return toast.promise(updateProduct(), {
    loading: "Updating product…",
    success: `${data.name} updated successfully!`,
    error: (error) =>
      error?.response?.data?.message ??
      error?.response?.data?.error ??
      "Could not update product",
  });
}
