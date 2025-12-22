import React from "react";
import { Routes, Route } from "react-router";
import Pos from "./pages/POS/POS";
import { AddCustomerModal } from "./pages/Customer/Customer";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route index element={<Pos />} />
        <Route path="customer" element={<AddCustomerModal />} />
      </Routes>
    </>
  );
}

export default App;
