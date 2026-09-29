import { AddCustomer } from "@/pages/Customer/Customer";
import { useCustomerStore } from "@/store/useCustomerStore";
import React, { useState, useRef, useEffect } from "react";
import {
  RiCloseLargeFill,
  RiArrowDropDownFill,
  RiUserAddFill,
} from "react-icons/ri";
export function CartHeader() {
  const {
    customerInfo,
    handleOnchange,
    resetCustomerInfo,
    handleAddCustomer,
    resetShowCustomerInfo,
  } = useCustomerStore();
  const [isOpenCustomerModal, setIsOpenCustomerModal] = useState(false);
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
          setChecked={setChecked}
          setIsOpenCustomerModal={setIsOpenCustomerModal}
        />
        <div className="flex gap-1 col-span-3 items-center">
          <input
            type="checkbox"
            onChange={(e) => {
              setChecked(e.target.checked);
              if (!checked) {
                resetShowCustomerInfo();
              }
            }}
            checked={checked}
            className="checkbox checkbox-neutral checkbox-sm"
          />
          <p>Walk-in Customer</p>
        </div>
      </div>
      {isOpenCustomerModal && (
        <AddCustomer
          handleOnchange={handleOnchange}
          customerInfo={customerInfo}
          handleAddCustomer={handleAddCustomer}
          setIsOpenCustomerModal={setIsOpenCustomerModal}
          resetCustomerInfo={resetCustomerInfo}
        />
      )}
    </>
  );
}
type DropdownModalProps = {
  setChecked: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOpenCustomerModal: React.Dispatch<React.SetStateAction<boolean>>;
};
function DropdownModal({
  setChecked,
  setIsOpenCustomerModal,
}: DropdownModalProps) {
  const {
    customers,
    customerInputValue,
    handleInputChange,
    setShowCustomerInfo,
    resetShowCustomerInfo,
  } = useCustomerStore();
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(customerInputValue.name.toLowerCase()),
  );

  const [showCustomer, setShowCustomer] = useState(false);

  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const clickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
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
          value={customerInputValue.name}
          onChange={(e) => {
            handleInputChange(e, setChecked);
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
            customerInputValue.name
              ? "-top-4 text-sm text-blue-500 bg-zuccini-400"
              : "peer-focus:-top-4 peer-placeholder-shown:text-gray-700 peer-focus:text-blue-500 peer-focus:text-sm bg-zuccini-400 "
          }
                  `}
        >
          Customer
        </label>
        <div className="flex absolute items-center top-1.5 right-2 ">
          {/* close icon */}
          <div
            onClick={() => {
              resetShowCustomerInfo();
              setChecked(true);
            }}
            className={` cursor-pointer p-1 transition-all duration-300 hover:bg-amber-50 rounded-2xl ${
              hovered ? "" : "hidden"
            } `}
          >
            <RiCloseLargeFill />
          </div>
          {/* dropdown arrow */}
          <div
            onClick={() => {
              !showCustomer ? setShowCustomer(true) : setShowCustomer(false);
            }}
            className={` cursor-pointer text-2xl transition-all duration-300 hover:bg-amber-50 rounded-2xl ${
              showCustomer ? "rotate-180" : "rotate-0"
            } `}
          >
            <RiArrowDropDownFill />
          </div>

          {/* add icon */}
          <div className="">
            <button
              onClick={() => {
                setIsOpenCustomerModal(true);
              }}
              className="text-2xl   cursor-pointer"
            >
              <RiUserAddFill />
            </button>
          </div>
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
                  setShowCustomerInfo(customer);
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
