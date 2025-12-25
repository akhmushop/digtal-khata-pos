import React from "react";
import { Routes, Route } from "react-router";
import Pos from "./pages/POS/POS";
import { AddCustomerModal } from "./pages/Customer/Customer";
import "./App.css";
import AddProduct from "./pages/AddProduct/AddProduct";
import ProductStockForm from "./pages/AddProduct/Addproductfrom";
import DashboardComponent from "./pages/Dashboard/Dashboard";

function App() {
  return (
    <>
      <Routes>
        <Route index element={<Pos />} />
        <Route path="customer" element={<AddCustomerModal />} />
        <Route path="product" element={<AddProduct />} />
        <Route path="product/addproduct" element={<ProductStockForm />} />
        <Route path="dashboard" element={<DashboardComponent />} />
      </Routes>
    </>
  );
}

export default App;
