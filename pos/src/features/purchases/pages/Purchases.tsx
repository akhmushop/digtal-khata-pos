import React, { useState } from "react";
import { Link } from "react-router";
import { RiHome9Fill } from "react-icons/ri";
import axios from "../../../api/axios.js";
import useProductStore from "@/features/products/useProductStore.js";
import {
  ProductType,
  ProductVariantType,
} from "@/features/products/product.schema.js";
import { PurchaseCart } from "@/features/products/product.types.js";
import { ProductCard } from "../components/ProductCard.js";
import { ShowVariants } from "../components/ShowVariants.js";
import { PurchaseTable } from "../components/PurchaseTable.js";
export function PurchasesOrder() {
  const [searchProducts, setSearchProducts] = useState("");
  const [searchSuppliers, setSearchSuppliers] = useState("");
  const [purchasesCart, setPurchasesCart] = useState<PurchaseCart[]>([]);
  const { products } = useProductStore();
  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(searchProducts.toLowerCase() || ""),
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
  const handleAddPurchase = (product: ProductType) => {
    const variant = product.variants[0];
    if (!variant) {
      return;
    }
    setPurchasesCart((prev) => {
      const exists = prev.find((p) =>
        p.variants.some((v) => v.id === variant.id),
      );

      if (exists) {
        return prev.map((item) =>
          item.variants.some((v) => v.id === variant.id)
            ? { ...item, purchaseQty: item.purchaseQty + 1 }
            : item,
        );
      }
      return [
        ...prev,
        { ...product, variants: [variant], purchaseQty: 1, purchasePrice: 0 },
      ];
    });
  };
  const estGrandPurchaseTotal = purchasesCart.reduce(
    (sum, v) => sum + v.purchaseQty * v.purchasePrice,
    0,
  );
  const [purchasesCartNotes, setPurchasesCartNotes] = useState("");
  const handleOnchange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    variantId: number,
  ) => {
    const { value, id } = e.target;
    if (id === "notes") {
      return setPurchasesCartNotes(value);
    }
    setPurchasesCart((prev) => {
      return prev.map((p) => {
        if (p.variants.some((v) => v.id !== variantId)) return p;
        switch (id) {
          case "orderedQty":
            return {
              ...p,
              purchaseQty: Math.max(1, Number(value)),
            };
          case "estPrice":
            return {
              ...p,
              purchasePrice: Math.max(0, Number(value)),
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
      finalTotal: estGrandPurchaseTotal,
      supplier: showSupplier,
      notes: purchasesCartNotes,
    };
    axios.post("/purchases", updated);
    setPurchasesCart([]);
  };
  console.log(purchasesCart);
  return (
    <div className="h-screen overflow-hidden grid grid-cols-12">
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
                const defaultVariant = product.variants.find(
                  (variant) => variant.isDefault,
                );
                if (!defaultVariant) {
                  return;
                }
                return product.hasVariants ? (
                  <ShowVariants
                    key={product.id}
                    product={product}
                    handleAddPurchase={handleAddPurchase}
                    defaultVariant={defaultVariant}
                  />
                ) : (
                  <ProductCard
                    key={product.id}
                    product={product}
                    handleAddPurchase={handleAddPurchase}
                    defaultVariant={defaultVariant}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* purchases cart */}
      <div className=" col-span-7">
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
              <PurchaseTable
                purchasesCart={purchasesCart}
                handleOnchange={handleOnchange}
                setPurchasesCart={setPurchasesCart}
              />
            </div>
            {/* footer area */}
            <div className="m-2">
              {/* nots */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Notes</legend>
                <textarea
                  id="notes"
                  onChange={(e) => {
                    handleOnchange(e, {} as ProductType);
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
