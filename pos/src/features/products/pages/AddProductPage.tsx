import { useEffect } from "react";

import { Package, Grid, Save } from "lucide-react";
import { useProductStore, useEditProductStore } from "../useProductStore.js";
import { replace, useLocation, useNavigate } from "react-router";
import { useBlocker } from "react-router";

import { Button } from "@/components/ui/button";

import { useForm, useFieldArray } from "react-hook-form";
import {
  AddProductFormInput,
  AddProductFormOutput,
  productSchema,
} from "@/features/products/product.schema.js";
import { zodResolver } from "@hookform/resolvers/zod";
import useAddProductStore from "@/features/products/useAddProductStore.js";
import { defaultValues } from "../constants/form-defaults.js";
import { InputField } from "../components/addProductPage/InputField.js";
import { SelectOptions } from "../components/addProductPage/SelectOptions.js";
import { inventorySources, productStatus, productTypes, trackingType } from "../constants/form-status.js";
import { AccordionCard } from "../components/addProductPage/AccordionCard.js";
import { InputFile } from "../components/addProductPage/InputFile.js";
import { InventorySourceSelector } from "../components/addProductPage/InventorySourceSelector.js";

const ProductStockForm = () => {
  // const editingProduct = useEditProductStore((state) => state.editingProduct);
  // const [imagePreview, setImagePreview] = useState<string | null>(
  //   editingProduct?.image ?? null,
  // );
  // const initialErrors: Errors = {
  //   barcode: "",
  //   productName: "",
  //   cost: "",
  //   price: "",
  //   quantity: "",
  //   image: "",
  // };
  // const [errors, setErrors] = useState(initialErrors);
  // const [showSuccess, setShowSuccess] = useState(false);
  // const addToProduct = useProductStore((state) => state.addToProduct);
  // const updateProduct = useProductStore((state) => state.updateProduct);
  // const setEditingProduct = useEditProductStore(
  //   (state) => state.setEditingProduct,
  // );
  // const initialFormData: InitialFormData = editingProduct
  //   ? {
  //       id: editingProduct.id,
  //       barcode: editingProduct.barcode,
  //       productName: editingProduct.productName,
  //       productUnit: editingProduct.productUnit,
  //       productType: editingProduct.productType,
  //       alertQuantity: editingProduct.alertQuantity,
  //       cost: editingProduct.cost,
  //       price: editingProduct.price,
  //       quantity: editingProduct.quantity,
  //       discountPercent: editingProduct.discountPercent,
  //       flatDiscount: editingProduct.flatDiscount,
  //       batchNumber: editingProduct.batchNumber,
  //       expiryDate: editingProduct.expiryDate || "",
  //       description: editingProduct.description,
  //       supplier: editingProduct.supplier,
  //       brand: editingProduct.brand,
  //       category: editingProduct.category,
  //       tags: editingProduct.tags,
  //       sku: editingProduct.sku,
  //       weight: editingProduct.weight,
  //       dimensions: editingProduct.dimensions,
  //       variations: editingProduct.variations,
  //       status: editingProduct.status,
  //       location: editingProduct.location,
  //     }
  //   : {
  //       id: 0,
  //       barcode: "",
  //       productName: "",
  //       productUnit: "PC",
  //       productType: "SIMPLE",
  //       alertQuantity: 0,
  //       cost: 0,
  //       price: 0,
  //       quantity: 0,
  //       discountPercent: 0,
  //       flatDiscount: 0,
  //       batchNumber: "",
  //       expiryDate: "",
  //       description: "",
  //       supplier: "",
  //       brand: "",
  //       category: "",
  //       tags: [],
  //       sku: "",
  //       weight: "",
  //       dimensions: "",
  //       variations: "",
  //       status: "",
  //       location: "",
  //     };
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

  // const [formData, setFormData] = useState(initialFormData);

  // const [tagInput, setTagInput] = useState(
  //   editingProduct?.tags?.join(", ") ?? "",
  // );
  // const validateForm = () => {
  //   const newErrors = initialErrors;

  //   if (!formData.barcode.trim()) {
  //     newErrors.barcode = "Barcode is required";
  //   }

  //   if (!formData.productName.trim()) {
  //     newErrors.productName = "Product name is required";
  //   }

  //   if (!formData.cost || formData.cost <= 0) {
  //     newErrors.cost = "Valid cost is required";
  //   }

  //   if (!formData.price || formData.price <= 0) {
  //     newErrors.price = "Valid price is required";
  //   }

  //   if (!formData.quantity || formData.quantity < 0) {
  //     newErrors.quantity = "Valid quantity is required";
  //   }

  //   if (formData.cost > formData.price) {
  //     newErrors.price = "Price should be greater than cost";
  //   }
  //   setErrors(newErrors);
  //   return Object.values(newErrors).every((error) => error === "");
  // };

  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     if (file.size > 5 * 1024 * 1024) {
  //       setErrors({ ...errors, image: "Image size should be less than 5MB" });
  //       return;
  //     }

  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       if (typeof reader.result === "string") {
  //         setImagePreview(reader.result);
  //       }
  //       setErrors({ ...errors, image: null });
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };
  // const handleChange = (
  //   e: React.ChangeEvent<
  //     HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
  //   >,
  // ) => {
  //   const { name, value } = e.target;

  //   if (name === "tags") {
  //     setTagInput(value);
  //   } else
  //     setFormData((prev) => ({
  //       ...prev,
  //       [name]: value,
  //     }));
  //   if (!editingProduct) {
  //     setHasChanges(true);
  //   }

  //   // Clear error for this field
  //   if (errors[name as keyof Errors]) {
  //     setErrors({ ...errors, [name]: null });
  //   }
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

  //   if (!validateForm()) {
  //     return;
  //   }
  //   // Calculate final price after discounts
  //   const basePrice = formData.price;
  //   const percentDiscount = (basePrice * formData.discountPercent) / 100;
  //   const finalPrice = basePrice - percentDiscount - formData.flatDiscount;
  //   const tagsArray = tagInput
  //     .split(",")
  //     .map((tag) => tag.trim())
  //     .filter(Boolean);
  //   const productData = {
  //     ...(editingProduct ? editingProduct : {}),
  //     ...formData,
  //     flatDiscount: Number(formData.flatDiscount),
  //     discountPercent: Number(formData.discountPercent),
  //     tags: tagsArray,
  //     finalPrice: finalPrice,
  //     image: imagePreview ?? "",
  //     createdAt: new Date().toISOString(),
  //   };
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
  //     // Show success message
  //     setShowSuccess(true);
  //     setTimeout(() => setShowSuccess(false), 3000);

  //     // Reset form
  //     setFormData(initialFormData);
  //     setTagInput("");
  //     setImagePreview(null);
  //     setErrors(initialErrors);
  //   }
  // };

  // const handleCancel = () => {
  //   setFormData(initialFormData);
  //   setImagePreview(null);
  //   setErrors(initialErrors);
  // };
  const form = useForm<AddProductFormInput, unknown, AddProductFormOutput>({
    defaultValues: defaultValues,
    resolver: zodResolver(productSchema),
  });

  function onSubmit(data: AddProductFormOutput) {
    console.log(data);
  }
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "variants",
  });
  const rootErrors = form.formState.errors.variants?.root?.message;
  const errors = form.formState.errors.variants?.message;
  const {
    addProductsSelectOptions,
    getAddProductsSelectOptions,
    getAddProductVariantOptions,
    addProductVariantOptions,
  } = useAddProductStore();
  useEffect(() => {
    getAddProductsSelectOptions();
    getAddProductVariantOptions();
  }, []);
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {/* {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Product saved successfully!
            </span>
          </div>
        )} */}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Product Stock Management
              </h1>
              <p className="text-gray-600 mt-1">
                Add and manage inventory with detailed specifications
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Active Form
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Form Fields */}
              <div className="lg:col-span-2 space-y-8">
                {/* General Information Card */}
                <div className="bg-linear-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        General Information
                      </h2>
                      <p className="text-sm text-gray-500">
                        Basic product details
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Product Name */}
                    <div className="space-y-2">
                      <InputField
                        placeholder="Enter Product Name"
                        label="Product Name"
                        type="text"
                        name="name"
                        form={form}
                      />
                    </div>
                    {/* Product Unit */}
                    <div className="space-y-2">
                      <SelectOptions
                        options={addProductsSelectOptions.units}
                        label="Product Unit"
                        form={form}
                        name="unitId"
                      />
                    </div>
                    {/* Product Type */}
                    <div className="space-y-2">
                      <SelectOptions
                        options={productTypes}
                        label="Product Type"
                        form={form}
                        name="productType"
                      />
                    </div>

                    {/* Product Description */}
                    <div className="col-span-3">
                      <InputField
                        placeholder="Enter your message"
                        label="Product Description"
                        type="textArea"
                        name="description"
                        form={form}
                      />
                    </div>
                  </div>
                </div>

                {/* Stock Information Card */}

                <AccordionCard
                  form={form}
                  append={append}
                  replace={replace}
                  remove={remove}
                />
              </div>

              {/* Right Column - Image & Additional Info */}
              <div className="space-y-8">
                {/* More Information Card */}
                <div className="bg-linear-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Grid className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        More Information
                      </h2>
                      <p className="text-sm text-gray-500">
                        Additional product details
                      </p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    {/* image */}
                    <div className="space-y-2">
                      <InputFile
                        urlName={`imageUrl`}
                        fileName={`imageFile`}
                        form={form}
                        label="Default Image"
                      />
                    </div>
                    {/* Tracking Type */}
                    <div className="space-y-2">
                      <SelectOptions
                        options={trackingType}
                        label="Tracking Type"
                        form={form}
                        name="trackingType"
                      />
                    </div>
                    {/* status */}
                    <div className="space-y-2">
                      <SelectOptions
                        options={productStatus}
                        label="Status"
                        form={form}
                        name="status"
                      />
                    </div>
                    {/* inventoryOptions */}
                    <div className="space-y-2">
                      <InventorySourceSelector
                        form={form}
                        inventoryOptions={inventorySources}
                      />
                    </div>
                    {/* Supplier */}
                    <div className="space-y-2">
                      <SelectOptions
                        options={addProductsSelectOptions.suppliers}
                        label="Select a supplier"
                        form={form}
                        name="supplierId"
                      />
                    </div>

                    {/* Brand */}
                    <div className="space-y-2">
                      <SelectOptions
                        options={addProductsSelectOptions.brands}
                        label="Brand"
                        form={form}
                        name="brandId"
                      />
                    </div>

                    {/* Categories */}
                    <div className="space-y-2">
                      <SelectOptions
                        options={addProductsSelectOptions.categories}
                        label="Categories"
                        form={form}
                        name="categoryId"
                      />
                    </div>

                    {/* Tags */}
                    {/* <div className="space-y-2">
                      <InputField
                        placeholder="Add tags separated by commas"
                        label="Tags"
                        type="text"
                        name="tags"
                        form={form}
                      />
                    </div> */}
                  </div>
                </div>

                {/* Save Actions */}
                <div className="bg-linear-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button type="button" className=" px-4 py-3 ">
                      Cancel
                    </Button>
                    {false ? (
                      <Button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-green-700 "
                      >
                        <Save className="w-5 h-5" />
                        Update Product
                      </Button>
                    ) : (
                      <Button type="submit" className="flex-1 px-4 py-3 ">
                        <Save className="w-5 h-5" />
                        Save Product
                      </Button>
                    )}
                  </div>
                  {/* Check for both root.message and message to cover all states */}
                  {(rootErrors || errors) && (
                    <p className="text-sm font-medium text-destructive mt-2">
                      {rootErrors || errors}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 text-center mt-4">
                    All required fields are marked with{" "}
                    <span className="text-red-500">*</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductStockForm;
