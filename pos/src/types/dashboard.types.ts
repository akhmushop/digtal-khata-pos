import { type LucideIcon } from "lucide-react";
export interface SalesOverview {
  cash: number;
  month: string;
  sales: number;
}
export interface ProductSummary {
  low_stock: number;
  stock_out: number;
  total_items: number;
  total_valuation: number;
}
interface TopItemByGross {
  trend: string;
  productName: string;
  current_month_gross: number;
  last_month_gross: number;
}
interface TotalSales {}
interface TopSoldCategory {
  category: string;
  sold_items_by_category: number;
}
interface ProfitCategory {
  category: string;
  current_month_profit: number;
  growth_percentage: number;
  last_month_profit: number;
}
export interface NetProfit {
  current_net_profit: number;
  profit_growth: number;
}
export interface InvoiceDue {
  current_due: number;
  invoice_due_growth_pct: number | null;
}
export interface ExpensesSummary {
  current_expenses: number;
  expenses_growth: number;
}
export interface PurchasesSummary {
  current_purchases: number;
  purchases_growth: number;
}
export interface ReturnSummary {
  current_returns: number;
  return_growth_pct: number;
}
interface RecentSale {
  createdAt: string;
  id: number;
  image: string;
  productNameAtSale: number;
  soldPrice: number;
}
interface LowStockProduct {
  id: number;
  image: string;
  productName: number;
  quantity: number;
  sku: string;
  status: string;
}
interface TopSellingProduct {
  id: number;
  image: string;
  productId: number;
  productName: string;
  soldPrice: number;
  top_selling: number;
}
export interface SaleSummary {
  current_net_sales: number;
  current_return: number;
  return_growth: number;
  sales_growth: number;
}
export interface DashBoard {
  salesOverview: SalesOverview[];
  productsSummary: ProductSummary;
  topItemsByGross: TopItemByGross[];
  totalSales: TotalSales;
  topSoldProductsByCategory: TopSoldCategory[];
  profitByCategory: ProfitCategory[];
  salesSummary: SaleSummary;
  netProfit: NetProfit;
  invoiceDue: InvoiceDue;
  expensesSummary: ExpensesSummary;
  purchasesSummary: PurchasesSummary;
  return_summary: ReturnSummary;
  recentSalesSummary: RecentSale[];
  lowStockSummary: LowStockProduct[];
  topSellingProducts: TopSellingProduct[];
}
export interface TopSoldProductCategory {
  category: string;
  quantity: number;
  color: string;
}
export interface OverallInfoCards {
  bg: string;
  circleBg: string;
  title: string;
  total: number;
}
export interface SummaryCards extends OverallInfoCards {
  growth: number;
}
export interface SummaryCardProps {
  value: SummaryCards;
  formatCurrency: (value: number) => string;
}
export interface BigSummaryCards {
  title: string;
  total: number;
  growth: number;
  bg: string;
  icon: LucideIcon;
  iconColor: string;
  titleColor: string;
}
export interface BigSummaryCardProps {
  value: BigSummaryCards;
  formatCurrency: (value: number) => string;
}
export interface TopProfitByCategoryProps {
  profitByCategory: ProfitCategory[];
  formatCurrency: (value: number) => string;
}
export interface TopItemsByGrossProps {
  topItemsByGross: TopItemByGross[];
  formatCurrency: (value: number) => string;
}
export interface TopSellingProductsProps {
  topSellingProducts: TopSellingProduct[];
  formatCurrency: (value: number) => string;
}
export interface LowStockAlertProps {
  lowStockSummary: LowStockProduct[];
  formatCurrency: (value: number) => string;
}
export interface RecentSalesProps {
  recentSalesSummary: RecentSale[];
  formatCurrency: (value: number) => string;
}
