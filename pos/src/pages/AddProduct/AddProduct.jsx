import React, { useState, useEffect, useRef, Children } from "react";
import Sidebar from "../../components/Sidebar";
import AdvancedPOSTable from "../../components/addproduct/Table";
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
