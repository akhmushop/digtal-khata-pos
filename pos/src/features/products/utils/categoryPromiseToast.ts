import { toast } from "@/components/ui/toast";
import { AddCategorySchemaType } from "../addCategory.schema";
import { CreateCategoryResponse } from "../product.types";

export async function createCategoryPromiseToast(
  data: AddCategorySchemaType,
  createCategory: (
    data: AddCategorySchemaType,
  ) => Promise<CreateCategoryResponse>,
) {
  return await toast.promise(createCategory(data), {
    loading: "Creating Category...",
    success: () => `${data.categoryName} created successfully!`,
    error: (error) =>
      error?.response?.data?.message ?? "Could not create category",
  });
}
