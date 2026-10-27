import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  ProductTypeInput,
  ProductTypeOutput,
  productSchema,
} from "@/features/products/product.schema.js";
import { zodResolver } from "@hookform/resolvers/zod";
import { defaultValues } from "../constants/form-defaults.js";
import { VariantsInfoCard } from "../components/addProductPage/VariantsInfoCard.js";
import { GeneralInfoCard } from "../components/addProductPage/GeneralInfoCard.js";
import { RightColumnInfoCard } from "../components/addProductPage/RightColumnInfoCard.js";
import { SaveAndUpdateActionsCard } from "../components/addProductPage/SaveAndUpdateActionsCard.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.js";
import useProductStore from "@/features/products/useProductStore.js";
import {
  createProductPromiseToast,
  updateProductPromiseToast,
} from "../utils/productPromiseToast.js";
import { getProductForEditApi } from "../product.api.js";
import { getErrorMessage } from "@/utils/getErrorMessage.js";
import { useNavigate, useParams } from "react-router";

const ProductStockForm = () => {
  const { id: productId } = useParams();
  const isEditing = productId !== undefined;
  const navigate = useNavigate();
  const form = useForm<ProductTypeInput, unknown, ProductTypeOutput>({
    defaultValues,
    resolver: zodResolver(productSchema),
  });
  const createProduct = useProductStore((state) => state.createProduct);
  const updateProduct = useProductStore((state) => state.updateProduct);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setIsLoadingProduct(false);
      return;
    }

    setLoadError(null);
    const id = Number(productId);
    if (!Number.isInteger(id) || id < 1) {
      setLoadError("Invalid product ID.");
      setIsLoadingProduct(false);
      return;
    }

    let cancelled = false;
    setIsLoadingProduct(true);
    getProductForEditApi(id)
      .then((product) => {
        if (!cancelled) {
          form.reset(product);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingProduct(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [form, productId]);

  async function onSubmit(data: ProductTypeOutput) {
    if (productId) {
      await updateProductPromiseToast(data, () =>
        updateProduct(Number(productId), data),
      );
      navigate("/product");
      return;
    }

    await createProductPromiseToast(data, createProduct);
    form.reset();
  }

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  if (isEditing && (isLoadingProduct || loadError)) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <Card className="max-w-7xl mx-auto">
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
            <CardDescription>
              {loadError ?? "Loading product…"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <Card className="max-w-7xl mx-auto">
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Product" : "Product Stock Management"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Update product details and variant pricing. Existing stock is not changed."
              : "Add and manage inventory with detailed specifications"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <GeneralInfoCard form={form} />
                  <VariantsInfoCard
                    fields={fields}
                    form={form}
                    append={append}
                    replace={replace}
                    remove={remove}
                    isEditing={isEditing}
                  />
                </div>
                <div className="space-y-8">
                  <RightColumnInfoCard form={form} isEditing={isEditing} />
                  <SaveAndUpdateActionsCard
                    form={form}
                    isEditing={isEditing}
                    onCancel={() => navigate("/product")}
                  />
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductStockForm;
