import React, { useState, useEffect, useRef, Children } from "react";
import Sidebar from "../../components/Sidebar.js";
import AdvancedPOSTable from "../../components/addproduct/Table.js";
function AddProduct() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col w-full">
        <AdvancedPOSTable />
      </div>
    </div>
  );
}

export default AddProduct;
