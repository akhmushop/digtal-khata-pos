import React, { useState, useRef, useEffect } from "react";
import {
  RiUserAddFill,
  RiCloseLargeFill,
  RiArrowDropDownFill,
} from "react-icons/ri";
export function CartHeader() {
  const [saveCustomer, setSaveCustomer] = useState(() => {"walk-in customer"
    try {
      const savedCustomer = localStorage.getItem("customer");
      return savedCustomer ? JSON.parse(savedCustomer) : [{ name: "walk-in customer", mobile: "" }];
    } catch {
      return [{ name: "walk-in customer", mobile: "" }];
    }
  });

  const [showCustomer, setShowCustomer] = useState(false);
  const [inputValue, setInputValue] = useState(saveCustomer[0].name);
  
  const [hovered, setHovered] = useState(false);
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
      <div className="px-5 gap-4 flex items-center  bg-zuccini-400  justify-around  h-17 mb-3 rounded-md mx-2 mt-2 sticky top-1">
        <div className="relative w-full">
          <input
            id="date"
            className="h-10 pl-2 rounded-md border peer w-full   "
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
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative w-full"
          ref={inputRef}
        >
          <div className="relative">
            <input
              placeholder=""
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
              onClick={() => {
                setShowCustomer(!showCustomer);
              }}
              className="h-10 pl-2 rounded-md border peer w-full  "
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
            <div
              onClick={() => {
                !showCustomer ? setShowCustomer(true) : setShowCustomer(false);
              }}
              className={`absolute right-1 top-2 cursor-pointer text-2xl transition-all duration-300 hover:bg-amber-50 rounded-2xl ${
                showCustomer ? "rotate-180" : "rotate-0"
              } `}
            >
              <RiArrowDropDownFill />
            </div>
            <div
              onClick={() => {
                setInputValue("");
              }}
              className={`absolute right-7 top-2 cursor-pointer p-1 transition-all duration-300 hover:bg-amber-50 rounded-2xl ${
                hovered ? "" : "hidden"
              } `}
            >
              <RiCloseLargeFill />
            </div>
          </div>

          <div
            className={` absolute h-70 overflow-y-scroll w-full  right-0  bg-gray-200 rounded-md border border-gray-400  ${
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

      </div>
    </>
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
