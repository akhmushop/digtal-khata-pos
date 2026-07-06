import React, { useState, useEffect } from "react";
import { RiUserAddFill, RiCloseLargeFill } from "react-icons/ri";
import Sidebar from "../../components/Sidebar.js";
import { useCustomerStore } from "../../store/customer-store.js";
export function AddCustomerModal({}) {
  const { customerInfo, handleOnchange, resetCustomerInfo, handleAddCustomer } =
    useCustomerStore();
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-2">
        <Sidebar />
      </div>
      <div className="col-span-10">
        <h1 className="text-3xl">Add Customer</h1>
        <div className="grid grid-cols-4 w-full gap-3 pr-10">
          <fieldset className="fieldset w-full col-span-2 ">
            <legend className="fieldset-legend">Enter your Name</legend>
            <input
              id="name"
              value={customerInfo.name}
              onChange={handleOnchange}
              type="text"
              className="input w-full"
              placeholder="Name"
            />
          </fieldset>
          <fieldset className="fieldset w-full col-span-2">
            <legend className="fieldset-legend">Enter your Phone Number</legend>
            <input
              id="phone"
              value={customerInfo.phone}
              onChange={handleOnchange}
              type="text"
              className="input w-full"
              placeholder="Number"
              maxLength={11}
            />
          </fieldset>
          <fieldset className="fieldset w-full col-span-4">
            <legend className="fieldset-legend">Enter your Address</legend>
            <input
              id="address"
              value={customerInfo.address}
              onChange={handleOnchange}
              type="text"
              className="input w-full"
              placeholder="Address"
            />
          </fieldset>
          <div className="col-start-4 col-end-5 grid grid-cols-3 gap-3">
            <button
              onClick={() => {
                resetCustomerInfo();
              }}
              className="btn btn-warning col-span-1"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCustomer}
              className="btn btn-success col-span-2"
            >
              Add Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AddCustomer({
  handleOnchange,
  customerInfo,
  handleAddCustomer,
  setIsOpenCustomerModal,
  resetCustomerInfo,
}) {
  const [animation, setAnimation] = useState(false);

  useEffect(() => {
    setAnimation(true);
  }, []);
  const handleClose = () => {
    setAnimation(false);
    setTimeout(() => {
      setIsOpenCustomerModal(false);
    }, 300);
  };
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 
        transition-opacity duration-300 ${
          animation ? "opacity-100" : "opacity-0"
        }`}
      onClick={handleClose}
    >
      <div
        className={` bg-zuccini-50 w-140 rounded-md  transition-transform duration-300 p-5 ${
          animation ? "scale-100" : "scale-90"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="">
          <button
            onClick={handleClose}
            className="cursor-pointer text-2xl absolute right-2 top-2 hover:bg-red-400 hover:text-white transition-all duration-300"
          >
            <RiCloseLargeFill />
          </button>

          <h1 className="text-xl">Customer Information</h1>
          <div className="w-full grid grid-cols-2 gap-5 ">
            {" "}
            <PeerFocusInput
              colSpan={"col-span-1"}
              placeholder={"Name"}
              id={"name"}
              value={name}
              handleOnchange={handleOnchange}
              value={customerInfo.name}
            />
            <PeerFocusInput
              colSpan={"col-span-1"}
              placeholder={"Mobile Number"}
              id={"phone"}
              handleOnchange={handleOnchange}
              value={customerInfo.phone}
            />
            <PeerFocusInput
              colSpan={"col-span-2"}
              placeholder={"Address"}
              id={"address"}
              handleOnchange={handleOnchange}
              value={customerInfo.address}
            />
            <div className="col-start-2 col-end-3 w-full flex gap-2 justify-end">
              <button
                onClick={() => {
                  resetCustomerInfo();
                  handleClose();
                }}
                className="btn btn-warning "
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAddCustomer();
                  handleClose();
                }}
                className="btn btn-success"
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PeerFocusInput({ placeholder, id, handleOnchange, value, colSpan }) {
  return (
    <div className={`relative ${colSpan} `}>
      <input
        placeholder=""
        value={value}
        onChange={handleOnchange}
        type="text"
        className={`w-full border my-5 h-10 peer rounded  focus:outline-blue-500 pl-3  `}
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
