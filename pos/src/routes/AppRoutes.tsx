import { createBrowserRouter, RouterProvider } from "react-router";
import Pos from "../pages/POS/POS";
import { AddCustomerModal } from "../pages/Customer/Customer";
import ProductStockForm from "../features/products/pages/AddProductPage";
import DashboardComponent from "../pages/Dashboard/Dashboard";
import { Sales } from "../pages/Sales/Sales";
import { Expense } from "../pages/Expense/Expense";
import { PurchasesOrder } from "../pages/PurchasesOrder/PurchasesOrder";
import { PurchasesList } from "../pages/PurchasesOrder/PurchasesList";
import { ReceiveItems } from "../pages/PurchasesOrder/ReceiveItems";
import { PurchaseViewItems } from "../pages/PurchasesOrder/PurchasesReturn";
import AppLayout from "@/layouts/AppLayout";
import Products from "../features/products/pages/ProductsPage";
import { Categories } from "@/features/products/pages/Categories";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Pos />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/product",
        element: <Products />,
      },
      {
        path: "/categories",
        element: <Categories />,
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
        element: <AddCustomerModal />,
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
]);
export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
