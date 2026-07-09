import React, { useState } from "react";
import Sidebar from "../../components/Sidebar.js";
import { Link } from "react-router";
import { RiHome9Fill } from "react-icons/ri";
import { MdOutlineAddCircleOutline, MdDeleteOutline } from "react-icons/md";
import { FiMinusCircle } from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
import { useProductStore } from "../../store/product-store.js";
import axios from "../../axios.js";
import type { PurchaseCart, Suppliers } from "../../types/purchases-types.js";
import type { ProductsTypes } from "../../types/products-types.js";
export function PurchasesOrder() {
  const [searchProducts, setSearchProducts] = useState("");
  const [searchSuppliers, setSearchSuppliers] = useState("");
  const [purchasesCart, setPurchasesCart] = useState<PurchaseCart[]>([]);
  const { products } = useProductStore();
  const filteredProducts = products.filter((item) =>
    item.product_name
      .toLowerCase()
      .includes(searchProducts.toLowerCase() || ""),
  );
  const [showSupplierSearch, setShowSupplierSearch] = useState(true);
  const [showSupplier, setShowSupplier] = useState<Suppliers | null>(null);
  const [suppliers, setSupplier] = useState([
    {
      name: "ezPos",
    },
  ]);
  const filteredSuppliers = suppliers.filter((item) =>
    item.name.toLowerCase().includes(searchSuppliers.toLowerCase() || ""),
  );
  const handleAddPurchase = (product: ProductsTypes) => {
    if (product.quantity <= 0) return;
    setPurchasesCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);

      if (exists) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, purchaseQty: p.purchaseQty + 1 } : p,
        );
      }
      return [...prev, { ...product, purchaseQty: 1 }];
    });
  };
  const estGrandPurchaseTotal = purchasesCart.reduce(
    (sum, item) => sum + item.purchaseQty * item.cost,
    0,
  );
  const [purchasesCartNotes, setPurchasesCartNotes] = useState("");
  const handleOnchange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    purchaseProduct: ProductsTypes,
  ) => {
    const { value, id } = e.target;
    if (id === "notes") {
      return setPurchasesCartNotes(value);
    }
    setPurchasesCart((prev) => {
      return prev.map((p) => {
        if (p.id !== purchaseProduct.id) return p;
        switch (id) {
          case "orderedQty":
            return {
              ...p,
              purchaseQty: Math.max(1, Number(value)),
            };
          case "estPrice":
            return {
              ...p,
              cost: Number(value),
            };
          default:
            return p;
        }
      });
    });
  };
  const handleCreatePurchaseOrder = async () => {
    if (showSupplier === null) {
      alert("add supplier");
      return;
    }
    if (purchasesCart.length === 0) {
      alert("add purchase product");
      return;
    }
    if (!window.confirm("Do you want to create Purchase")) return;

    const updated = {
      purchasesCart,
      final_total: estGrandPurchaseTotal,
      supplier: showSupplier,
      notes: purchasesCartNotes,
    };
    axios.post("/purchases", updated);
    setPurchasesCart([]);
  };
  return (
    <div className="h-screen overflow-hidden grid grid-cols-12">
      {/* Sidebar */}
      <div className="col-span-2">
        <Sidebar />
      </div>
      {/* product_show */}
      <div className="col-span-4">
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
                      handleAddPurchase(product);
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
      <div className=" col-span-6">
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
                <div className="dropdown w-full">
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
                    tabIndex={-1}
                    className="dropdown-content bg-base-100 rounded-box z-1 w-full p-2 shadow-sm max-h-50 overflow-y-scroll"
                  >
                    {filteredSuppliers.map((sup, i) => (
                      <li
                        key={i}
                        className="w-full my-1 p-1 hover:bg-gray-100 active:bg-gray-800 active:text-white rounded hover:cursor-pointer"
                        onClick={() => {
                          setShowSupplierSearch(false);
                          setShowSupplier(sup);
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
                  <h1>Supplier: {showSupplier?.name}</h1>
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
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 m-2">
              <table className="table">
                {/* head */}
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Unit</th>
                    <th>Ordered Qty</th>
                    <th>Est Price</th>
                    <th>Est Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchasesCart.map((pur, i) => (
                    <tr key={pur.id}>
                      <th>{i + 1}</th>
                      <td>{pur.product_name}</td>
                      <td>{pur.product_type}</td>
                      <td>{pur.product_unit}</td>
                      {/* ordered qty */}
                      <td>
                        <input
                          id="orderedQty"
                          onChange={(e) => {
                            handleOnchange(e, pur);
                          }}
                          onFocus={(e) => {
                            e.target.select();
                          }}
                          value={pur.purchaseQty}
                          className="w-full input"
                          type="number"
                        />
                      </td>
                      {/* est price */}
                      <td>
                        <input
                          id="estPrice"
                          onChange={(e) => {
                            handleOnchange(e, pur);
                          }}
                          onFocus={(e) => {
                            e.target.select();
                          }}
                          defaultValue={pur.cost}
                          className="w-full input"
                          type="number"
                        />
                      </td>
                      {/* est total */}
                      <td>{(pur.purchaseQty * pur.cost).toFixed(2)}</td>
                      <td>
                        <button
                          onClick={() => {
                            setPurchasesCart((prev) =>
                              prev.filter((p) => p.id !== pur.id),
                            );
                          }}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 hover:cursor-pointer"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* footer area */}
            <div className="m-2">
              {/* nots */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Notes</legend>
                <textarea
                  id="notes"
                  onChange={(e) => {
                    handleOnchange(e, {} as ProductsTypes);
                  }}
                  className="textarea h-24 w-full"
                  placeholder="Add nots for this purchase order..."
                ></textarea>
              </fieldset>
              {/* est. grand Total */}
              <div className="my-2 p-2 bg-zuccini-100">
                <div className="flex justify-between">
                  <h1 className="text-3xl">Est. Grand Total:</h1>{" "}
                  <h1 className="text-3xl">
                    {estGrandPurchaseTotal.toFixed(2)}
                  </h1>
                </div>
                <p className="text-xs">
                  *Price can be adjusted during receiving
                </p>
              </div>
              {/* button */}
              <div className="flex gap-3">
                <button className="btn flex-1 btn-outline btn-primary">
                  Save as Draft
                </button>
                <button className="btn flex-1 btn-outline btn-info">
                  Preview
                </button>
                <button
                  onClick={handleCreatePurchaseOrder}
                  className="btn flex-1 btn-primary"
                >
                  Create Purchase Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
