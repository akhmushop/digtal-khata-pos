import React, { Children, useEffect, useRef, useState } from "react";
import { MdOutlineAddCircleOutline, MdDeleteOutline } from "react-icons/md";
import { FiMinusCircle } from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
import { ClickToShowMore } from "./CartMoreMenu";
import { ClickEmptyToResetCart } from "./CartEmptyBtn";

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
  // ClickOutSideToSaveCustomQty
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
  // ClickOutSideToSaveCustomQty

  return (
    <div className="h-[calc(100vh-4.25rem)]">
      <div className="h-full overflow-scroll  no-scrollbar bg-zuccini-50">
        {/* cartitem */}
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
        {/* cartitem */}

        {/* cartCalculation */}
        <CartCalculation cartItems={cartItems} resetCart={resetCart} />
        {/* cartCalculation */}
      </div>
    </div>
  );
}

function CartCalculation({ cartItems, resetCart }) {
  const [isOpen, setIsOpen] = useState(false);
  const [emptyCartCon, setEmptyCartCon] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const closeMore = useRef(null);
  const [holdCartItems, setHoldCartItems] = useState(() => {
    try {
      const storedHold = localStorage.getItem("holdCart");
      return storedHold ? JSON.parse(storedHold) : [];
    } catch {
      return [];
    }
  });
  const subTotal = cartItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );
  const vat = subTotal * (5 / 100);
  const [holdConfirm, setHoldConfirm] = useState(false);

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
    localStorage.setItem("holdCart", JSON.stringify(holdCartItems));
  }, [holdCartItems]);
  const [showHoldItems, setShowHoldItems] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    discount: "0",
    total: "0",
    amount: "0",
    note: "",
  });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);

  return (
    <div className="p-5">
      <div className="flex justify-between py-2 border-b">
        <h4>Total Items: {cartItems.reduce((total) => total + 1, 0)}</h4>
        <h4>
          Qty: {cartItems.reduce((total, item) => total + (item.qty || 0), 0)}
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
        {/* emptybutton */}
        {emptyCartCon && (
          <ClickEmptyToResetCart
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            setEmptyCartCon={() => setEmptyCartCon(false)}
            resetCart={() => resetCart([])}
            cartItems={cartItems}
          />
        )}
        <button
          onClick={() => {
            setIsOpen(false);
            setEmptyCartCon(true);
            setTimeout(() => setIsOpen(true), 10);
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
          {showHoldItems && (
            <CartHoldShowBtn
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              setShowHoldItemsFalse={() => setShowHoldItems(false)}
              holdCartItems={holdCartItems}
              resetCart={resetCart}
              cartItems={cartItems}
              setHoldCartItems={setHoldCartItems}
            />
          )}
          {holdConfirm && (
            <CartHoldBtn
              setIsOpen={setIsOpen}
              isOpen={isOpen}
              setHoldConfirmFalse={() => setHoldConfirm(false)}
              resetCart={() => resetCart([])}
              setHoldCartItems={() =>
                setHoldCartItems((prev) => [
                  ...prev,
                  {
                    id: Date.now(), // unique ID
                    name: `Hold ${prev.length + 1}`, // display name
                    time: new Date().toLocaleTimeString(), // store time
                    items: cartItems, // your cart items
                  },
                ])
              }
              cartItems={cartItems}
              holdCartItems={holdCartItems}
            />
          )}
          <ClickToShowMore
            showMore={showMore}
            setHoldConfirm={() => setHoldConfirm(true)}
            setIsOpen={setIsOpen}
            holdCartItems={holdCartItems}
            resetCart={resetCart}
            setShowMoreFalse={() => setShowMore(false)}
            setShowHoldItems={() => setShowHoldItems(true)}
          />
        </div>
        {isPaymentModalOpen && (
          <PaymentModal
            paymentForm={paymentForm}
            setPaymentForm={setPaymentForm}
            isOpen={isOpen}
            setIsPaymentModalOpen={setIsPaymentModalOpen}
            setIsOpen={setIsOpen}
          />
        )}

        {/* morebutton */}
        <button
          onClick={() => {
            setPaymentForm((prev) => ({ ...prev, amount: subTotal + vat }));
            setIsOpen(false);
            setIsPaymentModalOpen(true);
            setTimeout(() => setIsOpen(true), 10);
          }}
          className="bg-red-400 p-2 w-full col-span-3 rounded hover:bg-red-500 transition-all duration-300 cursor-pointer "
        >
          PAYMENTS
        </button>
        {isCashModalOpen && (
          <CashModal
            paymentForm={paymentForm}
            setPaymentForm={setPaymentForm}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            setIsCashModalOpen={setIsCashModalOpen}
          />
        )}
        <button onClick={()=>{
          setIsCashModalOpen(true)
          setTimeout(()=>
            setIsOpen(true)
          ,30)
          
          
        }} className="bg-red-400 p-2 w-full col-span-6 rounded hover:bg-red-500 transition-all duration-300 cursor-pointer">
          CASH TK: {subTotal + vat}
        </button>
      </div>
    </div>
  );
}

function CartHoldBtn({
  setIsOpen,
  isOpen,
  setHoldConfirmFalse,
  resetCart,
  setHoldCartItems,
  cartItems,
  holdCartItems,
}) {
  const handelClose = () => {
    setTimeout(() => setHoldConfirmFalse(), 300);
    setIsOpen(false);
  };
  return (
    <PopupModal
      handelClose={handelClose}
      isOpen={isOpen}
      className="h-40 w-80 flex flex-col items-center justify-center gap-7"
    >
      <h1 className=" text-2xl ">Do you want to hold this cart?</h1>
      <div className="flex items-center justify-center gap-10">
        <button
          onClick={() => {
            if (cartItems.length === 0) return alert("Your cart is empty");
            setHoldCartItems();
            resetCart();
            setTimeout(() => setHoldConfirmFalse(), 300);
            setIsOpen(false);
          }}
          className="bg-red-400 px-4 py-2 rounded cursor-pointer hover:bg-red-500 transition-all duration-300"
        >
          Yes
        </button>
        <button
          onClick={() => {
            setTimeout(() => setHoldConfirmFalse(), 300);
            setIsOpen(false);
          }}
          className="bg-red-400 px-4 py-2 rounded cursor-pointer hover:bg-red-500 transition-all duration-300"
        >
          No
        </button>
      </div>
    </PopupModal>
  );
}
function CartHoldShowBtn({
  isOpen,
  setIsOpen,
  setShowHoldItemsFalse,
  holdCartItems,
  resetCart,
  cartItems,
  setHoldCartItems,
}) {
  const handelClose = () => {
    setTimeout(() => setShowHoldItemsFalse(), 300);
    setIsOpen(false);
  };
  return (
    <PopupModal
      isOpen={isOpen}
      handelClose={handelClose}
      className="h-80 w-70 flex flex-col gap-3 overflow-y-scroll"
    >
      {Array.isArray(holdCartItems) && holdCartItems.length > 0 ? (
        holdCartItems.map((cart, index) => (
          <div
            onClick={() => {
              resetCart(cart.items);
              setHoldCartItems((prev) =>
                prev.filter((hold) => hold.id !== cart.id)
              );
              setTimeout(() => setShowHoldItemsFalse(), 300);
              setIsOpen(false);
            }}
            className="w-full bg-amber-200 flex flex-col items-center cursor-pointer  "
            key={index}
          >
            <h2 className="font-bold">{cart.name}</h2>
            <p className="text-sm text-gray-700">{cart.time}</p>
            <p className="text-sm">{cart.items.length} items</p>
          </div>
        ))
      ) : (
        <h1>No held carts yet</h1>
      )}
    </PopupModal>
  );
}
function PeerInput({ id, peerName, value, setPaymentForm }) {
  const handelChange = () => (e) => {
    let v = e.target.value;
    if (id === "note") {
      setPaymentForm((prev) => ({ ...prev, [id]: v }));
    } else {
      let onlyNumber = e.target.value.replace(/\D/g, "");
      setPaymentForm((prev) => ({
        ...prev,
        [id]: onlyNumber === "" ? "0" : onlyNumber,
      }));
    }
  };
  return (
    <div className="relative">
      <input
        onFocus={(e) => {
          e.target.select();
        }}
        onChange={handelChange()}
        value={value}
        placeholder=" "
        id={id}
        className="peer  border border-gray-400 rounded focus:outline-none focus:border-blue-400 px-3 py-3 w-full"
        type="text"
      />
      <label
        htmlFor={id}
        className={`${
          id === "note"
            ? "absolute top-3 left-3 peer-focus:-top-3.5 peer-not-placeholder-shown:-top-3.5  peer-placeholder-shown:top-3 pointer-events-none text-gray-500 bg-white peer-focus:text-blue-400 transition-all duration-100"
            : "absolute -top-3.5 bg-white left-3 peer-focus:text-blue-400 transition-all duration-100 text-gray-500"
        } `}
      >
        {peerName}
      </label>
    </div>
  );
}
function PaymentModal({
  paymentForm,
  setPaymentForm,
  isOpen,
  setIsPaymentModalOpen,
  setIsOpen,
}) {
  const handelClose = () => {
    setTimeout(() => setIsPaymentModalOpen(false), 300);
    setIsOpen(false);
  };
  return (
    <PopupModal isOpen={isOpen} handelClose={handelClose} className="w-150 p-6">
      <div className="flex justify-between mb-5">
        <h1 className="text-xl font-semibold">Add Payments </h1>
        <h1
          onClick={handelClose}
          className="cursor-pointer text-gray-500 hover:text-gray-700 text-lg"
        >
          Close
        </h1>
      </div>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <PeerInput
            id="discount"
            peerName="Discount"
            value={paymentForm.discount}
            setPaymentForm={setPaymentForm}
          />
          <PeerInput
            id="total"
            peerName="Total"
            value={paymentForm.total}
            setPaymentForm={setPaymentForm}
          />
        </div>
        <PeerInput
          id="amount"
          peerName="Amount"
          value={paymentForm.amount}
          setPaymentForm={setPaymentForm}
        />
        <div className="grid grid-cols-3 gap-3">
          <button className="py-2 border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition">
            Cash
          </button>
          <button className="py-2 border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition">
            Cheque
          </button>
          <button className="py-2 border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition">
            Card
          </button>
        </div>
        <PeerInput
          id="note"
          peerName="Note"
          value={paymentForm.note}
          setPaymentForm={setPaymentForm}
        />
        <button
          onClick={() => {
            console.log(paymentForm);
          }}
          className="w-full  py-5 border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition"
        >
          PAY
        </button>
      </div>
    </PopupModal>
  );
}
function PopupModal({ isOpen, handelClose, children, className }) {
  return (
    <div
      onClick={handelClose}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${className} bg-white rounded shadow-lg transition-transform duration-300 ${
          isOpen ? "scale-100" : "scale-90"
        } `}
      >
        {children}
      </div>
    </div>
  );
}
function CashModal({ paymentForm, setPaymentForm, isOpen, setIsOpen,setIsCashModalOpen }) {
  const handelClose = () => {
    setTimeout(() => setIsCashModalOpen(false), 300);
    setIsOpen(false);
  };
  return (
    <PopupModal isOpen={isOpen} handelClose={handelClose} className="w-150 p-6">
      <div className="flex justify-between mb-5">
        <h1 className="text-xl font-semibold">Cash Checkout</h1>
        <h1
          onClick={handelClose}
          className="cursor-pointer text-gray-500 hover:text-gray-700 text-lg"
        >
          Close
        </h1>
      </div>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <PeerInput
            id="amount"
            peerName="Amount Received"
            value={paymentForm.amount}
            setPaymentForm={setPaymentForm}
          />
          <PeerInput
            id="amount"
            peerName="Change"
            value={paymentForm.amount}
            setPaymentForm={setPaymentForm}
          />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <PeerInput
            id="discount"
            peerName="Discount"
            value={paymentForm.discount}
            setPaymentForm={setPaymentForm}
          />
          <PeerInput
            id="total"
            peerName="Total"
            value={paymentForm.total}
            setPaymentForm={setPaymentForm}
          />
        </div>

        <PeerInput
          id="note"
          peerName="Note"
          value={paymentForm.note}
          setPaymentForm={setPaymentForm}
        />
        <button
          onClick={() => {
            console.log(paymentForm);
          }}
          className="w-full  py-5 border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition"
        >
          PAY
        </button>
      </div>
    </PopupModal>
  );
}
