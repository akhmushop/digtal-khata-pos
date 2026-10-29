import {
  ContactRound,
  CreditCard,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Users,
  BarChart3,
} from "lucide-react";
import { GiExpense } from "react-icons/gi";
import { MdOutlinePointOfSale } from "react-icons/md";
import { FcSalesPerformance } from "react-icons/fc";

export const navigation = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Due Management",
    url: "/due-management",
    icon: CreditCard,
  },
  {
    title: "POS",
    url: "/",
    icon: MdOutlinePointOfSale,
  },
  {
    title: "Reports",
    icon: BarChart3,
    items: [
      { title: "All Reports Hub", url: "/reports" },
      { title: "Shift Close (Z-Report)", url: "/reports?tab=register-close" },
      { title: "Sales Summary", url: "/reports?tab=sales-summary" },
      { title: "Hourly & Peak Hours", url: "/reports?tab=sales-hourly" },
      { title: "Sales by Invoice", url: "/reports?tab=sales-invoices" },
      { title: "Product Sales", url: "/reports?tab=sales-products" },
      { title: "Payment Breakdown", url: "/reports?tab=sales-payments" },
      { title: "Gross Profit & Margins", url: "/reports?tab=profit" },
      { title: "Customer Receivables", url: "/reports?tab=receivables" },
      { title: "Tax / VAT Reconciliation", url: "/reports?tab=tax" },
      { title: "Stock & Valuation", url: "/reports?tab=stock" },
      { title: "Loss & Shrinkage", url: "/reports?tab=shrinkage" },
      { title: "Batch & Expiry", url: "/reports?tab=batch-expiry" },
      { title: "Purchase Summary", url: "/reports?tab=purchases-summary" },
      { title: "Supplier Payables", url: "/reports?tab=supplier-payables" },
    ],
  },
  {
    title: "Products",
    icon: Package,
    items: [
      { title: "All Products", url: "/product" },
      { title: "Add Product", url: "/product/addproduct" },
      { title: "Stock Adjustment", url: "/product/stock-adjustment" },
      { title: "Categories", url: "/categories" },
      { title: "Brands", url: "/brands" },
      { title: "Units", url: "/units" },
      { title: "Variants", url: "/variants" },
    ],
  },
  {
    title: "Sales",
    url: "/sales",
    icon: FcSalesPerformance,
  },
  {
    title: "Contacts",
    icon: ContactRound,
    items: [
      { title: "Customers", url: "/customer" },
      { title: "Suppliers", url: "/suppliers" },
    ],
  },
  {
    title: "Expense",
    url: "/expense",
    icon: GiExpense,
  },
  {
    title: "Purchases",
    icon: Tags,
    items: [
      { title: "All Purchases", url: "/purchases" },
      { title: "Purchases List", url: "/purchases-list" },
    ],
  },
];
