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
import { Expense } from "./pages/Expense/Expense";
import { PurchasesOrder } from "./pages/PurchasesOrder/PurchasesOrder";
import { PurchasesList } from "./pages/PurchasesOrder/PurchasesList";
import { ReceiveItems } from "./pages/PurchasesOrder/ReceiveItems";
import { usePurchasesStore } from "./store/purchases-store";

function App() {
  const { addCustomer, getCustomers } = useCustomerStore();
  const initialInputValue = {
    name: "",
    phone: "",
    address: "",
  };
  const [inputValue, setInputValue] = useState(initialInputValue);
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
  const handleAddCustomer = async () => {
    if (customerInfo.name === "" || customerInfo.phone === "") {
      window.alert("Please fill all required fields");
      return;
    }
    if (window.confirm("do you want to add customer")) {
      addCustomer(customerInfo);
      const newCustomer = await addCustomer(customerInfo);
      setCustomerInfo(initialCustomerInfo);
      setInputValue(newCustomer);
    }
  };
  const { getProducts } = useProductStore();
  const { getSoldProducts } = useSoldStore();
  const { getPurchases } = usePurchasesStore();
  useEffect(() => {
    getProducts();
    getSoldProducts();
    getCustomers();
    getPurchases();
  }, []);
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Pos
          initialInputValue={initialInputValue}
          inputValue={inputValue}
          setInputValue={setInputValue}
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
      path: "/receive-items",
      element: <ReceiveItems />,
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
