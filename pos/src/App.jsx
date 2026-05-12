import React, { useEffect } from "react";
import {
  Routes,
  Route,
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import Pos from "./pages/POS/POS";
import { AddCustomerModal } from "./pages/Customer/Customer";
import "./App.css";
import AddProduct from "./pages/AddProduct/AddProduct";
import ProductStockForm from "./pages/AddProduct/Addproductfrom";
import DashboardComponent from "./pages/Dashboard/Dashboard";
import { Sales } from "./pages/Sales/Sales";
import { useProductStore, useProductsInfoStore } from "./store/product-store";
import { useCartStore } from "./store/cart-store";
import { useSoldStore } from "./store/sold-store";

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
]);
function App() {
  const { getProducts } = useProductStore();
  const { getSoldProducts } = useSoldStore();
  const { getProductsInfo } = useProductsInfoStore();
  useEffect(() => {
    getProducts();
    getSoldProducts();
    getProductsInfo();
  }, []);
  return <RouterProvider router={router} />;
}

export default App;
