import React, { useEffect, useState } from "react";
import "./App.css";
import { useProductStore } from "./store/product-store.js";
import { useSoldStore } from "./store/sold-store.js";
import { useCustomerStore } from "./store/customer-store.js";
import { usePurchasesStore } from "./store/purchases-store.js";
import AppRoutes from "./routes/AppRoutes.js";
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

  return <AppRoutes />;
}

export default App;
