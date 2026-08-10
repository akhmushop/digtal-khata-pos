import React, { Fragment, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Package,
  AlertCircle,
  Tag,
  ShoppingBag,
  Grid,
  Hash,
  Percent,
  DollarSign,
  Building,
  Save,
  X,
  Image,
  Barcode,
  Layers,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { FaAnglesDown } from "react-icons/fa6";
import {
  useProductStore,
  useEditProductStore,
} from "../../store/useProductStore.js";
import { useLocation, useNavigate } from "react-router";
import { useBlocker } from "react-router";
import { ProductsTypes } from "../../types/products.types.js";
import { Errors, InitialFormData } from "../../types/addProduct.types.js";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field.js";
import { Input } from "@/components/ui/input.js";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const form = useForm();

  function onSubmit(data) {
    console.log(data);
  }
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const handleOnChange = (e) => {
    const { value, name } = e.target;
    console.log(value);
  };
  const productUnits = [
    { label: "Select Unit", value: null },
    { label: "PC", value: "pc" },
    { label: "KG", value: "kg" },
    { label: "L", value: "l" },
    { label: "M", value: "m" },
    { label: "SET", value: "set" },
    { label: "BOX", value: "box" },
    { label: "DOZEN", value: "dozen" },
  ];
  const categories = [
    { label: "Select Categories", value: null },
    { label: "Electronics", value: "electronics" },
    { label: "Clothing", value: "clothing" },
    { label: "Sports", value: "sports" },
    { label: "Shoe", value: "shoe" },
  ];
  const brands = [
    { label: "Select Brands", value: null },
    { label: "Samsung", value: "samsung" },
    { label: "Walton", value: "walton" },
    { label: "Lotto", value: "lotto" },
    { label: "Iphone", value: "iphone" },
  ];
  const productTypes = [
    { label: "Select Product Type", value: null },
    { label: "Physical", value: "physical" },
    { label: "Service", value: "service" },
    { label: "Digital", value: "digital" },
  ];
  const trackingType = [
    { label: "Select Tracking Type", value: null },
    { label: "None", value: "none" },
    { label: "Batch", value: "batch" },
    { label: "Serial", value: "serial" },
  ];
  const suppliers = [
    { label: "Select Suppliers", value: null },
    { label: "Global Suppliers Inc.", value: "global-suppliers-inc" },
    { label: "Premium Goods Co", value: "premium-goods-co" },
    { label: "Tech Importers Ltd", value: "tech-importers-ltd" },
    { label: "Quality Merchants LLC", value: "quality-merchants-llc" },
  ];
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
                        options={productUnits}
                        label="Product Unit"
                        form={form}
                        name="productUnit"
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
                    <div className="col-span-3">
                      <InputField
                        placeholder="Enter your message"
                        label="Product Description"
                        type="textArea"
                        name="productDescription"
                        form={form}
                      />
                    </div>
                  </div>
                  {/* Description Card */}
                </div>

                {/* Stock Information Card */}

                <AccordionCard form={form} />
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
                    {/* Supplier */}
                    <div className="space-y-2">
                      <SelectOptions
                        options={suppliers}
                        label="Select a supplier"
                        form={form}
                        name="supplier"
                      />
                    </div>

                    {/* Brand */}
                    <div className="space-y-2">
                      <SelectOptions
                        options={brands}
                        label="Brand"
                        form={form}
                        name="brand"
                      />
                    </div>

                    {/* Categories */}
                    <div className="space-y-2">
                      <SelectOptions
                        options={categories}
                        label="Categories"
                        form={form}
                        name="categories"
                      />
                    </div>
                    <div className="space-y-2">
                      <SelectOptions
                        options={trackingType}
                        label="Tracking Type"
                        form={form}
                        name="trackingType"
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
                      <Button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-green-700 "
                      >
                        <Save className="w-5 h-5" />
                        Save Product
                      </Button>
                    )}
                  </div>
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
const SelectOptions = ({ options, label, form, name }) => {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          <Select
            items={options}
            name={field.name}
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              id={field.name}
              aria-invalid={fieldState.invalid}
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {options.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      )}
    />
  );
};
function InputField({ placeholder, label, type, name, form }) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          {type === "number" && (
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>$</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id={field.name}
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder={placeholder}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>USD</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          )}
          {type === "text" && (
            <Input
              id={field.name}
              {...field}
              aria-invalid={fieldState.invalid}
              placeholder={placeholder}
            />
          )}
          {type === "textArea" && (
            <InputGroup>
              <InputGroupTextarea
                id={field.name}
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder={placeholder}
              />
              <InputGroupAddon align="block-end">
                <InputGroupText className="text-xs text-muted-foreground">
                  {120 - (field.value?.length || 0)} characters left
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          )}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
export function DatePickerSimple({ form, index }) {
  return (
    <Controller
      name={`variants.${index}.expiryDate`}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>Expiry Date</FieldLabel>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  id={field.name}
                  className="justify-start font-normal"
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                defaultMonth={field.value ?? new Date()}
              />
            </PopoverContent>
          </Popover>
        </Field>
      )}
    />
  );
}
const productInfoInput = (form, index) => {
  const hasVariants = form.watch("hasVariants");
  const status = [
    { label: "Select Status", value: null },
    { value: "inActive", label: "Inactive" },
    { value: "active", label: "Active" },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {" "}
      <div className="space-y-2">
        <InputField
          placeholder="0.00"
          label="Purchase Price"
          type="number"
          name={`variants.${index}.purchasePrice`}
          form={form}
        />
      </div>
      {/* Price */}
      <div className="space-y-2">
        <InputField
          placeholder="0.00"
          label="Selling Price"
          type="number"
          name={`variants.${index}.sellingPrice`}
          form={form}
        />
      </div>
      {/*WholeSale Price */}
      {/* <div className="space-y-2">
      <InputField
        placeholder="0.00"
        label="WholeSale Price"
        type="number"
        name={`variants.${index}.wholeSalePrice`}
        form={form}
      />
    </div> */}
      {/* Quantity */}
      <div className="space-y-2">
        <InputField
          placeholder="0.00"
          label="Quantity"
          type="number"
          name={`variants.${index}.quantity`}
          form={form}
        />
      </div>
      {/* Alert Quantity */}
      <div className="space-y-2">
        <InputField
          placeholder="0.00"
          label="Alert Quantity"
          type="number"
          name={`variants.${index}.alertQuantity`}
          form={form}
        />
      </div>
      {/* Barcode */}
      <div className="space-y-2">
        <InputField
          placeholder="Enter Barcode"
          label="Barcode"
          type="text"
          name={`variants.${index}.barcode`}
          form={form}
        />
      </div>
      {/* Batch Number */}
      <div className="space-y-2">
        <InputField
          placeholder="Enter Batch Number"
          label="Batch Number"
          type="text"
          name={`variants.${index}.batchNumber`}
          form={form}
        />
      </div>
      {/* Expiry Date */}
      <div className="space-y-2">
        <DatePickerSimple form={form} index={index} />
      </div>
      <div className="space-y-2">
        <InputFile name="image" form={form} label="Image" />
      </div>
      <div className="space-y-2">
        <SelectOptions
          options={status}
          label="Status"
          form={form}
          name={hasVariants ? `variants.${index}.status` : "status"}
        />
      </div>
    </div>
  );
};

