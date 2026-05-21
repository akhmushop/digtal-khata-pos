import React, { useEffect, useState } from "react";
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
import { useProductStore } from "./store/product-store";
import { useSoldStore } from "./store/sold-store";
import { useCustomerStore } from "./store/customer-store";

function App() {
  const { addCustomer } = useCustomerStore();
  const initialCustomerInfo = {
    name: "",
    phone: "",
    address: "",
  };
  const [customerInfo, setCustomerInfo] = useState(initialCustomerInfo);
  const handleOnchange = (e) => {
    const { id, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [id]: id === "phone" ? value.replace(/\D/g, "").slice(0, 11) : value,
    }));
  };
  const handleAddCustomer = () => {
    if (customerInfo.name === "" || customerInfo.phone === "") {
      window.alert("Please fill all required fields");
      return;
    }
    if (window.confirm("do you want to add customer")) {
      addCustomer(customerInfo);
      setCustomerInfo(initialCustomerInfo);
    }
  };
  const { getProducts } = useProductStore();
  const { getSoldProducts } = useSoldStore();
  useEffect(() => {
    getProducts();
    getSoldProducts();
  }, []);
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Pos
          customerInfo={customerInfo}
          handleOnchange={handleOnchange}
          handleAddCustomer={handleAddCustomer}
          setCustomerInfo={setCustomerInfo}
          initialCustomerInfo={initialCustomerInfo}
        />
      ),
    },
    {
      path: "/customer",
      element: (
        <AddCustomerModal
          customerInfo={customerInfo}
          handleOnchange={handleOnchange}
          handleAddCustomer={handleAddCustomer}
          setCustomerInfo={setCustomerInfo}
          initialCustomerInfo={initialCustomerInfo}
        />
      ),
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
  return <RouterProvider router={router} />;
}

export default App;
