import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
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
  Calendar,
  Building,
  Save,
  X,
  Image,
  Barcode,
  Layers,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import {
  useProductStore,
  useEditProductStore,
} from "../../store/product-store.js";
import { useLocation, useNavigate } from "react-router";
import { useBlocker } from "react-router";
import { ProductsTypes } from "../../types/products-types.js";
import { Errors, InitialFormData } from "../../types/addProduct-types.js";

const ProductStockForm = () => {
  const editingProduct = useEditProductStore((state) => state.editingProduct);
  const [imagePreview, setImagePreview] = useState<string | null>(
    editingProduct?.image ?? null,
  );
  const initialErrors: Errors = {
    barcode: "",
    productName: "",
    cost: "",
    price: "",
    quantity: "",
    image: "",
  };
  const [errors, setErrors] = useState(initialErrors);
  const [showSuccess, setShowSuccess] = useState(false);
  const addToProduct = useProductStore((state) => state.addToProduct);
  const updateProduct = useProductStore((state) => state.updateProduct);
  const setEditingProduct = useEditProductStore(
    (state) => state.setEditingProduct,
  );
  const initialFormData: InitialFormData = editingProduct
    ? {
        barcode: editingProduct.barcode,
        productName: editingProduct.productName,
        productUnit: editingProduct.productUnit,
        productType: editingProduct.productType,
        alertQuantity: editingProduct.alertQuantity,
        cost: editingProduct.cost,
        price: editingProduct.price,
        quantity: editingProduct.quantity,
        discountPercent: editingProduct.discountPercent,
        flatDiscount: editingProduct.flatDiscount,
        batchNumber: editingProduct.batchNumber,
        expiryDate: editingProduct.expiryDate || "",
        description: editingProduct.description,
        supplier: editingProduct.supplier,
        brand: editingProduct.brand,
        category: editingProduct.category,
        tags: editingProduct.tags,
      }
    : {
        barcode: "",
        productName: "",
        productUnit: "PC",
        productType: "SIMPLE",
        alertQuantity: 0,
        cost: 0,
        price: 0,
        quantity: 0,
        discountPercent: 0,
        flatDiscount: 0,
        batchNumber: "",
        expiryDate: "",
        description: "",
        supplier: "",
        brand: "",
        category: "",
        tags: [],
      };
  const [hasChanges, setHasChanges] = useState(false);

  const useUnsavedChanges = (hasChanges: boolean) => {
    useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (hasChanges) {
          e.preventDefault();
          e.returnValue = "You have unsave changes. Leave anyway?";
        }
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () =>
        window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [handleChange]);
  };

  const [formData, setFormData] = useState(initialFormData);

  const [tagInput, setTagInput] = useState(
    editingProduct?.tags?.join(", ") ?? "",
  );
  const validateForm = () => {
    const newErrors = initialErrors;

    if (!formData.barcode.trim()) {
      newErrors.barcode = "Barcode is required";
    }

    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required";
    }

    if (!formData.cost || formData.cost <= 0) {
      newErrors.cost = "Valid cost is required";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.quantity || formData.quantity < 0) {
      newErrors.quantity = "Valid quantity is required";
    }

    if (formData.cost > formData.price) {
      newErrors.price = "Price should be greater than cost";
    }
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: "Image size should be less than 5MB" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImagePreview(reader.result);
        }
        setErrors({ ...errors, image: null });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "tags") {
      setTagInput(value);
    } else
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    if (!editingProduct) {
      setHasChanges(true);
    }

    // Clear error for this field
    if (errors[name as keyof Errors]) {
      setErrors({ ...errors, [name]: null });
    }
  };
  useUnsavedChanges(hasChanges);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    return hasChanges && currentLocation.pathname !== nextLocation.pathname;
  });
  useEffect(() => {
    if (blocker.state === "blocked") {
      const userWantsToLeave = window.confirm(
        "You have unsave changes. Leave anyway?",
      );
      if (userWantsToLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/product";
  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    // Calculate final price after discounts
    const basePrice = formData.price;
    const percentDiscount = (basePrice * formData.discountPercent) / 100;
    const finalPrice = basePrice - percentDiscount - formData.flatDiscount;
    const tagsArray = tagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const productData = {
      ...(editingProduct ? editingProduct : {}),
      ...formData,
      flatDiscount: Number(formData.flatDiscount),
      discountPercent: Number(formData.discountPercent),
      tags: tagsArray,
      finalPrice: finalPrice,
      image: imagePreview ?? "",
      createdAt: new Date().toISOString(),
    };

    if (editingProduct) {
      type ProductKey = keyof ProductsTypes;
      const changed: Partial<ProductsTypes> = {};

      (Object.keys(productData) as ProductKey[]).forEach((key) => {
        const oldVal = editingProduct[key];
        const newVal = productData[key];
        if (oldVal !== newVal) {
          (changed as Record<ProductKey, unknown>)[key] = newVal;
        }
      });
      if (Object.keys(changed).length === 0) {
        alert("Nothing Changed");
        return;
      }

      if (window.confirm("Do you want to update this product")) {
        setEditingProduct(null);
        navigate(from, {
          state: {
            updated: true,
            productId: editingProduct.id,
            timestamp: Date.now(),
          },
          replace: true,
        });
      }
      updateProduct(editingProduct.id, changed);
    } else {
      addToProduct(productData);
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Reset form
      setFormData(initialFormData);
      setTagInput("");
      setImagePreview(null);
      setErrors(initialErrors);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setImagePreview(null);
    setErrors(initialErrors);
  };
  const productUnits = ["PC", "KG", "L", "M", "SET", "BOX", "DOZEN"];
  const productTypes = ["SIMPLE", "VARIABLE", "DIGITAL", "BUNDLE"];
  const suppliers = [
    "Global Suppliers Inc.",
    "Premium Goods Co.",
    "Tech Importers Ltd.",
    "Quality Merchants LLC",
  ];
  const categories = [
    "Electronics",
    "Clothing",
    "Home & Garden",
    "Sports",
    "Beauty",
    "Food & Beverage",
    "Automotive",
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Product saved successfully!
            </span>
          </div>
        )}

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
          onSubmit={handleSubmit}
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
                    {/* Barcode */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Barcode className="w-4 h-4" />
                        Barcode <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="barcode"
                          value={formData.barcode}
                          onChange={handleChange}
                          placeholder="Enter barcode"
                          className={`w-full px-4 py-3 pl-10 bg-white border ${
                            errors.barcode
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        />
                        <Hash className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      </div>
                      {errors.barcode && (
                        <p className="text-xs text-red-500">{errors.barcode}</p>
                      )}
                    </div>

                    {/* Product Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        placeholder="Enter product name"
                        className={`w-full px-4 py-3 bg-white border ${
                          errors.productName
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      />
                      {errors.productName && (
                        <p className="text-xs text-red-500">
                          {errors.productName}
                        </p>
                      )}
                    </div>

                    {/* Product Unit */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Product Unit
                      </label>
                      <div className="relative">
                        <select
                          name="productUnit"
                          value={formData.productUnit}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          {productUnits.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Product Type */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Product Type
                      </label>
                      <div className="relative">
                        <select
                          name="productType"
                          value={formData.productType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          {productTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <Layers className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Alert Quantity */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Alert Quantity
                      </label>
                      <input
                        type="number"
                        name="alertQuantity"
                        value={formData.alertQuantity}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Stock Information Card */}
                <div className="bg-linear-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <ShoppingBag className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        Stock & Pricing
                      </h2>
                      <p className="text-sm text-gray-500">
                        Inventory and pricing details
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Cost */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Cost <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="cost"
                          value={formData.cost}
                          onChange={handleChange}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className={`w-full px-4 py-3 pl-10 bg-white border ${
                            errors.cost ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        />
                      </div>
                      {errors.cost && (
                        <p className="text-xs text-red-500">{errors.cost}</p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className={`w-full px-4 py-3 pl-10 bg-white border ${
                            errors.price ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        />
                      </div>
                      {errors.price && (
                        <p className="text-xs text-red-500">{errors.price}</p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        className={`w-full px-4 py-3 bg-white border ${
                          errors.quantity ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      />
                      {errors.quantity && (
                        <p className="text-xs text-red-500">
                          {errors.quantity}
                        </p>
                      )}
                    </div>

                    {/* Discount % */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Percent className="w-4 h-4 text-purple-500" />
                        Discount %
                      </label>
                      <input
                        type="number"
                        name="discountPercent"
                        value={formData.discountPercent}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Flat Discount */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Flat Discount
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="flatDiscount"
                          value={formData.flatDiscount}
                          onChange={handleChange}
                          step="0.01"
                          min="0"
                          className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Final Price Display */}
                    {formData.price && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Final Price
                        </label>
                        <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg font-semibold text-green-700">
                          $
                          {formData.price ||
                            0 -
                              (formData.price ||
                                0 * formData.discountPercent ||
                                0) /
                                100 -
                              formData.flatDiscount ||
                            0}
                        </div>
                      </div>
                    )}

                    {/* Batch Number */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Batch #
                      </label>
                      <input
                        type="text"
                        name="batchNumber"
                        value={formData.batchNumber}
                        onChange={handleChange}
                        placeholder="Enter batch number"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Description Card */}
                <div className="bg-linear-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Product Description
                  </h2>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter detailed product description..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              {/* Right Column - Image & Additional Info */}
              <div className="space-y-8">
                {/* Manage Stock Card */}
                <div className="bg-linear-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-green-700 bg-linear-to-r from-green-50 to-emerald-50 py-3 rounded-xl border border-green-100">
                      MANAGE STOCK
                    </h2>
                  </div>

                  {/* Image Upload Area */}
                  <div className="mb-6">
                    <div
                      className={`border-2 border-dashed ${
                        imagePreview
                          ? "border-green-300 bg-green-50"
                          : errors.image
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                      } rounded-xl p-8 transition-all duration-300 cursor-pointer hover:border-green-400`}
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      <input
                        type="file"
                        id="file-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />

                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Product preview"
                            className="mx-auto max-h-64 object-contain rounded-lg shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImagePreview(null);
                            }}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                            <Image className="w-10 h-10 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Upload Product Image
                          </p>
                          <p className="text-xs text-gray-500">
                            Click or drag to upload (Max 5MB)
                          </p>
                        </div>
                      )}
                    </div>
                    {errors.image && (
                      <p className="text-xs text-red-500 mt-2">
                        {errors.image}
                      </p>
                    )}
                  </div>

                  {/* Upload Button */}
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                    className="w-full px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Product Image
                  </button>
                </div>

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
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        Select a supplier
                      </label>
                      <div className="relative">
                        <select
                          name="supplier"
                          value={formData.supplier}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          <option value="">Select a supplier...</option>
                          {suppliers.map((supplier, index) => (
                            <option key={index} value={supplier}>
                              {supplier}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Brand */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Brand
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        placeholder="Enter brand name"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Categories */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Categories
                      </label>
                      <div className="relative">
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          <option value="">Select category...</option>
                          {categories.map((category, index) => (
                            <option key={index} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        Tags
                      </label>
                      <input
                        type="text"
                        name="tags"
                        value={tagInput}
                        onChange={handleChange}
                        placeholder="Add tags separated by commas"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Actions */}
                <div className="bg-linear-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                    {editingProduct ? (
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
                      >
                        <Save className="w-5 h-5" />
                        Update Product
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
                      >
                        <Save className="w-5 h-5" />
                        Save Product
                      </button>
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

        {/* Footer Status */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
              Form ready • Fill in the required fields to save
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductStockForm;
