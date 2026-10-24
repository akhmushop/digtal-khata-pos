import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  Download,
  Filter,
  RefreshCw,
  Grid3x3,
  List,
  Package2,
  Plus,
  X,
  Upload,
  Printer,
  Copy,
  Archive,
  Bell,
  TrendingUp,
  Tag,
  Users,
  MapPin,
  DollarSign,
  AlertCircle,
  Calendar,
  BarChart,
  Settings,
  FileText,
  ShoppingCart,
  Check,
  Minus,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [perPage, setPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductsTypes | null>(
    null,
  );
  const sales = useSalesStore((state) => state.sales);
  const setEditingProduct = useEditProductStore(
    (state) => state.setEditingProduct,
  );
  const products = useProductStore((state) => state.products);
  const variants = products.flatMap((product) => product.variants);
  console.log(variants.map((v) => v.purchaseCost));
  const removeProduct = useProductStore((state) => state.removeProduct);
  const updateStock = useProductStore((state) => state.updateStock);
  const duplicateProduct = useProductStore((state) => state.duplicateProduct);
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    priceMin: "",
    priceMax: "",
    supplier: "all",
    location: "all",
  });

  const [columnWidths, setColumnWidths] = useState({
    checkbox: 50,
    image: 80,
    name: 220,
    barcode: 130,
    category: 120,
    supplier: 130,
    price: 100,
    stock: 90,
    location: 110,
    status: 110,
    action: 100,
  });
  type Widths = keyof typeof columnWidths;
  const [resizing, setResizing] = useState<Resizing | null>(null);

  const [categories] = useState([
    "Electronics",
    "Accessories",
    "Furniture",
    "Office Supplies",
  ]);
  const [suppliers] = useState([
    "Tech Supply Co",
    "Cable Mart",
    "Office Plus",
    "Display World",
  ]);
  const [locations] = useState([
    "Warehouse A",
    "Warehouse B",
    "Store Front",
    "Online",
  ]);

  const handleMouseDown = (
    columnKey: Widths,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();
    setResizing({
      columnKey,
      startX: e.pageX,
      startWidth: columnWidths[columnKey],
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizing) return;
    const diff = e.pageX - resizing.startX;
    const newWidth = Math.max(50, resizing.startWidth + diff);
    setColumnWidths((prev) => ({ ...prev, [resizing.columnKey]: newWidth }));
  };

  const handleMouseUp = () => setResizing(null);

  useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [resizing]);

  const filteredProducts = useMemo<ProductType[]>(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(p.id).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filters.category === "all" || p.category === filters.category;
      const matchesStatus =
        filters.status === "all" || p.status === filters.status;
      const matchesSupplier =
        filters.supplier === "all" || p.supplier === filters.supplier;
      const matchesLocation =
        filters.location === "all" || p.location === filters.location;
      const matchesPriceMin =
        !filters.priceMin || p.price >= parseFloat(filters.priceMin);
      const matchesPriceMax =
        !filters.priceMax || p.price <= parseFloat(filters.priceMax);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesSupplier &&
        matchesLocation &&
        matchesPriceMin &&
        matchesPriceMax
      );
    });
  }, [products, searchTerm, filters]);
  const sortedProducts = useMemo(() => {
    let sorted = [...filteredProducts];
    const key = sortConfig.key;
    if (key === null) {
      return sorted;
    }
    if (key) {
      sorted.sort((a, b) => {
        if (a[key] < b[key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredProducts, sortConfig]);

  const requestSort = (key: keyof ProductsTypes) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const totalPages = Math.ceil(sortedProducts.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + perPage,
  );
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

  const totalValue = sales.reduce(
    (sum, p) => sum + p.price * p.soldQuantity,
    0,
  );
  const totalProfit = sales.reduce(
    (sum, p) => sum + (p.price - p.cost) * p.soldQuantity,
    0,
  );
  const toggleSelectProduct = (id: number) => {
    console.log(id);
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === paginatedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(paginatedProducts.map((p) => p.id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedProducts.length} products?`)) {
      selectedProducts.map((id) => {
        console.log(id);
        removeProduct(id);
      });

      setSelectedProducts([]);
      setShowBulkActions(false);
    }
  };

  const handleBulkExport = () => {
    const selectedData = products.filter((p) =>
      selectedProducts.includes(p.id),
    );
    console.log("Exporting:", selectedData);
    alert("Export functionality would download CSV here");
  };

  const openProductModal = (product = null) => {
    setCurrentProduct(product);
    // setShowProductModal(true);
  };

  const openStockModal = (product: ProductsTypes) => {
    setCurrentProduct(product);
    setShowStockModal(true);
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

  const totalSoldItems = sales.reduce(
    (sum, item) => sum + item.soldQuantity,
    0,
  );
  const totalRevenueByMonth = sales.reduce<Record<string, number>>(
    (acc, item) => {
      const date = new Date(item.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const revenue = item.price * item.soldQuantity;
      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }
      acc[monthKey] += revenue;
      return acc;
    },
    {},
  );
  const totalRevenueInArray = Object.entries(totalRevenueByMonth)
    .sort()
    .map(([month, total], index, arr) => {
      let percentageChange = null;
      if (index > 0) {
        const prevMonthRevenue = arr[index - 1]?.[1] ?? 0;
        percentageChange =
          ((total - prevMonthRevenue) / prevMonthRevenue) * 100;
      }
      return {
        month,
        total,
        percentageChange:
          percentageChange !== null
            ? (percentageChange > 0 ? "+" : "") +
              percentageChange.toFixed(2) +
              "%"
            : "N/A",
      };
    });
  const percentageChange = totalRevenueInArray.at(-1)?.percentageChange;

  //Avg. Turnover
  const totalInventory = products.reduce(
    (sum, p) => sum + (Number(p.quantity) || 0),
    0,
  );
  const saleDateRange = sales.reduce<{
    min: Date | null;
    max: Date | null;
  }>(
    (range, item) => {
      const date = new Date(item.createdAt);
      if (Number.isNaN(date.getTime())) return range;

      return {
        min: range.min ? (date < range.min ? date : range.min) : date,
        max: range.max ? (date > range.max ? date : range.max) : date,
      };
    },
    { min: null, max: null },
  );
  const salePeriodDays =
    saleDateRange.min && saleDateRange.max
      ? Math.max(
          1,
          (saleDateRange.max.getTime() - saleDateRange.min.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 1;
  const averageSalesPerDay =
    salePeriodDays > 0 ? totalSoldItems / salePeriodDays : 0;
  const averageTurnoverDays =
    averageSalesPerDay > 0 ? totalInventory / averageSalesPerDay : null;
  const handelClose = () => {
    setEditingProduct(null);
    setTimeout(() => setShowProductDetailsModal(false), 300);
    setIsOpen(false);
  };
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
