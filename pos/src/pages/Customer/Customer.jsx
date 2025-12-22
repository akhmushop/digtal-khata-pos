import React, { useState, useEffect } from "react";
import { RiUserAddFill, RiCloseLargeFill } from "react-icons/ri";
import Sidebar from "../../components/Sidebar";
export function AddCustomerModal() {
  const [addCustomer, setAddCustomer] = useState(false);
    const [saveCustomer, setSaveCustomer] = useState(() => {"walk-in customer"
      try {
        const savedCustomer = localStorage.getItem("customer");
        return savedCustomer ? JSON.parse(savedCustomer) : [{ name: "walk-in customer", mobile: "" }];
      } catch {
        return [{ name: "walk-in customer", mobile: "" }];
      }
    });

  return (
    <div className="flex">
    <Sidebar />
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

      {addCustomer && (
        <AddCustomer
          onClose={() => setAddCustomer(false)}
          saveCustomer={saveCustomer}
          setSaveCustomer={setSaveCustomer}
        />
      )}
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
