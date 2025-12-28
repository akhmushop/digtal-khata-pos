import React, { useState, useEffect, useRef, Children } from "react";
import Sidebar from "../../components/Sidebar";
import { Link } from "react-router";
import DropdownModal from "../../components/common/Dropdown";
import { RiCloseLargeFill, RiArrowDropDownFill } from "react-icons/ri";
import AdvancedPOSTable from "../../components/addproduct/Table";
import ProductStockForm from "./Addproductfrom";
import FilterBar from "../../components/addproduct/FilterBar";
import {
  Plus,
  Columns3,
  ListFilter,
  ArrowDownToLine,
  Search,
} from "lucide-react";
function AddProduct() {
  const storeOptions = [
    { id: 1, name: "All" },
    { id: 2, name: "Shop1" },
    { id: 3, name: "Shop2" },
    { id: 4, name: "Shop3" },
  ];
  const statusOptions = [
    { id: 1, name: "Active" },
    { id: 2, name: "Inactive" },
    { id: 3, name: "Alert" },
    { id: 4, name: "Out of Stock" },
  ];
  const supplierOptions = [
    { id: 1, name: "Active" },
    { id: 2, name: "Inactive" },
    { id: 3, name: "Alert" },
    { id: 4, name: "Out of Stock" },
  ];
  const IconButton = ({ children, onClick }) => (
    <button
      onClick={onClick}
      className="p-1 rounded hover:bg-gray-100 cursor-pointer"
    >
      {children}
    </button>
  );
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col w-full">
        {/* <div className="grid mt-5 gap-5 grid-cols-12 px-5 w-full">
          <div className="col-span-2">
            <DropdownModal options={storeOptions} label={"Store"} />
          </div>
          <div className="col-span-3">
            <InputSearch
              placeholder={"Select a supplier"}
              options={supplierOptions}
            />
          </div>
          <div className="col-span-2">
            <DropdownModal options={statusOptions} label={"Status"} />
          </div>
          <div className="col-span-2">
            <SearchItems placeholder={"Alert Qty"} label={"Alert Qty"} />
          </div>
          <div className="col-span-3">
            <SearchItems placeholder={"Search"} label={"Barcode or Name"} />
          </div>
        </div> */}
        <FilterBar />
        <div className="px-6 my-6">
          <div className="flex justify-end">
            <Link to={"addproduct"}>
              <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium text-sm rounded-xl hover:from-emerald-700 hover:to-emerald-600 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-emerald-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 group">
                <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/25 transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <span>Add New Product</span>
              </button>
            </Link>
          </div>
        </div>
        <AdvancedPOSTable />
      </div>
    </div>
  );
}


export default AddProduct;