export function AccordionCard({ form }) {
  const hasVariants = form.watch("hasVariants");
  const items = [
    {
      value: "inventory",
      trigger: "Stock & Pricing",
      content: productInfoInput,
    },
    {
      value: "serial",
      trigger: "Add Serial",
      content:
        "Billing occurs automatically at the start of each billing cycle. We accept all major credit cards, PayPal, and ACH transfers for enterprise customers. You'll receive an invoice via email after each payment.",
    },
  ];
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex gap-2 justify-between">
            <ShoppingBag className="w-5 h-5 text-green-600" />
            <CardTitle>Variants</CardTitle>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Controller
                name="hasVariants"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Switch
                    id="has-variants"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />

              <Label htmlFor="has-variants">Has Variants</Label>
            </div>
          </div>
        </div>
        <CardDescription>Inventory and pricing details</CardDescription>
      </CardHeader>
      <CardContent>
        {hasVariants ? (
          <div>
            <ComboboxBasic />
            <VariantRow form={form} />
          </div>
        ) : (
          <Accordion defaultValue={["inventory"]}>
            {items.map((item, index) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger>{item.trigger}</AccordionTrigger>
                <AccordionContent>
                  {typeof item.content === "function"
                    ? item.content(form, index)
                    : item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
const variants = ["Shoe", "Fashion", "Nuxt.js", "Remix", "Astro"] as const;
const shoe = [
  { type: "color", value: "red" },
  { type: "color", value: "black" },
  { type: "color", value: "white" },
  { type: "size", value: "40" },
  { type: "size", value: "41" },
  { type: "size", value: "42" },
];
const colors = shoe.filter((v) => v.type === "color").map((v) => v.value);

const sizes = shoe.filter((v) => v.type === "size").map((v) => v.value);

const allVariants = colors.flatMap((color) =>
  sizes.map((size) => ({
    color,
    size,
  })),
);
export function ComboboxBasic() {
  return (
    <Combobox
      items={variants}
      onValueChange={(value) => {
        console.log(value);
      }}
    >
      <ComboboxInput placeholder="Select a Variant" showClear />
      <ComboboxContent>
        <ComboboxEmpty>No Variant found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
export function VariantRow({ form }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const variants = form.watch("variants") || [];
  const defaultIndex = variants.findIndex(
    (variant) => variant?.isDefault === true,
  );
  const handleDefaultChange = (value: string) => {
    const selectedIndex = Number(value);

    variants.forEach((_, index) => {
      form.setValue(`variants.${index}.isDefault`, index === selectedIndex);
    });
  };
  return (
    <RadioGroup
      className="contents"
      value={defaultIndex === -1 ? "" : String(defaultIndex)}
      onValueChange={handleDefaultChange}
    >
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%]">Default</TableHead>
            <TableHead className="w-[25%]">Color</TableHead>
            <TableHead className="w-[25%]">Size</TableHead>
            <TableHead className="w-[5%]">Add Product</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allVariants.map((variant, index) => {
            const id = `${variant.color}-${variant.size}`;
            const radioId = `radio-${id}`;
            return (
              <Fragment key={id}>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={String(index)} id={radioId} />
                      <Label htmlFor={radioId}>Default</Label>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {variant.color.charAt(0).toUpperCase() +
                      variant.color.slice(1)}
                  </TableCell>
                  <TableCell>{variant.size}</TableCell>
                  <TableCell className=" flex justify-end">
                    <FaAnglesDown
                      onClick={() => {
                        setExpanded(expanded === id ? null : id);
                        form.setValue(
                          `variants.${index}.options.color`,
                          variant.color,
                        );
                        form.setValue(
                          `variants.${index}.options.size`,
                          variant.size,
                        );
                      }}
                      className={`cursor-pointer size-5 transition-transform duration-300   ${expanded === id ? "rotate-180" : "rotate-0"}`}
                    />
                  </TableCell>
                </TableRow>
                {expanded === id && (
                  <TableRow>
                    <TableCell className="py-5" colSpan={4}>
                      {productInfoInput(form, index)}
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </RadioGroup>
  );
}
export function InputFile({ name, form, label }) {
  const [addUrl, setAddUrl] = useState(false);

  return (
    <Field data-invalid={form.formState.errors[name]?.invalid}>
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        <div className="flex items-center space-x-2">
          <Switch
            id="add-url"
            checked={addUrl}
            onCheckedChange={(e) => {
              setAddUrl(e);
              form.setValue(name, null);
              form.clearErrors(name);
            }}
          />
          <Label htmlFor="add-url" className="cursor-pointer">
            Add url
          </Label>
        </div>
      </div>

      <Controller
        name={name}
        control={form.control}
        render={({ field, fieldState }) => (
          <>
            {addUrl ? (
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>https://</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id={field.name}
                  {...field}
                  placeholder="example.com"
                  className="pl-0.5!"
                />
              </InputGroup>
            ) : (
              <Input
                id={field.name}
                name={field.name}
                onBlur={field.onBlur}
                type="file"
                ref={field.ref}
                onChange={(e) => {
                  field.onChange(e.target.files);
                }}
              />
            )}
          </>
        )}
      />
    </Field>
  );
}
export default ProductStockForm;
