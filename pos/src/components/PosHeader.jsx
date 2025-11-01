import React, { useState, useRef, useEffect } from "react";
import { RiHome9Fill, RiUserAddFill } from "react-icons/ri";
export function PosHeader() {
  const [showCustomer, setShowCustomer] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);
  const customer = ["Shajedul islam arif", "John Doe", "Jane Smith"];
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
      <div className="w-full ">
        <div className="grid grid-cols-6 h-17 ">
          {/* Header Left Section */}
          <div className="grid text-black-200   text-white border-b border-gray-700 bg-indigo-500  col-span-4  ">
            <div className="flex justify-around  items-center   ">
              <h1 className="text-xl   pl-3 pr-3 ">myPos</h1>
              <input
                className="border  h-10 pl-2 rounded-md flex-1 max-w-2xl "
                type="text"
                placeholder="Search Product..."
              />
              <button className="text-4xl   pl-3 pr-3 cursor-pointer  ">
                <RiHome9Fill />
              </button>
            </div>
          </div>

          {/* Header Right Section */}
          <div className="flex items-center col-span-2    bg-gray-300  justify-around  ">
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
        </div>
      </div>
    </>
  );
}
 function PosProduct(){
  return <div>PosProduct</div>;
}
<PosProduct />
