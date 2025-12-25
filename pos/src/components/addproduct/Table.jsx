import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Eye,
  Package,
  TrendingUp,
  TrendingDown,
  QrCode,
  BarChart3,
  RotateCcw,
  Star,
  Grid3x3,
  Menu,
  Download,
} from "lucide-react";

const AdvancedPOSTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [perPage, setPerPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [columnWidths, setColumnWidths] = useState({
    image: 100,
    name: 200,
    supplier: 150,
    barcode: 120,
    batch: 120,
    price: 100,
    valuation: 120,
    qty: 80,
    action: 140,
    featured: 120,
  });
  const [resizing, setResizing] = useState(null);

  const handleMouseDown = (columnKey, e) => {
    e.preventDefault();
    setResizing({
      columnKey,
      startX: e.pageX,
      startWidth: columnWidths[columnKey],
    });
  };

  const handleMouseMove = (e) => {
    if (!resizing) return;

    const diff = e.pageX - resizing.startX;
    const newWidth = Math.max(50, resizing.startWidth + diff);

    setColumnWidths((prev) => ({
      ...prev,
      [resizing.columnKey]: newWidth,
    }));
  };

  const handleMouseUp = () => {
    setResizing(null);
  };

  React.useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [resizing]);

  // Sample POS data
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "RICH JEWELLERY NECKLACE",
      supplier: "",
      barcode: "1721",
      batch: "DEFAULT",
      price: 275.0,
      valuation: 2850.0,
      qty: 19.0,
      featured: false,
    },
    {
      id: 2,
      name: "10 PCS BOOLS",
      supplier: "",
      barcode: "1720",
      batch: "DEFAULT",
      price: 195.0,
      valuation: 540.0,
      qty: 4.0,
      featured: false,
    },
    {
      id: 3,
      name: "CHAIN M",
      supplier: "",
      barcode: "1719",
      batch: "DEFAULT",
      price: 375.0,
      valuation: 260.0,
      qty: 1.0,
      featured: false,
    },
    {
      id: 4,
      name: "NECKLECE",
      supplier: "",
      barcode: "1718",
      batch: "DEFAULT",
      price: 775.0,
      valuation: 560.0,
      qty: 1.0,
      featured: false,
    },
    {
      id: 5,
      name: "CHAIN",
      supplier: "",
      barcode: "1717",
      batch: "DEFAULT",
      price: 375.0,
      valuation: 510.0,
      qty: 3.0,
      featured: false,
    },
    {
      id: 6,
      name: "GOLD RING SET",
      supplier: "",
      barcode: "1716",
      batch: "DEFAULT",
      price: 450.0,
      valuation: 1800.0,
      qty: 12.0,
      featured: false,
    },
    {
      id: 7,
      name: "SILVER BRACELET",
      supplier: "",
      barcode: "1715",
      batch: "DEFAULT",
      price: 299.0,
      valuation: 897.0,
      qty: 8.0,
      featured: false,
    },
    {
      id: 8,
      name: "DIAMOND EARRINGS",
      supplier: "",
      barcode: "1714",
      batch: "DEFAULT",
      price: 1250.0,
      valuation: 3750.0,
      qty: 5.0,
      featured: false,
    },
  ]);

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [products, searchTerm]);

  // Sorting
  const sortedProducts = useMemo(() => {
    let sortableProducts = [...filteredProducts];
    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProducts;
  }, [filteredProducts, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const toggleFeatured = (id) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p))
    );
  };

  const totalResults = filteredProducts.length;
  const totalValuation = sortedProducts.reduce(
    (sum, p) => sum + p.valuation,
    0
  );

  // Pagination
  const totalPages = Math.ceil(totalResults / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="max-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Header with action buttons */}
        <div className="mb-4 flex items-center justify-end">
          <div className="flex items-center gap-2">
            <button className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50">
              <Grid3x3 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto max-h-85">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 relative"
                    style={{ width: `${columnWidths.image}px` }}
                  >
                    Image
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 group"
                      onMouseDown={(e) => handleMouseDown("image", e)}
                    >
                      <div className="w-1 h-full group-hover:bg-blue-500"></div>
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left relative"
                    style={{ width: `${columnWidths.name}px` }}
                  >
                    <button
                      onClick={() => requestSort("name")}
                      className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Product Name
                      {sortConfig.key === "name" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        ))}
                    </button>
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 group"
                      onMouseDown={(e) => handleMouseDown("name", e)}
                    >
                      <div className="w-1 h-full group-hover:bg-blue-500"></div>
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 relative"
                    style={{ width: `${columnWidths.supplier}px` }}
                  >
                    Supplier
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 group"
                      onMouseDown={(e) => handleMouseDown("supplier", e)}
                    >
                      <div className="w-1 h-full group-hover:bg-blue-500"></div>
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left relative"
                    style={{ width: `${columnWidths.barcode}px` }}
                  >
                    <button
                      onClick={() => requestSort("barcode")}
                      className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
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
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 group"
                      onMouseDown={(e) => handleMouseDown("barcode", e)}
                    >
                      <div className="w-1 h-full group-hover:bg-blue-500"></div>
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 relative"
                    style={{ width: `${columnWidths.batch}px` }}
                  >
                    Batch
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 group"
                      onMouseDown={(e) => handleMouseDown("batch", e)}
                    >
                      <div className="w-1 h-full group-hover:bg-blue-500"></div>
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left relative"
                    style={{ width: `${columnWidths.price}px` }}
                  >
                    <button
                      onClick={() => requestSort("price")}
                      className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
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
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 group"
                      onMouseDown={(e) => handleMouseDown("price", e)}
                    >
                      <div className="w-1 h-full group-hover:bg-blue-500"></div>
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left relative"
                    style={{ width: `${columnWidths.valuation}px` }}
                  >
                    <button
                      onClick={() => requestSort("valuation")}
                      className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Valuation
                      {sortConfig.key === "valuation" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        ))}
                    </button>
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 group"
                      onMouseDown={(e) => handleMouseDown("valuation", e)}
                    >
                      <div className="w-1 h-full group-hover:bg-blue-500"></div>
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left relative"
                    style={{ width: `${columnWidths.qty}px` }}
                  >
                    <button
                      onClick={() => requestSort("qty")}
                      className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Qty
                      {sortConfig.key === "qty" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        ))}
                    </button>
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 group"
                      onMouseDown={(e) => handleMouseDown("qty", e)}
                    >
                      <div className="w-1 h-full group-hover:bg-blue-500"></div>
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 relative"
                    style={{ width: `${columnWidths.action}px` }}
                  >
                    Action
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 group"
                      onMouseDown={(e) => handleMouseDown("action", e)}
                    >
                      <div className="w-1 h-full group-hover:bg-blue-500"></div>
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 relative"
                    style={{ width: `${columnWidths.featured}px` }}
                  >
                    Featured
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 group"
                      onMouseDown={(e) => handleMouseDown("featured", e)}
                    >
                      <div className="w-1 h-full group-hover:bg-blue-500"></div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td
                      className="px-4 py-4"
                      style={{ width: `${columnWidths.image}px` }}
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                        No Image
                      </div>
                    </td>
                    <td
                      className="px-4 py-4 truncate"
                      style={{ width: `${columnWidths.name}px` }}
                    >
                      <div className="font-medium text-gray-900 truncate">
                        {product.name}
                      </div>
                    </td>
                    <td
                      className="px-4 py-4 text-sm text-gray-600 truncate"
                      style={{ width: `${columnWidths.supplier}px` }}
                    >
                      {product.supplier || "-"}
                    </td>
                    <td
                      className="px-4 py-4 text-sm text-gray-900 truncate"
                      style={{ width: `${columnWidths.barcode}px` }}
                    >
                      {product.barcode}
                    </td>
                    <td
                      className="px-4 py-4 truncate"
                      style={{ width: `${columnWidths.batch}px` }}
                    >
                      <span className="text-blue-600 font-medium text-sm">
                        {product.batch}
                      </span>
                    </td>
                    <td
                      className="px-4 py-4 text-sm text-gray-900"
                      style={{ width: `${columnWidths.price}px` }}
                    >
                      {product.price.toFixed(2)}
                    </td>
                    <td
                      className="px-4 py-4 text-sm text-gray-900"
                      style={{ width: `${columnWidths.valuation}px` }}
                    >
                      {product.valuation.toFixed(2)}
                    </td>
                    <td
                      className="px-4 py-4 text-sm font-medium text-gray-900"
                      style={{ width: `${columnWidths.qty}px` }}
                    >
                      {product.qty.toFixed(2)}
                    </td>
                    <td
                      className="px-4 py-4"
                      style={{ width: `${columnWidths.action}px` }}
                    >
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <QrCode className="w-5 h-5" />
                        </button>
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <BarChart3 className="w-5 h-5" />
                        </button>
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                    <td
                      className="px-4 py-4"
                      style={{ width: `${columnWidths.featured}px` }}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleFeatured(product.id)}
                          className={`transition-colors ${
                            product.featured
                              ? "text-blue-600"
                              : "text-gray-300 hover:text-blue-400"
                          }`}
                        >
                          <Star
                            className="w-5 h-5"
                            fill={product.featured ? "currentColor" : "none"}
                          />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="px-6 py-2 bg-blue-500 text-white rounded-full text-sm font-medium">
              Total results : {totalResults}
            </div>
            <div className="px-6 py-2 bg-blue-500 text-white rounded-full text-sm font-medium">
              Total valuation : {totalValuation.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Per page:</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {startIndex + 1}-{Math.min(endIndex, totalResults)} of{" "}
              {totalResults}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronUp className="w-5 h-5 rotate-90deg" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronDown className="w-5 h-5 rotate-90deg" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedPOSTable;
