import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Link } from "react-router";
import { RiHome9Fill } from "react-icons/ri";
import { MdOutlineAddCircleOutline, MdDeleteOutline } from "react-icons/md";
import { FiMinusCircle } from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
import { useProductStore } from "../../store/product-store";
import { useCartStore } from "../../store/cart-store";
export function PurchasesOrder() {
  const [searchProducts, setSearchProducts] = useState("");
  const [searchSuppliers, setSearchSuppliers] = useState("");
  const { cart, addToCart } = useCartStore();
  const { products } = useProductStore();
  const filteredProducts = products.filter((item) =>
    item.product_name
      .toLowerCase()
      .includes(searchProducts.toLowerCase() || ""),
  );
  const [showSupplierSearch, setShowSupplierSearch] = useState(true);
  const [showSupplier, setShowSupplier] = useState({});
  const [suppliers, setSupplier] = useState([
    {
      name: "ezPos",
    },
  ]);
  const filteredSuppliers = suppliers.filter((item) =>
    item.name.toLowerCase().includes(searchSuppliers.toLowerCase() || ""),
  );
  console.log(suppliers);
  return (
    <div className="h-screen overflow-hidden grid grid-cols-11">
      {/* Sidebar */}
      <div className="col-span-2">
        <Sidebar />
      </div>
      {/* product_show */}
      <div className="col-span-5">
        {/* Products Headers */}
        <div className=" flex text-black-200  rounded-md mx-5 mt-2  bg-zuccini-400  h-17 sticky top-1 ">
          <div className=" flex justify-between  items-center w-full   ">
            <Link to="/dashboard">
              <h1 className="text-xl   pl-3 pr-3 ">myPos</h1>
            </Link>
            <input
              onChange={(e) => {
                setSearchProducts(e.target.value);
              }}
              className="flex-1 border  h-10 pl-2 rounded-md  "
              type="text"
              placeholder="Search Product..."
            />
            <Link to="/dashboard">
              <button className="text-4xl   pl-3 pr-3 cursor-pointer  ">
                <RiHome9Fill />
              </button>
            </Link>
          </div>
        </div>
        {/* products list  */}
        <div className="h-[calc(100vh-4.25rem)]">
          <div className=" h-full overflow-scroll  no-scrollbar bg-zuccini-50">
            <div className=" grid grid-cols-3  gap-1 p-5">
              {filteredProducts.map((product) => {
                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (product.quantity <= 0) return;
                      addToCart(product);
                    }}
                    className={`select-none relative h-60 bg-zuccini-300 rounded-sm flex flex-col items-center justify-between py-2 
  ${
    product.quantity <= 0 ? "cursor-not-allowed opacity-60" : "cursor-pointer"
  }`}
                  >
                    {product.quantity <= 0 && (
                      <div className="absolute inset-0 bg-black/50 rounded-sm flex items-center justify-center text-white text-xl">
                        Stock Out
                      </div>
                    )}
                    <img
                      className="h-20 rounded-sm "
                      src={product.image}
                      alt=""
                    />
                    <h2 className="text-center">{product.product_name}</h2>
                    <p className=" ">{product.category}</p>
                    <h1 className=" ">TK: {product.price}</h1>
                    <p className=" ">Stock: {product.quantity}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* purchases cart */}
      <div className=" col-span-4">
        {/* cart header */}
        <div className="px-5 gap-4 grid grid-cols-12  items-center bg-zuccini-400   h-17 rounded-md mx-2 mt-2 sticky top-1 ">
          <div className="relative  col-span-4">
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
          <div className="join col-span-8 grid grid-cols-2">
            <input
              defaultChecked
              className="join-item btn"
              type="radio"
              name="options"
              aria-label="From Supplier"
            />
            <input
              className="join-item btn"
              type="radio"
              name="options"
              aria-label="Walk-in/Own Buy"
            />
          </div>
        </div>
        {/* purchases items */}
        <div className="h-[calc(100vh-4.25rem)]">
          <div className="h-full overflow-scroll  no-scrollbar bg-zuccini-50">
            {/* suppliers info */}
            <div className="my-2 px-2">
              <h6 className="mb-2">Suppliers*</h6>
              {showSupplierSearch && (
                <div className="dropdown dropdown-center w-full">
                  <label tabIndex={0} className="input w-full">
                    <svg
                      className="h-[1em] opacity-50"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <g
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                        fill="none"
                        stroke="currentColor"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                      </g>
                    </svg>
                    <input
                      onChange={(e) => {
                        setSearchSuppliers(e.target.value);
                      }}
                      className="w-full"
                      type="search"
                      required
                      placeholder="Search"
                    />
                  </label>
                  <ul
                    tabIndex="-1"
                    className="dropdown-content menu bg-base-100 rounded-box z-1 w-full p-2 shadow-sm max-h-50 overflow-y-scroll flex flex-row "
                  >
                    {filteredSuppliers.map((sup, i) => (
                      <li
                        key={i}
                        className="w-full"
                        onClick={() => {
                          setShowSupplierSearch(false);
                          setShowSupplier(sup.name);
                        }}
                      >
                        <a>{sup.name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!showSupplierSearch && (
                <div className="border border-gray-400 rounded h-8 flex items-center bg-zuccini-50 p-2 justify-between">
                  <h1>Supplier: {showSupplier}</h1>
                  <button
                    onClick={() => {
                      setShowSupplierSearch(true);
                    }}
                    className="hover:cursor-pointer active:text-red-500 transition-colors duration-100 "
                  >
                    x
                  </button>
                </div>
              )}
            </div>
            {/* cartitem */}
            {cart.map((items) => {
              return (
                <div
                  key={items.id}
                  className="h-20 m-2 bg-zuccini-300 rounded-xl flex items-center select-none"
                >
                  <div className="flex items-center w-full justify-between">
                    <img
                      className="h-20 w-20  rounded-xl "
                      src={items.image}
                      alt=""
                    />
                    <div className="flex-1 pl-5">
                      <h1>{items.product_name}</h1>
                      <p>
                        {Number(items.price).toFixed(2)} ×{" "}
                        {Number(items.sold_quantity)} ={" "}
                        {(
                          Number(items.price) * Number(items.sold_quantity)
                        ).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex text-2xl gap-x-4 items-center pr-5  ">
                      <div onClick={() => {}} className="cursor-pointer">
                        <FiMinusCircle />
                      </div>
                      <span onClick={() => {}} className="">
                        <input
                          type="number"
                          className="h-7 w-11 border"
                          defaultValue={items.sold_quantity}
                          autoFocus
                        />
                      </span>
                      <div onClick={() => {}} className="cursor-pointer">
                        <MdOutlineAddCircleOutline />
                      </div>
                      <div className="cursor-pointer" onClick={() => {}}>
                        <MdDeleteOutline />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
