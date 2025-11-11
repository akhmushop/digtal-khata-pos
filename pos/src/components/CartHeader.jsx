import React, { useState, useRef, useEffect } from "react";
import { RiUserAddFill , RiCloseLargeFill  } from "react-icons/ri";
import { customer } from "../data/customers";
export function CartHeader() {
  const [saveCustomer, setSaveCustomer] = useState(() => {
    try {
      const savedCustomer = localStorage.getItem("customer");
      return savedCustomer ? JSON.parse(savedCustomer) : [];
    } catch {
      return [];
    }
  });

  const [showCustomer, setShowCustomer] = useState(false);
  const [inputValue, setInputValue] = useState(customer[0].name);
  const [addCustomer, setAddCustomer] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    const clickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowCustomer(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => {
      document.removeEventListener("mousedown", clickOutside);
    };
  }, []);
  return (
    <>
      <div className="flex items-center  bg-zuccini-400  justify-around  h-17 mb-3 rounded-md mx-2 mt-2 sticky top-1">
        <div className="relative">
          <input
            id="date"
            className="h-10 pl-2 rounded-md border peer  "
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
          />
          <label
            htmlFor="date"
            className="absolute -top-3 left-3 bg-zuccini-400 peer-focus:text-blue-500 text-sm"
          >
            Date
          </label>
        </div>
        <div className="relative" ref={inputRef}>
          <div className="relative ">
            <input
              placeholder=""
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
              onClick={() => {
                setShowCustomer(!showCustomer);
              }}
              className="h-10 pl-2 rounded-md border peer  "
              type="text"
              id="customer"
            />
            <label
              htmlFor="customer"
              className={`absolute left-3 mt-1  text-lg transition-all pointer-events-none ${
                inputValue
                  ? "-top-4 text-sm text-blue-500 bg-zuccini-400"
                  : "peer-focus:-top-4 peer-placeholder-shown:text-gray-700 peer-focus:text-blue-500 peer-focus:text-sm bg-zuccini-400 "
              }
                  `}
            >
              Customer
            </label>
          </div>

          <div
            className={` absolute h-100 w-full  right-0  bg-gray-200 rounded-md border border-gray-400 ${
              !showCustomer && "hidden"
            }   `}
          >
            <div className=" w-full   ">
              {saveCustomer.map((customer, index) => {
                return (
                  <h1
                    onClick={() => {
                      setInputValue(customer.name);
                    }}
                    key={index}
                    className="border-b p-1 pl-4  hover:bg-gray-100 cursor-pointer"
                  >
                    {customer.name}
                  </h1>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          <button
            onClick={() => {
              !addCustomer ? setAddCustomer(true) : setAddCustomer(false);
            }}
            className="text-4xl   cursor-pointer"
          >
            <RiUserAddFill />
          </button>
        </div>
      </div>
      {addCustomer && (
        <AddCustomer
          onClose={() => setAddCustomer(false)}
          saveCustomer={saveCustomer}
          setSaveCustomer={setSaveCustomer}
        />
      )}
    </>
  );
}
function AddCustomer({ saveCustomer, setSaveCustomer, onClose }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const handelAddCustomer = () => {
    if (!name.trim()) alert("Enter your Name");
    const newCustomer = { name, mobile };
    setSaveCustomer((prev) => [...prev, newCustomer]);
    setName("");
    setMobile("");
    setTimeout(onClose(), 300);
  };
  useEffect(() => {
    localStorage.setItem("customer", JSON.stringify(saveCustomer));
  }, [saveCustomer]);
  return (
    <div className="h-95 re bg-zuccini-50 w-80 rounded-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300">
      <div className="flex flex-col items-center justify-center h-full ">
      <button onClick={()=>{
        onClose()
      }} className="cursor-pointer text-2xl absolute right-2 top-2 hover:bg-red-400 transition-all duration-300"><RiCloseLargeFill /></button>

        <h1 className="text-xl">Customer Information</h1>
        <PeerFocusInput
          placeholder={"Name"}
          id={"name"}
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <PeerFocusInput
          placeholder={"Mobile Number"}
          id={"name"}
          onChange={(e) => setMobile(e.target.value)}
          value={mobile}
        />
        <button
          onClick={() => {
            handelAddCustomer();
            setTimeout(onClose, 300);
          }}
          className="border h-10 px-4 bg-red-400 text-white cursor-pointer hover:bg-red-500 transition duration-300 rounded"
        >
          Add Customer
        </button>
      </div>
    </div>
  );
}
function PeerFocusInput({ placeholder, id, onChange, value }) {
  return (
    <div className="relative ">
      <input
        placeholder=""
        value={value}
        onChange={onChange}
        type="text"
        className="border my-5 h-10 peer rounded  focus:outline-blue-500"
        id={id}
      />
      <label
        htmlFor={id}
        className={` absolute  transition-all pointer-events-none ${
          value
            ? "top-2 left-3 text-blue-500 bg-zuccini-50 border-blue-500"
            : "peer-focus:top-2 peer-placeholder-shown:text-gray-700 peer-focus:text-blue-500 peer-focus:text-sm peer-focus:bg-zuccini-50  text-sm left-3 top-7"
        }`}
      >
        {placeholder}
      </label>
    </div>
  );
}
