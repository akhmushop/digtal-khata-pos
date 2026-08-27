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
import Sidebar from "../../components/layout/Sidebar.js";
import axios from "../../api/axios.js";
import {
  BigSummaryCardProps,
  BigSummaryCards,
  DashBoard,
  ExpensesSummary,
  InvoiceDue,
  LowStockAlertProps,
  NetProfit,
  OverallInfoCards,
  ProductSummary,
  PurchasesSummary,
  RecentSalesProps,
  ReturnSummary,
  SaleSummary,
  SummaryCardProps,
  SummaryCards,
  TopItemsByGrossProps,
  TopProfitByCategoryProps,
  TopSellingProductsProps,
  TopSoldProductCategory,
} from "../../types/dashboard.types.js";
const DashboardComponent = () => {
  const initialProductSummary: ProductSummary = {
    low_stock: 0,
    stock_out: 0,
    total_items: 0,
    total_valuation: 0,
  };
  const initialSaleSummary: SaleSummary = {
    current_net_sales: 0,
    current_return: 0,
    return_growth: 0,
    sales_growth: 0,
  };
  const initialNetProfit: NetProfit = {
    current_net_profit: 0,
    profit_growth: 0,
  };
  const initialInvoiceDue: InvoiceDue = {
    current_due: 0,
    invoice_due_growth_pct: 0,
  };
  const initialExpensesSummary: ExpensesSummary = {
    current_expenses: 0,
    expenses_growth: 0,
  };
  const initialPurchasesSummary: PurchasesSummary = {
    current_purchases: 0,
    purchases_growth: 0,
  };
  const initialReturnSummary: ReturnSummary = {
    current_returns: 0,
    return_growth_pct: 0,
  };
  const [dashboard, setDashboard] = useState<DashBoard>({
    salesOverview: [],
    productsSummary: initialProductSummary,
    topItemsByGross: [],
    totalSales: {},
    topSoldProductsByCategory: [],
    profitByCategory: [],
    salesSummary: initialSaleSummary,
    netProfit: initialNetProfit,
    invoiceDue: initialInvoiceDue,
    expensesSummary: initialExpensesSummary,
    purchasesSummary: initialPurchasesSummary,
    return_summary: initialReturnSummary,
    recentSalesSummary: [],
    lowStockSummary: [],
    topSellingProducts: [],
  });
  const getDashboardSummary = async () => {
    try {
      const res = await axios.get("/dashboard_summary");

      setDashboard({
        salesOverview: res.data.salesOverview || [],
        productsSummary: res.data.productsSummary?.[0] || {},
        topItemsByGross: res.data.topItemsByGross || [],
        totalSales: res.data.totalSales?.[0] || {},
        topSoldProductsByCategory: res.data.top_sold_products_by_category || [],
        profitByCategory: res.data.profitByCategory || [],
        salesSummary: res.data.salesSummary?.[0] || {},
        netProfit: res.data.netProfit?.[0] || {},
        invoiceDue: res.data.invoiceDue?.[0] || {},
        expensesSummary: res.data.expensesSummary?.[0] || 0,
        purchasesSummary: res.data.purchasesSummary?.[0] || 0,
        return_summary: res.data.return_summary?.[0] || 0,
        recentSalesSummary: res.data.recentSalesSummary || [],
        lowStockSummary: res.data.lowStockSummary || [],
        topSellingProducts: res.data.topSellingProducts || [],
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };
  useEffect(() => {
    getDashboardSummary();
  }, []);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  // sold items end
  // sales overview start
  const [range, setRange] = useState("3");
  const filteredData = Object.values(dashboard.salesOverview).slice(
    -Number(range),
  );
  // sales overview end
  // performance table Start
  const colors = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6"];

  const topSoldProductByCategory = Object.values(
    dashboard.topSoldProductsByCategory,
  ).map((item, index) => {
    return {
      category: item.category,
      quantity: item.sold_items_by_category,
      color: colors[index % colors.length] || "#ef4444",
    };
  });
  const bigSummaryCards: BigSummaryCards[] = [
    {
      title: "Net Profit",
      total: dashboard.netProfit?.current_net_profit,
      growth: dashboard.netProfit?.profit_growth,
      bg: "bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200",
      icon: Package,
      iconColor: "text-blue-600",
      titleColor: "text-blue-700",
    },
    {
      title: "Invoice Due",
      total: dashboard.invoiceDue?.current_due,
      growth: dashboard.invoiceDue?.invoice_due_growth_pct ?? 0,
      bg: "bg-linear-to-br from-amber-50 to-amber-100 border border-amber-200",
      icon: TrendingUp,
      iconColor: "text-amber-600",
      titleColor: "text-amber-700",
    },
    {
      title: "Total Expenses",
      total: dashboard.expensesSummary?.current_expenses,
      growth: dashboard.expensesSummary?.expenses_growth,
      bg: "bg-linear-to-br from-emerald-50 to-emerald-100 border border-emerald-200",
      icon: ShoppingCart,
      iconColor: "text-emerald-600",
      titleColor: "text-emerald-700",
    },
    {
      title: "Total Payment Returns",
      total: dashboard.salesSummary?.current_return,
      growth: dashboard.salesSummary?.return_growth,
      bg: "bg-linear-to-br from-rose-50 to-rose-100 border border-rose-200",
      icon: TrendingDown,
      iconColor: "text-rose-600",
      titleColor: "text-rose-700",
    },
  ];
  const summaryCards: SummaryCards[] = [
    {
      bg: "bg-amber-50",
      circleBg: "bg-amber-500",
      title: "Total Sales",
      total: dashboard.salesSummary?.current_net_sales,
      growth: dashboard.salesSummary?.sales_growth,
    },
    {
      bg: "bg-emerald-50",
      circleBg: "bg-emerald-500",
      title: "Total Sales Return",
      total: dashboard.salesSummary?.current_return,
      growth: dashboard.salesSummary?.return_growth,
    },
    {
      bg: "bg-blue-50",
      circleBg: "bg-blue-500",
      title: "Total Purchase",
      total: dashboard.purchasesSummary?.current_purchases,
      growth: dashboard.purchasesSummary?.purchases_growth,
    },
    {
      bg: "bg-rose-50",
      circleBg: "bg-rose-500",
      title: "Total Purchase Return",
      total: dashboard.return_summary?.current_returns,
      growth: dashboard.return_summary?.return_growth_pct,
    },
  ];
  const overallInfo: OverallInfoCards[] = [
    {
      bg: "bg-amber-50",
      circleBg: "bg-amber-500",
      title: "SUPPLIERS",
      total: 5,
    },
    {
      bg: "bg-emerald-50",
      circleBg: "bg-emerald-500",
      title: "CUSTOMERS",
      total: 3,
    },
    {
      bg: "bg-blue-50",
      circleBg: "bg-blue-500",
      title: "ORDERS",
      total: 15,
    },
  ];
  return (
      <div className=" w-full min-h-screen bg-gray-50 p-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome to your business dashboard</p>
          </div>
        </div>

        {/* sale info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((value, index) => (
            <SummaryCard
              key={index}
              value={value}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>

        {/* Alert Cards */}

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Alert Products
                </p>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  {productsSummery.low_stock}
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
                  {productsSummery.stock_out}
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
        </div> */}

        {/* Main Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {bigSummaryCards.map((value, index) => (
            <BigSummaryCard
              key={index}
              value={value}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Sales Chart Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 col-span-2">
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
                  formatter={(value) => [
                    `$${formatCurrency(typeof value === "number" ? value : 0)}`,
                    "",
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#f59e0b"
                  fill="url(#colorSales)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="cash"
                  stroke="#10b981"
                  fill="url(#colorCash)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-2 mb-8 col-span-1 flex flex-col justify-evenly">
            <section className="flex flex-col gap-6">
              <h2>Overall Information</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                {overallInfo.map((value, index) => (
                  <OverallInfoCard key={index} value={value} />
                ))}
              </div>
            </section>
            <section className="flex flex-col gap-6">
              <h2>Customers Overview</h2>
              <div className="flex gap-6 items-center">
                <div className="flex flex-col h-20 w-20 text-center border-6 border-amber-400 rounded-full">
                  <span className="text-3xl font-bold">1</span>
                  <span className="text-gray-500">total</span>
                </div>
                <div className="flex flex-col w-full gap-4">
                  <div className="flex justify-between w-full">
                    <div className="flex justify-between w-full items-center">
                      <div className="flex gap-2">
                        <span className="font-medium">First Time</span>
                        <span className="text-gray-600">1.0K</span>
                      </div>
                      <span className="text-gray-600">100%</span>
                    </div>
                  </div>
                  <div className="flex justify-between w-full items-center">
                    <div className="flex gap-2">
                      <span className="font-medium">Returning</span>
                      <span className="text-gray-600">1.0K</span>
                    </div>
                    <span className="text-gray-600">100%</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Sold Products */}
          <TopSoldProductsByCategory
            topSoldProductByCategory={topSoldProductByCategory}
          />
          {/* Top Profit */}
          <TopProfitByCategory
            profitByCategory={dashboard.profitByCategory}
            formatCurrency={formatCurrency}
          />
          {/* Top Items */}
          <TopItemsByGross
            topItemsByGross={dashboard.topItemsByGross}
            formatCurrency={formatCurrency}
          />
          {/* Top Selling Products */}
          <TopSellingProducts
            topSellingProducts={dashboard.topSellingProducts}
            formatCurrency={formatCurrency}
          />
          {/* Low Stock Alert */}
          <LowStockAlert
            lowStockSummary={dashboard.lowStockSummary}
            formatCurrency={formatCurrency}
          />
          {/* Recent Sales */}
          <RecentSales
            recentSalesSummary={dashboard.recentSalesSummary}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>
  );
};

export default DashboardComponent;

const SummaryCard = ({ value, formatCurrency }: SummaryCardProps) => {
  return (
    <div className={`flex items-center p-3 ${value.bg} rounded-lg`}>
      <div className={`w-3 h-3 ${value.circleBg} rounded-full mr-3`}></div>
      <div>
        <p className="text-sm font-medium text-gray-600">{value.title}</p>
        <p className="font-bold">TK {formatCurrency(value.total)}</p>
        <p className="text-xs">
          {value.growth
            ? `${value.growth > 100 ? "++" : "+"}${value.growth}`
            : "N/A"}{" "}
          % from last month
        </p>
      </div>
    </div>
  );
};
const OverallInfoCard = ({ value }: { value: OverallInfoCards }) => {
  return (
    <div className={`flex flex-col items-center p-3 ${value.bg} rounded-lg`}>
      <div className={`w-3 h-3 ${value.circleBg} rounded-full mb-1`}></div>

      <p className="text-sm font-medium text-gray-600">{value.title}</p>

      <p className="font-bold">{value.total}</p>
    </div>
  );
};
const BigSummaryCard = ({ value, formatCurrency }: BigSummaryCardProps) => {
  const Icon = value.icon;
  return (
    <div className={`${value.bg} rounded-xl shadow-sm p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${value.titleColor}`}>
            {value.title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {formatCurrency(value.total)}
          </p>
        </div>
        <Icon className={`w-10 h-10 ${value.iconColor} opacity-70`} />
      </div>
      <div className="flex justify-between mt-2">
        <p className="text-xs">
          {value.growth
            ? `${value.growth > 100 ? "++" : "+"}${value.growth}`
            : "N/A"}{" "}
          % from last month
        </p>
        <button className="hover:cursor-pointer">View All</button>
      </div>
    </div>
  );
};

const TopSoldProductsByCategory = ({
  topSoldProductByCategory,
}: {
  topSoldProductByCategory: TopSoldProductCategory[];
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900">Top Sold Products</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-4">
        {topSoldProductByCategory.map((item, index) => (
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
  );
};
const TopProfitByCategory = ({
  profitByCategory,
  formatCurrency,
}: TopProfitByCategoryProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900">Top Profit</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-4">
        {Object.values(profitByCategory).map((item, index) => (
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
                    item.growth_percentage >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {item.growth_percentage
                    ? `${item.growth_percentage}%`
                    : "N/A"}
                </p>
              </div>
            </div>
            <span className="font-bold">
              TK {formatCurrency(item.current_month_profit)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
const TopItemsByGross = ({
  topItemsByGross,
  formatCurrency,
}: TopItemsByGrossProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900">Top Items by Gross</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-4">
        {topItemsByGross?.length > 0 ? (
          Object.values(topItemsByGross).map((item, index) => (
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
                <span className="font-medium">{item.productName}</span>
              </div>
              <span className="font-bold">
                TK {formatCurrency(item.current_month_gross)}
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
  );
};
const TopSellingProducts = ({
  topSellingProducts,
  formatCurrency,
}: TopSellingProductsProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900">Top Selling Products</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-4">
        {topSellingProducts?.length > 0 ? (
          Object.values(topSellingProducts).map((item) => {
            return (
              <div
                key={item.id}
                className="flex items-center justify-between hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <img
                    className={`w-15 h-15 rounded-full`}
                    src={item.image}
                    alt=""
                  />

                  <div className="flex flex-col gap-1 ">
                    <span className="font-medium">{item.productName}</span>
                    <span className="font-sm">{item.top_selling} Sales</span>
                  </div>
                </div>
                <span className="font-bold text-right">
                  TK {formatCurrency(item.soldPrice)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-sm text-gray-500">
            No sales data available yet.
          </div>
        )}
      </div>
    </div>
  );
};
const LowStockAlert = ({
  lowStockSummary,
  formatCurrency,
}: LowStockAlertProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900">Low Stock Alert</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-4">
        {lowStockSummary?.length > 0 ? (
          Object.values(lowStockSummary).map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between hover:bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <img
                  className={`w-15 h-15 rounded-full`}
                  src={item.image}
                  alt=""
                />

                <div className="flex flex-col gap-1">
                  <span className="font-medium">{item.productName}</span>
                  <span className="font-sm">{item.sku}</span>
                </div>
              </div>
              <div className="flex flex-col text-right ">
                <span>status</span>
                <span className="text-red-500">{item.status}</span>
                <span>stock: {item.quantity}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500">
            No sales data available yet.
          </div>
        )}
      </div>
    </div>
  );
};
const RecentSales = ({
  recentSalesSummary,
  formatCurrency,
}: RecentSalesProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900">Recent Sales</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-4">
        {recentSalesSummary?.length > 0 ? (
          Object.values(recentSalesSummary).map((item, index) => {
            const date = new Date(item.createdAt).toLocaleDateString();
            const time = new Date(item.createdAt).toLocaleTimeString();
            return (
              <div
                key={item.id}
                className="flex items-center justify-between hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <img
                    className={`w-15 h-15 rounded-full`}
                    src={item.image}
                    alt=""
                  />

                  <div className="flex flex-col gap-1 ">
                    <span className="font-medium">
                      {item.productNameAtSale}
                    </span>
                    <span className="font-sm">{date + " " + time}</span>
                  </div>
                </div>
                <span className="font-bold text-right">
                  TK {formatCurrency(item.soldPrice)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-sm text-gray-500">
            No sales data available yet.
          </div>
        )}
      </div>
    </div>
  );
};
