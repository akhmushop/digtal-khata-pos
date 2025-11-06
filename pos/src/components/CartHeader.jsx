import React, { useState, useRef, useEffect } from "react";
import { RiUserAddFill } from "react-icons/ri";
import { customer } from "../data/customers";
export function CartHeader() {
  const [showCustomer, setShowCustomer] = useState(false);
  const [inputValue, setInputValue] = useState(customer[0]);
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
    <div className="flex items-center  bg-gray-300  justify-around  h-17 ">
      <div className="relative">
        <input
          id="date"
          className="h-10 pl-2 rounded-md border peer  "
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
        />
        <label
          htmlFor="date"
          className="absolute -top-3 left-3 bg-gray-300 peer-focus:text-blue-500 text-sm"
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
                ? "-top-4 text-sm text-blue-500 bg-gray-300"
                : "peer-focus:-top-4 peer-placeholder-shown:text-gray-400 peer-focus:text-blue-500 peer-focus:text-sm bg-gray-300 "
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
            {customer.map((name, index) => {
              return (
                <h1
                  onClick={() => {
                    setInputValue(name);
                  }}
                  key={index}
                  className="border-b p-1 pl-4  hover:bg-gray-100 cursor-pointer"
                >
                  {name}
                </h1>
              );
            })}
          </div>
        </div>
      </div>
      <div>
        <button className="text-4xl   cursor-pointer">
          <RiUserAddFill />
        </button>
      </div>
    </div>
  );
}
