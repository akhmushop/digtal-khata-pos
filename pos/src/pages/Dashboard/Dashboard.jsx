import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Package,
  DollarSign,
  Users,
  AlertTriangle,
  ShoppingCart,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  MoreVertical,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import {
  useProductsInfoStore,
} from "../../store/product-store";
import { useSoldStore } from "../../store/sold-store";
import axios from "../../axios";

const DashboardComponent = () => {
  const [soldProductsSummery, setSoldProductsSummery] = useState({})
  const getSoldProductsSummery = async () => {
    const res = await axios.get('/sold_products/sold_products_summery')
    setSoldProductsSummery(res.data)
  }
  useEffect( () => {
    getSoldProductsSummery()
  },[])
  const salesData = Object.values(soldProductsSummery).map((item) => {
    return{
      month:item.month_name,
      Sales:item.monthly_total_sales,
      Cash:item.monthly_total_sales
    }
  })
  const [dateRange, setDateRange] = useState({
    start: "2023-12-26",
    end: "2025-12-26",
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  const soldProducts = useSoldStore((state) => state.soldProducts);
  const { productsInfo } = useProductsInfoStore();
  // sold items start
  const soldProductsItems = soldProducts;
  const currentMonthSoldSummery =soldProductsSummery[soldProductsSummery.length -1]

  // sold items end

  // sales overview start
  const [range, setRange] = useState("3");
  const filteredData = salesData.slice(-Number(range));
  const totalSales = soldProductsItems.reduce(
    (sum, item) => sum + item.sold_quantity * item.sold_price,
    0,
  );
  // sales overview end
  // performance table Start
  const categoryCount = soldProductsItems.reduce((acc, item) => {
    const category = item.category;
    acc[category] = (acc[category] || 0) + item.sold_quantity;
    return acc;
  }, {});
  const colors = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6"];
  const topSoldProduct = Object.entries(categoryCount).map(
    ([category, quantity], index) => ({
      category,
      quantity,
      color: colors[index % colors.length],
    }),
  );
  const topSoldFive = [...topSoldProduct]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  // performance table end
  //top profit start
  const monthlyProfitByCategory = soldProductsItems.reduce((acc, item) => {
    const date = new Date(item.created_at);
    const category = item.category;
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const price = item.price || 0;
    const cost = item.cost || 0;
    const quantity = item.sold_quantity || 1;
    const profit = (price - cost) * quantity;

    if (!acc[monthKey]) {
      acc[monthKey] = {};
    }

    acc[monthKey][category] = (acc[monthKey][category] || 0) + profit;
    return acc;
  }, {});
  const lastMonthKey = Object.keys(monthlyProfitByCategory).sort().slice(-1)[0];
  const lastMonthProfitByCategory = lastMonthKey
    ? monthlyProfitByCategory[lastMonthKey]
    : {};
  const totalProfitLastMonth = Object.values(lastMonthProfitByCategory).reduce(
    (sum, profit) => sum + profit,
    0,
  );
  const lastMonthProfitByCategoryPercentage = Object.entries(
    lastMonthProfitByCategory,
  ).map(([category, profit]) => ({
    category,
    profit,
    percentage:
      totalProfitLastMonth && totalProfitLastMonth !== 0
        ? (profit / totalProfitLastMonth) * 100
        : 0,
  }));
  const topProfitData = lastMonthProfitByCategoryPercentage.length
    ? [...lastMonthProfitByCategoryPercentage]
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 5)
    : [];
  //top profit end

  //top items gross start
  const salesByProductByMonth = soldProductsItems.reduce((acc, item) => {
    const date = new Date(item.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const productName = item.product_name || item.category || "Unknown";
    const gross = (item.sold_quantity || 0) * (item.price || 0);
    if (!acc[monthKey]) {
      acc[monthKey] = {};
    }
    acc[monthKey][productName] = (acc[monthKey][productName] || 0) + gross;
    return acc;
  }, {});

  const allTimeGrossByProduct = soldProductsItems.reduce((acc, item) => {
    const productName = item.product_name || item.category || "Unknown";
    const gross = (item.sold_quantity || 0) * (item.price || 0);
    acc[productName] = (acc[productName] || 0) + gross;
    return acc;
  }, {});

  const productMonthKeys = Object.keys(salesByProductByMonth).sort();
  const latestProductMonth = productMonthKeys.at(-1);
  const previousProductMonth = productMonthKeys.slice(-2, -1)[0];

  const currentMonthProductGross = latestProductMonth
    ? salesByProductByMonth[latestProductMonth]
    : {};
  const previousMonthProductGross = previousProductMonth
    ? salesByProductByMonth[previousProductMonth]
    : {};
  const grossSource =
    Object.keys(currentMonthProductGross).length > 0
      ? currentMonthProductGross
      : allTimeGrossByProduct;
  const trendBase = Object.keys(currentMonthProductGross).length
    ? previousMonthProductGross
    : {};
  const topGrossItems = Object.entries(grossSource)
    .map(([product, gross]) => {
      const previousGross = trendBase[product] || 0;
      return {
        product,
        gross,
        trend: gross >= previousGross ? "up" : "down",
      };
    })
    .sort((a, b) => b.gross - a.gross)
    .slice(0, 5);
  //top items gross end
  return (
    <div className="flex">
      <div className="fixed left-0 top-0 h-screen z-40">
        <Sidebar />
      </div>
      <div className="ml-60 w-full min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome to your business dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Calendar className="w-4 h-4 mr-2" />
              {dateRange.start} - {dateRange.end}
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Alert Products
                </p>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  {productsInfo.low_stock}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Out of Stocks
                </p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">
                  {productsInfo.stock_out}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Cheques
                </p>
                <p className="text-2xl font-bold text-green-600 mt-2">1</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cheques</p>
                <p className="text-2xl font-bold text-red-600 mt-2">1</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <Users className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {productsInfo.total_items}
                </p>
                <p className="text-xs text-blue-600 mt-1">Current Total</p>
              </div>
              <Package className="w-10 h-10 text-blue-600 opacity-70" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-sm p-6 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">
                  Total Valuation
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {productsInfo.total_valuation?.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-amber-600 opacity-70" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-sm p-6 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">
                  Sold Items
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {currentMonthSoldSummery?.monthly_sold_items}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  {currentMonthSoldSummery?.monthly_percentage_change} from last month
                </p>
              </div>
              <ShoppingCart className="w-10 h-10 text-emerald-600 opacity-70" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl shadow-sm p-6 border border-rose-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-700">
                  Customer Advance
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  -147,000.00 Rs
                </p>
              </div>
              <TrendingDown className="w-10 h-10 text-rose-600 opacity-70" />
            </div>
          </div>
        </div>

        {/* Sales Chart Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Sales Overview
              </h2>
              <p className="text-sm text-gray-600">
                Showing total sales for the last 3 months
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={"3"}>Last 3 months</option>
                <option value={"6"}>Last 6 months</option>
                <option value={"12"}>Last year</option>
              </select>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                formatter={(value) => [`$${formatCurrency(value)}`, ""]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="Sales"
                stroke="#f59e0b"
                fill="url(#colorSales)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Cash"
                stroke="#10b981"
                fill="url(#colorCash)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center p-3 bg-amber-50 rounded-lg">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Sales</p>
                <p className="font-bold">TK {currentMonthSoldSummery?.monthly_total_sales}</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Cash</p>
                <p className="font-bold">TK {currentMonthSoldSummery?.monthly_total_sales}</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Inventory Purchase
                </p>
                <p className="font-bold">Rs 0.00</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-rose-50 rounded-lg">
              <div className="w-3 h-3 bg-rose-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expenses</p>
                <p className="font-bold">Rs 0.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Sold Products */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900">Top Sold Products</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {topSoldFive.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <span className="font-bold">{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Profit */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900">Top Profit</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {topProfitData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{item.category}</p>
                      <p
                        className={`text-xs ${
                          item.percentage >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.percentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <span className="font-bold">
                    TK {formatCurrency(item.profit)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Items */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900">Top Items by Gross</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {topGrossItems.length > 0 ? (
                topGrossItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                          item.trend === "up" ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {item.trend === "up" ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <span className="font-medium">{item.product}</span>
                    </div>
                    <span className="font-bold">
                      TK {formatCurrency(item.gross)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">
                  No sales data available yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent;
