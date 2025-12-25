import React, { useState, useEffect, useRef, Children } from "react";
import Sidebar from "../../components/Sidebar";
import DropdownModal from "../../components/common/Dropdown";
import { RiCloseLargeFill, RiArrowDropDownFill } from "react-icons/ri";
import AdvancedPOSTable from "../../components/addproduct/Table";
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
        <div className="grid mt-5 gap-5 grid-cols-12 px-5 w-full">
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
        </div>
        <div className="px-5 mt-5 flex justify-end">
          <button className="flex bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer">
            <Plus />
            Add Product
          </button>
        </div>
        {/* <div className="border border-gray-400 rounded-sm  m-5 ">
          <div className="flex justify-end gap-5 items-center pr-5 border-b h-15 border-gray-400 ">
            <IconButton>
              <Columns3 />
            </IconButton>
            <IconButton>
              <ListFilter />
            </IconButton>
            <IconButton>
              <ArrowDownToLine />
            </IconButton>
            <IconButton>
              <Search />
            </IconButton>
          </div>
        </div> */}
        <AdvancedPOSTable />
      </div>
    </div>
  );
}

function InputSearch({ placeholder, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const dropdownRef = useRef(null);
  useEffect(() => {
    const clickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => {
      document.removeEventListener("mousedown", clickOutside);
    };
  }, []);
  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          placeholder={placeholder}
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
          }}
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          className="h-10 w-full pl-2  rounded-md border border-gray-400 peer focus:outline-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none hover:border-gray-700"
          type="text"
          id="customer"
        />
        <label
          htmlFor="customer"
          className={`absolute left-3 -top-3 px-1 text-sm bg-white pointer-events-none  text-gray-700 peer-focus:text-blue-500 }`}
        >
          Customer
        </label>
        <div
          onClick={() => {
            !isOpen ? setIsOpen(true) : setIsOpen(false);
          }}
          className={`absolute right-1 top-2 cursor-pointer text-2xl transition-transform duration-200 hover:bg-amber-50 rounded-2xl ${
            isOpen ? "rotate-180" : ""
          } `}
        >
          <RiArrowDropDownFill />
        </div>
        <div
          onClick={() => {
            setSelected("");
          }}
          className={`absolute right-7 top-2 cursor-pointer p-1 transition-all duration-300 ${
            selected ? "" : "hidden"
          } `}
        >
          <RiCloseLargeFill />
        </div>
      </div>

      {isOpen && (
        <div className="absolute h-70 overflow-y-scroll w-full  right-0  bg-gray-100 rounded-md border border-gray-400 mt-1 shadow-md z-10">
          <div className=" w-full   ">
            {options.map((option) => {
              return (
                <h1
                  onClick={() => {
                    setSelected(option.name);
                  }}
                  key={option.id}
                  className="p-1 pl-4 hover:bg-gray-200 cursor-pointer"
                >
                  {option.name}
                </h1>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
function SearchItems({ placeholder, label }) {
  return (
    <div className="relative">
      <input
        placeholder={placeholder}
        onChange={(e) => {}}
        onClick={() => {}}
        className="h-10 w-full pl-2  rounded-md border border-gray-400 peer focus:outline-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none hover:border-gray-700"
        type="text"
        id="customer"
      />
      <label
        htmlFor="customer"
        className={`absolute left-3 -top-3 px-1 text-sm bg-white pointer-events-none  text-gray-700 peer-focus:text-blue-500 }`}
      >
        {label}
      </label>
    </div>
  );
}
export default AddProduct;
