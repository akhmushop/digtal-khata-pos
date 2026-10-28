import { createBrowserRouter, RouterProvider } from "react-router";
import Pos from "../features/pos/pages/PosPage";
import { CustomersPage } from "../features/Contacts/pages/CustomersPage";
import ProductStockForm from "../features/products/pages/AddProductPage";
import DashboardComponent from "../pages/Dashboard/Dashboard";
import { Sales } from "../features/pos/pages/Sales";
import { Expense } from "../features/Expense/Expense";
import { PurchasesOrder } from "../features/purchases/pages/Purchases";
import { PurchasesList } from "../features/purchases/pages/PurchasesList";
import { ReceiveItems } from "../features/purchases/pages/ReceiveItems";
import { PurchaseViewItems } from "../pages/PurchasesOrder/PurchasesReturn";
import AppLayout from "@/layouts/AppLayout";
import Products from "../features/products/pages/ProductsPage";
import { Categories } from "@/features/products/pages/Categories";
import { Brands } from "@/features/products/pages/Brands";
import { Units } from "@/features/products/pages/Units";
import { Suppliers } from "@/features/Contacts/pages/Suppliers";
import { VariantManager } from "@/features/products/pages/Variants";
import { StockAdjustment } from "@/features/products/pages/StockAdjustment";
import { DueManagementPage } from "@/features/due-management/DueManagementPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Pos />,
  },
  {
    path: "/due-management",
    element: (
      <QueryClientProvider client={queryClient}>
        <DueManagementPage />
      </QueryClientProvider>
    ),
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/product",
        element: <Products />,
      },
      {
        path: "/product/stock-adjustment",
        element: <StockAdjustment />,
      },
      {
        path: "/categories",
        element: <Categories />,
      },
      {
        path: "/brands",
        element: <Brands />,
      },
      {
        path: "/units",
        element: <Units />,
      },
      {
        path: "/variants",
        element: <VariantManager />,
      },
      {
        path: "/suppliers",
        element: <Suppliers />,
      },
      {
        path: "/dashboard",
        element: <DashboardComponent />,
      },
      {
        path: "/sales",
        element: <Sales />,
      },
      {
        path: "/expense",
        element: <Expense />,
      },
      {
        path: "/purchases",
        element: <PurchasesOrder />,
      },
      {
        path: "/purchases-list",
        element: <PurchasesList />,
      },
      {
        path: "/customer",
        element: <CustomersPage />,
      },
      {
        path: "/receive-items/:id",
        element: <ReceiveItems />,
      },
      {
        path: "/purchase-return/:id",
        element: <PurchaseViewItems />,
      },
    ],
  },
  {
    path: "/product/addproduct",
    element: <ProductStockForm />,
  },
  {
    path: "/product/:id/edit",
    element: <ProductStockForm />,
  },
]);
export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
