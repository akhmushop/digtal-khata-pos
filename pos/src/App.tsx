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
