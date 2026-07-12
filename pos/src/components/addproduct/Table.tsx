import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
import { useSoldStore } from "../../store/sold-store.js";
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
import {
  useProductStore,
  useEditProductStore,
} from "../../store/product-store.js";
import { PopupModal } from "../pos/CartItems.js";
import { Resizing, SortConfig } from "../../types/table-types.js";
import { ProductsTypes } from "../../types/products-types.js";
import { SalesStoreType } from "../../types/sales-types.js";
const AdvancedPOSTable = () => {
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
  const soldProducts = useSoldStore((state) => state.soldProducts);
  const setEditingProduct = useEditProductStore(
    (state) => state.setEditingProduct,
  );
  const products = useProductStore((state) => state.products);
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

  const filteredProducts = useMemo<ProductsTypes[]>(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const totalValue = soldProducts.reduce(
    (sum, p) => sum + p.price * p.soldQuantity,
    0,
  );
  const totalProfit = soldProducts.reduce(
    (sum, p) => sum + (p.price - p.cost) * p.soldQuantity,
    0,
  );
  const lowStockCount = products.filter(
    (p) => p.quantity > 0 && p.quantity <= p.alertQuantity,
  ).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;

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

  const totalSoldItems = soldProducts.reduce(
    (sum, item) => sum + item.soldQuantity,
    0,
  );
  const totalRevenueByMonth = soldProducts.reduce<Record<string, number>>(
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
  const saleDateRange = soldProducts.reduce<{
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
    <div className="h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6 overflow-y-scroll">
      {showProductDetailsModal && (
        <PopupModal className={""} isOpen={isOpen} handelClose={handelClose}>
          <ShowProductDetails handelClose={handelClose} />
        </PopupModal>
      )}

      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">
                Advanced POS System
              </h1>
              <p className="text-slate-500">
                Complete inventory management solution
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium text-slate-700"
              >
                <BarChart className="w-4 h-4" />
                Analytics
              </button>
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
          </div>

          {/* Analytics Panel */}
          {showAnalytics && (
            <div className="mb-6 bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Analytics Overview
                </h2>
                <button onClick={() => setShowAnalytics(false)}>
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">
                      Total Revenue
                    </span>
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    ${totalValue.toFixed(2)}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {percentageChange} from last month
                  </div>
                </div>
                <div className="bg-linear-to-br from-emerald-50 to-emerald-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-emerald-700">
                      Total Profit
                    </span>
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-900">
                    ${totalProfit.toFixed(2)}
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">
                    Margin: {((totalProfit / totalValue) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-700">
                      Total Sales
                    </span>
                    <ShoppingCart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {totalSoldItems}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    Units sold this month
                  </div>
                </div>
                <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-700">
                      Avg. Turnover
                    </span>
                    <RefreshCw className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {averageTurnoverDays
                      ? averageTurnoverDays.toFixed(1)
                      : "N/A"}{" "}
                    Days
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    Estimated days to move current stock
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
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
                {products.length}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {filteredProducts.length} filtered
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
                ${totalValue.toFixed(2)}
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
                {lowStockCount}
              </div>
              <div className="text-xs text-amber-600 mt-1">
                Requires attention
              </div>
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
                {outOfStockCount}
              </div>
              <div className="text-xs text-red-600 mt-1">Needs reorder</div>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedProducts.length > 0 && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedProducts.length} product
                  {selectedProducts.length > 1 ? "s" : ""} selected
                </span>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 text-sm text-blue-700 flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Bulk Edit
                </button>
                <button
                  onClick={handleBulkExport}
                  className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 text-sm text-blue-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 text-sm text-blue-700 flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  Print Labels
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products, barcodes, tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2.5 border rounded-lg transition-colors ${showFilters ? "bg-blue-50 border-blue-200 text-blue-600" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <Filter className="w-5 h-5" />
                </button>
                <button className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <RefreshCw className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 border rounded-lg transition-colors ${viewMode === "grid" ? "bg-blue-50 border-blue-200 text-blue-600" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 border rounded-lg transition-colors ${viewMode === "list" ? "bg-blue-50 border-blue-200 text-blue-600" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="pt-4 border-t border-slate-200">
                <div className="grid grid-cols-6 gap-3">
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                  <select
                    value={filters.supplier}
                    onChange={(e) =>
                      setFilters({ ...filters, supplier: e.target.value })
                    }
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Suppliers</option>
                    {suppliers.map((sup) => (
                      <option key={sup} value={sup}>
                        {sup}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({ ...filters, location: e.target.value })
                    }
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Locations</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.priceMin}
                    onChange={(e) =>
                      setFilters({ ...filters, priceMin: e.target.value })
                    }
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.priceMax}
                    onChange={(e) =>
                      setFilters({ ...filters, priceMax: e.target.value })
                    }
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() =>
                    setFilters({
                      category: "all",
                      status: "all",
                      priceMin: "",
                      priceMax: "",
                      supplier: "all",
                      location: "all",
                    })
                  }
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ tableLayout: "fixed" }}>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th
                    className="px-4 py-4 text-left"
                    style={{ width: `${columnWidths.checkbox}px` }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.length === paginatedProducts.length &&
                        paginatedProducts.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left relative"
                    style={{ width: `${columnWidths.image}px` }}
                  >
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Image
                    </span>
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400"
                      onMouseDown={(e) => handleMouseDown("image", e)}
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left relative"
                    style={{ width: `${columnWidths.name}px` }}
                  >
                    <button
                      onClick={() => requestSort("productName")}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900"
                    >
                      Product Name
                      {sortConfig.key === "productName" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        ))}
                    </button>
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400"
                      onMouseDown={(e) => handleMouseDown("name", e)}
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left relative"
                    style={{ width: `${columnWidths.barcode}px` }}
                  >
                    <button
                      onClick={() => requestSort("barcode")}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900"
                    >
                      Barcode
                      {sortConfig.key === "barcode" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        ))}
                    </button>
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400"
                      onMouseDown={(e) => handleMouseDown("barcode", e)}
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left relative"
                    style={{ width: `${columnWidths.category}px` }}
                  >
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Category
                    </span>
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400"
                      onMouseDown={(e) => handleMouseDown("category", e)}
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left relative"
                    style={{ width: `${columnWidths.supplier}px` }}
                  >
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Supplier
                    </span>
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400"
                      onMouseDown={(e) => handleMouseDown("supplier", e)}
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left relative"
                    style={{ width: `${columnWidths.price}px` }}
                  >
                    <button
                      onClick={() => requestSort("price")}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900"
                    >
                      Price
                      {sortConfig.key === "price" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        ))}
                    </button>
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400"
                      onMouseDown={(e) => handleMouseDown("price", e)}
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left relative"
                    style={{ width: `${columnWidths.stock}px` }}
                  >
                    <button
                      onClick={() => requestSort("quantity")}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900"
                    >
                      Stock
                      {sortConfig.key === "quantity" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        ))}
                    </button>
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400"
                      onMouseDown={(e) => handleMouseDown("stock", e)}
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left relative"
                    style={{ width: `${columnWidths.location}px` }}
                  >
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Location
                    </span>
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400"
                      onMouseDown={(e) => handleMouseDown("location", e)}
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left relative"
                    style={{ width: `${columnWidths.status}px` }}
                  >
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </span>
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400"
                      onMouseDown={(e) => handleMouseDown("status", e)}
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-center"
                    style={{ width: `${columnWidths.action}px` }}
                  >
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-slate-50 transition-colors ${selectedProducts.includes(product.id) ? "bg-blue-50" : ""}`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="">
                        {/* <Package2 className="w-6 h-6 text-slate-400" /> */}
                        <img
                          className="w-12 h-12 bg-linear-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center "
                          src={product.image || undefined}
                          alt=""
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 truncate">
                      <div className="font-semibold text-slate-900 truncate">
                        {product.productName}
                      </div>

                      <div className="flex gap-1 mt-1">
                        {product.tags?.length ? (
                          product.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-600"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                            No Tags
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 truncate">
                      <span className="text-sm text-slate-600 font-mono">
                        {product.barcode}
                      </span>
                    </td>
                    <td className="px-4 py-4 truncate">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 truncate">
                      <span className="text-sm text-slate-600">
                        {product.supplier}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-slate-900">
                        ${product.price}
                      </span>
                      <div className="text-xs text-slate-500">
                        Cost: ${product.cost}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">
                          {product.quantity}
                        </span>
                        <button
                          onClick={() => openStockModal(product)}
                          className="p-1 rounded hover:bg-slate-100"
                        >
                          <Edit2 className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                      {product.quantity <= product.alertQuantity &&
                        product.quantity > 0 && (
                          <div className="text-xs text-amber-600 mt-1">
                            Alert: {product.alertQuantity}
                          </div>
                        )}
                    </td>
                    <td className="px-4 py-4 truncate">
                      <span className="text-sm text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {product.location}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(product.status)}`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowProductDetailsModal(true);
                            setTimeout(() => setIsOpen(true), 30);
                          }}
                          className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          to={"addproduct"}
                          onClick={(e) => {
                            if (
                              !window.confirm(
                                "Do you want to edit this product",
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            if (
                              window.confirm("Do you want to duplicate product")
                            )
                              duplicateProduct(product);
                          }}
                          className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Delete 1 Product"))
                              removeProduct(product.id);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">
                  Showing{" "}
                  <span className="font-medium text-slate-900">
                    {startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-slate-900">
                    {Math.min(startIndex + perPage, sortedProducts.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-slate-900">
                    {sortedProducts.length}
                  </span>{" "}
                  results
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Rows:</label>
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="w-4 h-4 -rotate-90" />
                  </button>
                  <div className="px-4 py-2 text-sm font-medium text-slate-700">
                    {currentPage} / {totalPages}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Adjustment Modal */}
        {showStockModal && currentProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Adjust Stock
                </h3>
                <button onClick={() => setShowStockModal(false)}>
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">
                  Product:{" "}
                  <span className="font-medium text-slate-900">
                    {currentProduct.productName}
                  </span>
                </p>
                <p className="text-sm text-slate-600">
                  Current Stock:{" "}
                  <span className="font-medium text-slate-900">
                    {currentProduct.quantity}
                  </span>
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Stock Quantity
                  </label>
                  <input
                    type="number"
                    defaultValue={currentProduct.quantity}
                    min={0}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="newStock"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newStock = parseInt(
                        (
                          document.getElementById(
                            "newStock",
                          ) as HTMLInputElement
                        ).value,
                      );
                      updateStock(currentProduct.id, newStock);
                      setShowStockModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Stock
                  </button>
                  <button
                    onClick={() => setShowStockModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
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
export default AdvancedPOSTable;
