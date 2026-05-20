import React, { useState, useRef, useEffect } from "react";
import { RiCloseLargeFill, RiArrowDropDownFill } from "react-icons/ri";
import { useCustomerStore } from "../../store/customer-store";
export function CartHeader() {
  const [inputValue, setInputValue] = useState("");
  const [checked, setChecked] = useState(true);
  return (
    <>
      <div className="px-5 gap-4 grid grid-cols-12  items-center bg-zuccini-400   h-17 rounded-md mx-2 mt-2 sticky top-1">
        <div className="relative  col-span-3">
          <input
            id="date"
            className="h-10 pl-2 rounded-md border peer w-full "
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
        <DropdownModal
          inputValue={inputValue}
          setInputValue={setInputValue}
          setChecked={setChecked}
        />
        <div className="flex gap-1 col-span-3 items-center">
          <input
            type="checkbox"
            onChange={(e) => {
              setChecked(e.target.checked);
            }}
            checked={checked}
            className="checkbox checkbox-neutral checkbox-sm"
          />
          <p>Walk-in Customer</p>
        </div>
      </div>
    </>
  );
}
function DropdownModal({ inputValue, setInputValue, setChecked }) {
  const { customers } = useCustomerStore();
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const [showCustomer, setShowCustomer] = useState(true);

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
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full col-span-6"
      ref={inputRef}
    >
      <div className="relative">
        <input
          placeholder=""
          value={inputValue}
          onChange={(e) => {
            const { value } = e.target;
            setInputValue(value);
            if (value === "") {
              setChecked(true);
            }
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
            setChecked(true);
          }}
          className={`absolute right-7 top-2 cursor-pointer p-1 transition-all duration-300 hover:bg-amber-50 rounded-2xl ${
            hovered ? "" : "hidden"
          } `}
        >
          <RiCloseLargeFill />
        </div>
      </div>

      <div
        className={` absolute max-h-40 overflow-y-scroll no-scrollbar w-full  right-0  ${
          !showCustomer && "hidden"
        }   `}
      >
        <div className=" w-full">
          {filteredCustomers.map((customer, index) => {
            return (
              <h1
                onClick={() => {
                  setInputValue(customer.name);
                  setChecked(false);
                  setShowCustomer(false);
                }}
                key={index}
                className="border-b p-1 pl-4  hover:bg-gray-100 cursor-pointer bg-gray-200 rounded-md border border-gray-400 my-0.5"
              >
                {customer.name}
              </h1>
            );
          })}
        </div>
      </div>
    </div>
  );
}
