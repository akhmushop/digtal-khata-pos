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
  const [addCustomer, setAddCustomer] = useState(false);
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
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative"
          ref={inputRef}
        >
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
        transition-opacity duration-300 ${animation ? "opacity-100" : "opacity-0"}`}
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
