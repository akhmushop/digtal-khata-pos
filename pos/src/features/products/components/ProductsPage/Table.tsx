import React, { useState, useMemo, useEffect } from "react";
import { Link, useParams } from "react-router";
import {
  Download,
  Package2,
  Plus,
  Upload,
  Bell,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Resizing, SortConfig } from "@/types/table.types";
import { useSalesStore } from "@/features/pos/stores/useSalesStore";
import { ProductsTypes } from "../../products.types";
import { useEditProductStore } from "../../usedashboardProductStore";
import useProductStore from "../../useProductStore";
import { ProductType } from "../../product.schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductStats } from "../../utils/calculateProductStats";

const AdvancedPOSTable = ({ stats }: { stats: ProductStats }) => {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const products = useProductStore((state) => state.products);
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Low Stock":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Out of Stock":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleBulkExport = () => {
    const selectedData = products.filter((p) =>
      selectedProducts.includes(p.id),
    );
    console.log("Exporting:", selectedData);
    alert("Export functionality would download CSV here");
  };

  // const handleSaveProduct = (productData) => {
  //   if (currentProduct) {
  //     setProducts(
  //       products.map((p) =>
  //         p.id === currentProduct.id ? { ...p, ...productData } : p,
  //       ),
  //     );
  //   } else {
  //     setProducts([...products, { ...productData, id: Date.now() }]);
  //   }
  //   // setShowProductModal(false);
  // };
  // const duplicateProduct = (product) => {
  //   const newProduct = {
  //     ...product,
  //     id: Date.now(),
  //     name: `${product.name} (Copy)`,
  //     barcode: `${product.barcode}-COPY`,
  //   };
  //   setProducts([...products, newProduct]);
  // };
  // total sold
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <div>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your product catalog and pricing.
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium text-slate-700">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={handleBulkExport}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium text-slate-700"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link to={"addproduct"}>
            <button className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Cards */}
        <StatsCards stats={stats} />
      </CardContent>
    </Card>
  );
};
const ShowProductDetails = ({ handelClose }: { handelClose: () => void }) => {
  const detailsProduct = useEditProductStore((state) => state.editingProduct);
  return (
    <div className="relative w-130  bg-white shadow-md overflow-hidden rounded-b-lg">
      <div className="bg-rose-700 px-4 py-2 flex justify-between items-center ">
        <h2 className="text-white font-semibold text-lg">Product Details</h2>
        <button
          onClick={handelClose}
          className="text-white hover:bg-rose-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {detailsProduct && (
        <div className="p-4 space-y-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">Barcode:</span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.barcode}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Product Name:
              </span>
              <span className="text-gray-600 flex-1 wrap-break-word">
                {detailsProduct.productName}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Product Unit:
              </span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.productUnit}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Product Type:
              </span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.productType}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Alert Quantity:
              </span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.alertQuantity}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">Cost:</span>
              <span className="text-green-600 font-medium flex-1">
                ${detailsProduct.cost}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">Price:</span>
              <span className="text-green-600 font-medium flex-1">
                ${detailsProduct.price}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Quantity:
              </span>
              <span
                className={`flex-1 ${detailsProduct.quantity < detailsProduct.alertQuantity ? "text-red-600 font-semibold" : "text-gray-600"}`}
              >
                {detailsProduct.quantity}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Discount:
              </span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.discountPercent > 0 &&
                  `${detailsProduct.discountPercent}%`}
                {detailsProduct.discountPercent > 0 &&
                  detailsProduct.flatDiscount > 0 &&
                  " / "}
                {detailsProduct.flatDiscount > 0 &&
                  `$${detailsProduct.flatDiscount} flat`}
                {detailsProduct.discountPercent === 0 &&
                  detailsProduct.flatDiscount === 0 &&
                  "No discount"}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Batch Number:
              </span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.batchNumber}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Expiry Date:
              </span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.expiryDate || "N/A"}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Supplier:
              </span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.supplier}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">Brand:</span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.brand}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Category:
              </span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.category}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">Tags:</span>
              <span className="text-gray-600 flex-1 wrap-break-word">
                {detailsProduct.tags?.join(", ")}
              </span>
            </div>

            <div className="col-span-2 flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Description:
              </span>
              <span className="text-gray-600 flex-1 wrap-break-word">
                {detailsProduct.description}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
function StatsCards({ stats }: { stats: ProductStats }) {
  const products = useProductStore((state) => state.products);
  const variants = products.flatMap((product) => product.variants);
  const lowStockCount = variants.filter(
    (p) => p.quantity > 0 && p.quantity <= p.alertQuantity,
  ).length;
  const outOfStockCount = variants.filter((p) => p.quantity === 0).length;

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-500">
            Total Products
          </span>
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Package2 className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.totalProducts}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {stats.totalVariants} Variants
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-500">
            Total Value
          </span>
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          ${stats.inventoryValue}
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-500">
            Low Stock Alerts
          </span>
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.lowStockCount}
        </div>
        <div className="text-xs text-amber-600 mt-1">Requires attention</div>
      </div>
      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-500">
            Out of Stock
          </span>
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-red-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.outOfStockCount}
        </div>
        <div className="text-xs text-red-600 mt-1">Needs reorder</div>
      </div>
      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-500">
            Retail Value
          </span>
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          ${stats.retailValue}
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-500">
            Potential Margin
          </span>
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          ${stats.potentialMargin}
        </div>
      </div>
    </div>
  );
}
export default AdvancedPOSTable;
