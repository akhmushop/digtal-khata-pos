import { LayoutDashboard, Package, ShoppingCart, Tags, Users } from "lucide-react";
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
    title: "POS",
    url: "/",
    icon: MdOutlinePointOfSale,
  },
  {
    title: "Products",
    icon: Package,
    items: [
      { title: "All Products", url: "/product" },
      { title: "Add Product", url: "/products/new" },
    ],
  },
  {
    title: "Sales",
    url: "/sales",
    icon: FcSalesPerformance,
  },
  {
    title: "Customers",
    url: "/customer",
    icon: Users,
  },
  {
    title: "Expense",
    url: "/expense",
    icon: GiExpense,
  },
  ,
  {
    title: "Purchases",
    icon: Tags,
    items: [
      { title: "All Purchases", url: "/purchases" },
      { title: "Purchases List", url: "/purchases-list" },
    ],
  },
];
