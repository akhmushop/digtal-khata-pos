import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import Pos from "./pages/POS/POS.js";
import { AddCustomerModal } from "./pages/Customer/Customer.js";
import "./App.css";
import AddProduct from "./pages/AddProduct/AddProduct.jsx";
import ProductStockForm from "./pages/AddProduct/Addproductfrom.js";
import DashboardComponent from "./pages/Dashboard/Dashboard.js";
import { Sales } from "./pages/Sales/Sales.js";
import { useProductStore } from "./store/product-store.js";
import { useSoldStore } from "./store/sold-store.js";
import { useCustomerStore } from "./store/customer-store.js";
import { Expense } from "./pages/Expense/Expense.js";
import { PurchasesOrder } from "./pages/PurchasesOrder/PurchasesOrder.jsx";
import { PurchasesList } from "./pages/PurchasesOrder/PurchasesList.jsx";
import { ReceiveItems } from "./pages/PurchasesOrder/ReceiveItems.js";
import { usePurchasesStore } from "./store/purchases-store.js";
import { PurchaseViewItems } from "./pages/PurchasesOrder/PurchasesReturn.jsx";
import type { InputValue } from "./types/customers-types.js";

function App() {
  const { getCustomers } = useCustomerStore();
  const { getProducts } = useProductStore();
  const { getSoldProducts } = useSoldStore();
  const { getPurchases, getPurchaseItems, getPurchasesReturnItems } =
    usePurchasesStore();
  useEffect(() => {
    getProducts();
    getSoldProducts();
    getCustomers();
    getPurchases();
    getPurchaseItems();
    getPurchasesReturnItems();
  }, []);
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Pos />,
    },
    {
      path: "/customer",
      element: <AddCustomerModal />,
    },
    {
      path: "/product",
      element: <AddProduct />,
    },
    {
      path: "/product/addproduct",
      element: <ProductStockForm />,
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
      path: "/receive-items/:id",
      element: <ReceiveItems />,
    },
    {
      path: "/purchase-return/:id",
      element: <PurchaseViewItems />,
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
