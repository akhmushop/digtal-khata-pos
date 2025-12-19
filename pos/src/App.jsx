import React from "react";
import { Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import { AddCustomerModal } from "./pages/AddCustomerPage";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="customer" element={<AddCustomerModal />} />
      </Routes>
    </>
  );
}

export default App;
