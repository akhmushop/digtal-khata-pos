import React, { useEffect, useRef, useState } from "react";
import { MdOutlineAddCircleOutline, MdDeleteOutline } from "react-icons/md";
import { FiMinusCircle } from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
export default function CartItems({
  cartItems = [],
  removeCartItem,
  increaseQty,
  decreaseQty,
  updateQty,
  resetCart,
}) {
  const [editQtyId, setEditQtyId] = useState(null);
  const [customQty, setCustomQty] = useState(null);
  const editQtyRef = useRef(null);
  const [animation, setAnimation] = useState(false);
  const [emptyCartCon, setEmptyCartCon] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const closeMore = useRef(null);
  useEffect(() => {
    const clickOutside = (event) => {
      if (closeMore.current && !closeMore.current.contains(event.target)) {
        setShowMore(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => {
      document.removeEventListener("mousedown", clickOutside);
    };
  }, []);

  useEffect(() => {
    const clickOutside = (event) => {
      if (editQtyRef.current && !editQtyRef.current.contains(event.target)) {
        setEditQtyId(null);
      }
      const items = cartItems.find((p) => p.id === editQtyId);
      if (
        editQtyRef.current &&
        items &&
        !editQtyRef.current.contains(event.target)
      ) {
        const newQty = Number(customQty);
        if (!isNaN(newQty) && newQty > 0) {
          updateQty(newQty, items); // Send the difference to update
        }
        setCustomQty(null);
        setEditQtyId(null);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => {
      document.removeEventListener("mousedown", clickOutside);
    };
  }, [cartItems, customQty, editQtyId, updateQty]);
  const subTotal = cartItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );
  const vat = subTotal * (5 / 100);

  return (
    <div className="h-[calc(100vh-4.25rem)]">
      <div className="h-full overflow-scroll  no-scrollbar bg-zuccini-50">
        {cartItems.map((items) => {
          return (
            <div
              key={items.id}
              className="h-20 m-2 bg-zuccini-300 rounded-xl flex items-center "
            >
              <div className="flex items-center w-full justify-between">
                <img
                  className="h-20 w-20  rounded-xl "
                  src={items.image}
                  alt=""
                />
                <div className="flex-1 pl-5">
                  <h1>{items.name}</h1>
                  <p>
                    {items.price} * {items.qty} = {items.price * items.qty}
                  </p>
                </div>
                <div className="flex text-2xl gap-x-4 items-center pr-5  ">
                  <div
                    onClick={() => {
                      decreaseQty(items);
                    }}
                    className="cursor-pointer"
                  >
                    <FiMinusCircle />
                  </div>
                  <span
                    onClick={() => {
                      setEditQtyId(items.id);
                    }}
                    className=""
                  >
                    {editQtyId === items.id ? (
                      <input
                        type="number"
                        className="h-7 w-11 border"
                        ref={editQtyRef}
                        defaultValue={items.qty}
                        autoFocus
                        onChange={(e) => {
                          setCustomQty(e.target.value);
                        }}
                      />
                    ) : (
                      items.qty
                    )}
                  </span>
                  <div
                    onClick={() => {
                      increaseQty(items);
                    }}
                    className="cursor-pointer"
                  >
                    <MdOutlineAddCircleOutline />
                  </div>
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      removeCartItem(items.id);
                    }}
                  >
                    <MdDeleteOutline />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* cartCalculation */}
        <div className="p-5">
          <div className="flex justify-between py-2 border-b">
            <h4>Total Items: {cartItems.reduce((total) => total + 1, 0)}</h4>
            <h4>
              Qty:{" "}
              {cartItems.reduce((total, item) => total + (item.qty || 0), 0)}
            </h4>
          </div>
          <div className="flex justify-between py-2 border-b">
            <h4>Subtotal</h4>
            <h4>TK: {subTotal}</h4>
          </div>
          <div>
            <h3 className="py-2  w-full flex item">Charges & Taxes</h3>
          </div>
          <div className="flex justify-between py-2 ">
            <h4>VAT: 5%</h4>
            <h4>TK: {vat}</h4>
          </div>
          <div>
            <button className="flex justify-center py-2 bg-red-400 p-2 w-full col-span-1 rounded hover:bg-red-500 transition-all duration-300 cursor-pointer">
              ADD CHARGE
            </button>
          </div>
          <div className="flex justify-between py-2 border-b">
            <h4>Total Charges</h4>
            <h4>TK: {vat}</h4>
          </div>
          <div className="flex justify-between py-2 border-b">
            <h1>FINAL TOTAL</h1>
            <h1>TK: {subTotal + vat}</h1>
          </div>
          <div className="grid grid-cols-6 py-2 gap-1 ">
            {emptyCartCon && (
              <div
                onClick={() => {
                  setAnimation(false);
                  setTimeout(() => setEmptyCartCon(false), 300);
                }}
                className={`fixed flex items-center justify-center inset-0 bg-black/80 backdrop-blur-sm z-50  transition-opacity duration-300 ${
                  animation ? "opacity-100" : "opacity-0 "
                } `}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={` h-40 w-70 bg-zuccini-50 flex flex-col items-center justify-center  transition-transform duration-300 rounded ${
                    animation ? "scale-100 " : "scale-90"
                  }`}
                >
                  <h1 className="text-xl mb-5">
                    Do you want to clear this cart?
                  </h1>
                  <div className="flex  w-full justify-center gap-3">
                    <button
                      onClick={() => {
                        resetCart([]);
                        setAnimation(false);
                        setTimeout(() => setEmptyCartCon(false), 300);
                      }}
                      className="bg-red-400 hover:bg-red-500 cursor-pointer px-4 py-2 rounded transition-all duration-300 "
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => {
                        setAnimation(false);
                        setTimeout(() => setEmptyCartCon(false), 300);
                      }}
                      className="bg-red-400 hover:bg-red-500 cursor-pointer px-4 py-2 rounded transition-all duration-300 "
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                setAnimation(false);
                setEmptyCartCon(true);
                setTimeout(() => setAnimation(true), 10);
              }}
              className="bg-red-400 p-2 w-full col-span-1 rounded hover:bg-red-500 transition-all duration-300 cursor-pointer"
            >
              EMPTY
            </button>
            <div ref={closeMore} className="relative col-span-2">
              <div
                onClick={() => {
                  !showMore ? setShowMore(true) : setShowMore(false);
                }}
                className=" flex items-center justify-center cursor-pointer bg-red-400 p-2 rounded hover:bg-red-500 transition-all duration-300"
              >
                <div className="flex-1 text-center">MORE</div>
                <div className="">
                  <HiDotsVertical />
                </div>
              </div>
              <div
                className={`absolute bg-gray-400 h-40 w-40 bottom-0 right-8 rounded transition-all  duration-300 transform origin-bottom-left ${
                  !showMore
                    ? "opacity-0 scale-90 pointer-events-none"
                    : "opacity-100 scale-100"
                }`}
              >
                <div className="flex flex-col items-center justify-around gap-1 h-full ">
                  <div className="bg-red-100 h-full w-full flex items-center justify-center cursor-pointer hover:bg-red-50 transition-all duration-200">
                    <h3>HOLD</h3>
                  </div>
                  <div className="bg-red-100 h-full w-full flex items-center justify-center cursor-pointer hover:bg-red-50 transition-all duration-200">
                    <h3>HOLD ITEMS</h3>
                  </div>
                  <div className="bg-red-100 h-full w-full flex items-center justify-center cursor-pointer hover:bg-red-50 transition-all duration-200">
                    <h3>GROUP ITEMS</h3>
                  </div>
                  <div className="bg-red-100 h-full w-full flex items-center justify-center cursor-pointer hover:bg-red-50 transition-all duration-200">
                    <h3>QUOTATION</h3>
                  </div>
                </div>
              </div>
            </div>
            <button className="bg-red-400 p-2 w-full col-span-3 rounded hover:bg-red-500 transition-all duration-300 cursor-pointer ">
              PAYMENTS
            </button>
            <button className="bg-red-400 p-2 w-full col-span-6 rounded hover:bg-red-500 transition-all duration-300 cursor-pointer">
              CASH TK: {subTotal + vat}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
