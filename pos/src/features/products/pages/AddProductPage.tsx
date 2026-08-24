import { useEffect } from "react";
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

const ProductStockForm = () => {
  // const editingProduct = useEditProductStore((state) => state.editingProduct);
  // const addToProduct = useProductStore((state) => state.addToProduct);
  // const updateProduct = useProductStore((state) => state.updateProduct);
  // const setEditingProduct = useEditProductStore(
  //   (state) => state.setEditingProduct,
  // );
  // const [hasChanges, setHasChanges] = useState(false);

  // const useUnsavedChanges = (hasChanges: boolean) => {
  //   useEffect(() => {
  //     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  //       if (hasChanges) {
  //         e.preventDefault();
  //         e.returnValue = "You have unsave changes. Leave anyway?";
  //       }
  //     };
  //     window.addEventListener("beforeunload", handleBeforeUnload);
  //     return () =>
  //       window.removeEventListener("beforeunload", handleBeforeUnload);
  //   }, [handleChange]);
  // };

  // useUnsavedChanges(hasChanges);
  // const blocker = useBlocker(({ currentLocation, nextLocation }) => {
  //   return hasChanges && currentLocation.pathname !== nextLocation.pathname;
  // });
  // useEffect(() => {
  //   if (blocker.state === "blocked") {
  //     const userWantsToLeave = window.confirm(
  //       "You have unsave changes. Leave anyway?",
  //     );
  //     if (userWantsToLeave) {
  //       blocker.proceed();
  //     } else {
  //       blocker.reset();
  //     }
  //   }
  // }, [blocker]);
  // const navigate = useNavigate();
  // const location = useLocation();
  // const from = location.state?.from?.pathname || "/product";
  // const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   if (editingProduct) {
  //     type ProductKey = keyof ProductsTypes;
  //     const changed: Partial<ProductsTypes> = {};

  //     (Object.keys(productData) as ProductKey[]).forEach((key) => {
  //       const oldVal = editingProduct[key];
  //       const newVal = productData[key];
  //       if (oldVal !== newVal) {
  //         (changed as Record<ProductKey, unknown>)[key] = newVal;
  //       }
  //     });
  //     if (Object.keys(changed).length === 0) {
  //       alert("Nothing Changed");
  //       return;
  //     }

  //     if (window.confirm("Do you want to update this product")) {
  //       setEditingProduct(null);
  //       navigate(from, {
  //         state: {
  //           updated: true,
  //           productId: editingProduct.id,
  //           timestamp: Date.now(),
  //         },
  //         replace: true,
  //       });
  //     }
  //     updateProduct(editingProduct.id, changed);
  //   } else {
  //     addToProduct(productData);
  //   }
  // };
  const form = useForm<ProductTypeInput, unknown, ProductTypeOutput>({
    defaultValues: defaultValues,
    resolver: zodResolver(productSchema),
  });
  const { getProductSelectOptions, getProductVariantOptions ,createProduct } =
    useProductStore();
  function onSubmit(data: ProductTypeOutput) {
    createProduct(data)
  }
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  useEffect(() => {
    getProductSelectOptions();
    getProductVariantOptions();
  }, []);
  console.log(form.formState.errors)
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <Card className="max-w-7xl mx-auto">
        <CardHeader>
          <CardTitle>Product Stock Management</CardTitle>
          <CardDescription>
            Add and manage inventory with detailed specifications
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Form Fields */}
                <div className="lg:col-span-2 space-y-8">
                  {/* General Information Card */}
                  <GeneralInfoCard form={form} />
                  {/* Stock Information Card */}
                  <VariantsInfoCard
                    form={form}
                    append={append}
                    replace={replace}
                    remove={remove}
                  />
                </div>

                {/* Right Column - Image & Additional Info */}
                <div className="space-y-8">
                  {/* More Information Card */}
                  <RightColumnInfoCard form={form} />
                  {/* Save Actions */}
                  <SaveAndUpdateActionsCard form={form} />
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
