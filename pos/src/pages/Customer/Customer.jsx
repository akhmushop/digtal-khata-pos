import React, { useState, useEffect } from "react";
import { RiUserAddFill, RiCloseLargeFill } from "react-icons/ri";
import Sidebar from "../../components/Sidebar";
import { useCustomerStore } from "../../store/customer-store";
export function AddCustomerModal() {
  const { addCustomer, customers } = useCustomerStore();
  const initialCustomerInfo = {
    name: "",
    phone: "",
    address: "",
  };
  const [customerInfo, setCustomerInfo] = useState(initialCustomerInfo);
  const handleOnchange = (e) => {
    const { id, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [id]: id === "phone" ? value.replace(/\D/g, "").slice(0, 11) : value,
    }));
  };
  const handleAddCustomer = () => {
    if (customerInfo.name === "" || customerInfo.phone === "") {
      window.alert("Please fill all required fields");
      return;
    }
    if (window.confirm("do you want to add customer")) {
      addCustomer(customerInfo);
      setCustomerInfo(initialCustomerInfo);
    }
  };
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-2">
        <Sidebar />
      </div>
      {/* <div>
        <button
          onClick={() => {
            !addCustomer ? setAddCustomer(true) : setAddCustomer(false);
          }}
          className="text-4xl   cursor-pointer"
        >
          <RiUserAddFill />
        </button>
      </div> */}
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
                setCustomerInfo(initialCustomerInfo);
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

      {/* {addCustomer && (
        <AddCustomer
          onClose={() => setAddCustomer(false)}
          saveCustomer={saveCustomer}
          setSaveCustomer={setSaveCustomer}
        />
      )} */}
    </div>
  );
}

function AddCustomer({ saveCustomer, setSaveCustomer, onClose }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [animation, setAnimation] = useState(false);
  const handelAddCustomer = () => {
    if (!name.trim()) return alert("Enter your Name");
    const newCustomer = { name, mobile };
    setSaveCustomer((prev) => [...prev, newCustomer]);
    setName("");
    setMobile("");
    setAnimation(false);
    setTimeout(onClose, 300);
  };
  useEffect(() => {
    localStorage.setItem("customer", JSON.stringify(saveCustomer));
  }, [saveCustomer]);
  useEffect(() => {
    setAnimation(true);
  }, []);
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 
        transition-opacity duration-300 ${
          animation ? "opacity-100" : "opacity-0"
        }`}
      onClick={() => {
        setAnimation(false);
        setTimeout(onClose, 300);
      }}
    >
      <div
        className={`h-95 re bg-zuccini-50 w-80 rounded-md  transition-transform duration-300 ${
          animation ? "scale-100" : "scale-90"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center justify-center h-full ">
          <button
            onClick={() => {
              setAnimation(false);
              setTimeout(onClose, 300);
            }}
            className="cursor-pointer text-2xl absolute right-2 top-2 hover:bg-red-400 hover:text-white transition-all duration-300"
          >
            <RiCloseLargeFill />
          </button>

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
            }}
            className="border h-10 px-4 bg-red-400 text-white cursor-pointer hover:bg-red-500 transition duration-300 rounded"
          >
            Add Customer
          </button>
        </div>
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
