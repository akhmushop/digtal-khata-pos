import React, { Children, useEffect, useRef, useState } from "react";
import { MdOutlineAddCircleOutline, MdDeleteOutline } from "react-icons/md";
import { FiMinusCircle } from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
import { ClickToShowMore } from "./CartMoreMenu";
import { ClickEmptyToResetCart } from "./CartEmptyBtn";
import { useProductStore } from "../../store/product-store";
import { useCartStore } from "../../store/cart-store";

export default function CartItems() {
  const addProductQtn = useProductStore((state) => state.addProductQtn);
  const removeProductQty = useProductStore((state) => state.removeProductQty);
  const addCustomProductQty = useProductStore(
    (state) => state.addCustomProductQty
  );
  const restoreProductQty = useProductStore((state) => state.restoreProductQty);
  const cart = useCartStore((state) => state.cart);
  const addCartQty = useCartStore((state) => state.addCartQty);
  const removeCartQty = useCartStore((state) => state.removeCartQty);
  const removeCartItem = useCartStore((state) => state.removeCartItem);
  const addCustomCartQty = useCartStore((state) => state.addCustomCartQty);
  const [editQtyId, setEditQtyId] = useState(null);
  const [customQty, setCustomQty] = useState(null);
  const editQtyRef = useRef(null);

  // ClickOutSideToSaveCustomQty
  useEffect(() => {
    const clickOutside = (event) => {
      if (editQtyRef.current && !editQtyRef.current.contains(event.target)) {
        setEditQtyId(null);
      }
      const items = cart.find((p) => p.id === editQtyId);
      if (
        editQtyRef.current &&
        items &&
        !editQtyRef.current.contains(event.target)
      ) {
        const newQty = Number(customQty);
        if (!isNaN(newQty) && newQty > 0) {
          addCustomCartQty(newQty, items.barcode); // Send the difference to update
          addCustomProductQty(items.barcode, newQty, items.qty);
        }
        setCustomQty(null);
        setEditQtyId(null);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => {
      document.removeEventListener("mousedown", clickOutside);
    };
  }, [cart, customQty, editQtyId, addCustomCartQty, addCustomProductQty]);
  // ClickOutSideToSaveCustomQty

  return (
    <div className="h-[calc(100vh-4.25rem)]">
      <div className="h-full overflow-scroll  no-scrollbar bg-zuccini-50">
        {/* cartitem */}
        {cart.map((items) => {
          return (
            <div
              key={items.barcode}
              className="h-20 m-2 bg-zuccini-300 rounded-xl flex items-center select-none"
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
                    {Number(items.price).toFixed(2)} × {Number(items.qty)} ={" "}
                    {(Number(items.price) * Number(items.qty)).toFixed(2)}
                  </p>
                </div>
                <div className="flex text-2xl gap-x-4 items-center pr-5  ">
                  <div
                    onClick={() => {
                      addProductQtn(items.barcode);
                      removeCartQty(items.barcode);
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
                      removeProductQty(items.barcode);
                      addCartQty(items.barcode);
                    }}
                    className="cursor-pointer"
                  >
                    <MdOutlineAddCircleOutline />
                  </div>
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      restoreProductQty(items.barcode, items.qty);
                      removeCartItem(items.barcode);
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
        <CartCalculation />
        {/* cartCalculation */}
      </div>
    </div>
  );
}

function CartCalculation() {
  const cart = useCartStore((state) => state.cart);
  const [isOpen, setIsOpen] = useState(false);
  const [emptyCartCon, setEmptyCartCon] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const closeMore = useRef(null);
  const [isAddChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [holdCartItems, setHoldCartItems] = useState(() => {
    try {
      const storedHold = localStorage.getItem("holdCart");
      return storedHold ? JSON.parse(storedHold) : [];
    } catch {
      return [];
    }
  });
  const subTotal = Number(
    cart.reduce((total, item) => total + item.price * item.qty, 0)
  );
  const vat = Number(subTotal * (5 / 100));
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
  const [cashForm, setCashForm] = useState({
    discount: "0",
    amountReceived: "0",
    change: "0",
    payable: "0",
    originalPayable: "0",
    note: "",
  });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const handleCashTk = () => {
    const total = subTotal + vat;
    setCashForm((prev) => ({
      ...prev,
      payable: total,
      originalPayable: total,
    }));
    setIsCashModalOpen(true);
    setTimeout(() => setIsOpen(true), 30);
  };
  const handlePayment = () => {
    const total = subTotal + vat;
    setPaymentForm((prev) => ({ ...prev, amount: total }));
    setPaymentForm((prev) => ({ ...prev, total: total }));
    setIsOpen(false);
    setIsPaymentModalOpen(true);
    setTimeout(() => setIsOpen(true), 10);
  };

  return (
    <div className="p-5">
      <CartTextModal
        subTotal={subTotal}
        vat={vat}
        setIsOpen={setIsOpen}
        isAddChargeModalOpen={isAddChargeModalOpen}
        setIsChargeModalOpen={setIsChargeModalOpen}
        isOpen={isOpen}
      />
      <div className="grid grid-cols-6 py-2 gap-1 ">
        {/* emptybutton */}
        {emptyCartCon && (
          <ClickEmptyToResetCart
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            setEmptyCartCon={() => setEmptyCartCon(false)}
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
              setHoldCartItems={setHoldCartItems}
            />
          )}
          {holdConfirm && (
            <CartHoldBtn
              setIsOpen={setIsOpen}
              isOpen={isOpen}
              setHoldConfirmFalse={() => setHoldConfirm(false)}
              setHoldCartItems={() =>
                setHoldCartItems((prev) => [
                  ...prev,
                  {
                    id: Date.now(), // unique ID
                    name: `Hold ${prev.length + 1}`, // display name
                    time: new Date().toLocaleTimeString(), // store time
                    items: cart, // your cart items
                  },
                ])
              }
              holdCartItems={holdCartItems}
            />
          )}
          <ClickToShowMore
            showMore={showMore}
            setHoldConfirm={() => setHoldConfirm(true)}
            setIsOpen={setIsOpen}
            holdCartItems={holdCartItems}
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
          onClick={handlePayment}
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
            cashForm={cashForm}
            setCashForm={setCashForm}
          />
        )}
        <button
          onClick={handleCashTk}
          className="bg-red-400 p-2 w-full col-span-6 rounded hover:bg-red-500 transition-all duration-300 cursor-pointer"
        >
          CASH TK: {(subTotal + vat).toFixed(2)}
        </button>
      </div>
    </div>
  );
}

function CartHoldBtn({
  setIsOpen,
  isOpen,
  setHoldConfirmFalse,
  setHoldCartItems,
  holdCartItems,
}) {
  const cart = useCartStore((state) => state.cart);
  const resetCart = useCartStore((state) => state.resetCart);
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
            if (cart.length === 0) return alert("Your cart is empty");
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
  setHoldCartItems,
}) {
  const addHoldItemsToCart = useCartStore((state) => state.addHoldItemsToCart);
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
              addHoldItemsToCart(cart.items);
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
function PeerInput({ id, peerName, value, onChange }) {
  const handelChange = (e) => {
    const rawValue = e.target.value;

    // NOTE field does not need number filtering
    if (id === "note") {
      onChange(id, rawValue);
      return;
    }

    // Number only
    const onlyNumber = rawValue.replace(/\D/g, "");
    const finalValue = onlyNumber === "" ? "0" : onlyNumber;
    onChange(id, finalValue);
  };
  return (
    <div className="relative">
      <input
        onFocus={(e) => {
          e.target.select();
        }}
        onChange={handelChange}
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
  const handlePaymentChange = (id, value) => {
    setPaymentForm((prev) => {
      const updated = { ...prev, [id]: value };
      updated.total = Number(updated.amount) - Number(updated.discount);
      return updated;
    });
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
            onChange={handlePaymentChange}
          />
          <PeerInput
            id="total"
            peerName="Total"
            value={paymentForm.total}
            onChange={handlePaymentChange}
          />
        </div>
        <PeerInput
          id="amount"
          peerName="Amount"
          value={paymentForm.amount}
          onChange={handlePaymentChange}
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
          onChange={handlePaymentChange}
        />
        <button
          onClick={() => {
            console.log(paymentForm);
            paymentForm.discount = 0;
            handelClose();
          }}
          className="w-full  py-5 border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition"
        >
          PAY
        </button>
      </div>
    </PopupModal>
  );
}

function CashModal({
  isOpen,
  setIsOpen,
  setIsCashModalOpen,
  cashForm,
  setCashForm,
}) {
  const handelClose = () => {
    setTimeout(() => setIsCashModalOpen(false), 300);
    setIsOpen(false);
  };
  const handleCashChange = (id, value) => {
    setCashForm((prev) => {
      const updated = { ...prev, [id]: value };
      // payable AFTER discount
      const originalPayable = prev.originalPayable || prev.payable;
      updated.payable = Number(originalPayable) - Number(updated.discount);
      // change = amountReceived - payable
      const calculatedChange =
        Number(updated.amountReceived) - Number(updated.payable);
      updated.change = calculatedChange < 0 ? 0 : calculatedChange;
      return updated;
    });
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
            id="amountReceived"
            peerName="Amount Received"
            value={cashForm.amountReceived}
            onChange={handleCashChange}
          />
          <PeerInput
            id="change"
            peerName="Change"
            value={cashForm.change}
            onChange={handleCashChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <PeerInput
            id="discount"
            peerName="Discount"
            value={cashForm.discount}
            onChange={handleCashChange}
          />
          <PeerInput
            id="payable"
            peerName="Payable Amount"
            value={cashForm.payable}
            onChange={handleCashChange}
          />
        </div>

        <PeerInput
          id="note"
          peerName="Note"
          value={cashForm.note}
          onChange={handleCashChange}
        />
        <button
          onClick={() => {
            if (
              cashForm.amountReceived > 0 &&
              cashForm.amountReceived > cashForm.payable
            ) {
              handelClose();
              console.log(cashForm);
              cashForm.amountReceived = 0;
              cashForm.change = 0;
              cashForm.discount = 0;
            } else {
              alert("add money");
            }
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
function CartTextModal({
  subTotal,
  vat,
  setIsOpen,
  isAddChargeModalOpen,
  setIsChargeModalOpen,
  isOpen,
}) {
  const cart = useCartStore((state) => state.cart);
  const totalItemsCount = cart.reduce((total) => total + 1, 0);
  const totalQtyCount = cart.reduce(
    (total, item) => total + (item.qty || 0),
    0
  );

  const handelClose = () => {
    setTimeout(() => setIsChargeModalOpen(false), 300);
    setIsOpen(false);
  };
  return (
    <>
      <div className="flex justify-between py-2 border-b">
        <h4>Total Items: {totalItemsCount}</h4>
        <h4>Qty: {totalQtyCount}</h4>
      </div>
      <div className="flex justify-between py-2 border-b">
        <h4>Subtotal</h4>
        <h4>TK: {subTotal.toFixed(2)}</h4>
      </div>
      <div>
        <h3 className="py-2  w-full flex item">Charges & Taxes</h3>
      </div>
      <div className="flex justify-between py-2 ">
        <h4>VAT: 5%</h4>
        <h4>TK: {vat.toFixed(2)}</h4>
      </div>
      <div>
        {isAddChargeModalOpen && (
          <AddChargeModal
            handelClose={handelClose}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            setIsChargeModalOpen={setIsChargeModalOpen}
          />
        )}
        <button
          onClick={() => {
            setIsChargeModalOpen(true);
            setTimeout(() => setIsOpen(true), 30);
          }}
          className="flex justify-center py-2 bg-red-400 p-2 w-full col-span-1 rounded hover:bg-red-500 transition-all duration-300 cursor-pointer"
        >
          ADD CHARGE
        </button>
      </div>
      <div className="flex justify-between py-2 border-b">
        <h4>Total Charges</h4>
        <h4>TK: {vat.toFixed(2)}</h4>
      </div>
      <div className="flex justify-between py-2 border-b">
        <h1>FINAL TOTAL</h1>
        <h1>TK: {(subTotal + vat).toFixed(2)}</h1>
      </div>
    </>
  );
}
function AddChargeModal({ isOpen, setIsOpen, setIsChargeModalOpen }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const handleOption = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  const addChargeHtml = useRef(null);
  useEffect(() => {
    const clickOutside = (event) => {
      if (
        addChargeHtml.current &&
        !addChargeHtml.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => {
      document.removeEventListener("mousedown", clickOutside);
    };
  }, []);
  const [chargeName, setChargeName] = useState("Servicing Charge");
  const [inputValue, setInputValue] = useState("Servicing Charge");
  const handelClose = () => {
    setTimeout(() => setIsChargeModalOpen(false), 300);
    setIsOpen(false);
  };
  return (
    <PopupModal
      isOpen={isOpen}
      className={"h-40 w-65"}
      handelClose={handelClose}
    >
      <div className="flex flex-col items-center h-full justify-around">
        <h1 className="text-xl">Add Charge/Tax</h1>
        <div ref={addChargeHtml} className="relative">
          <input
            onClick={handleOption}
            value={chargeName}
            readOnly
            placeholder=" "
            id="addCharge"
            type="text"
            className="peer border cursor-pointer   border-gray-400 rounded outline-none px-5 py-2"
          />
          <label
            htmlFor="addCharge"
            className="absolute left-5 top-2 text-gray-400 pointer-events-none bg-white peer-focus:-top-3.5 peer-focus:text-blue-500 transition-all duration-200  peer-not-placeholder-shown:-top-3.5 peer-not-placeholder-shown:text-blue-500"
          >
            Add Charge
          </label>
          {isDropdownOpen && (
            <div className="absolute w-full  bg-white rounded mt-0.5 ">
              <div className="flex flex-col gap-1">
                <div
                  onClick={() => {
                    setChargeName("Servicing Charge");
                    setInputValue("Servicing Charge");
                    setIsDropdownOpen(false);
                  }}
                  className="bg-gray-300 rounded cursor-pointer w-full flex justify-center "
                >
                  Servicing Charge
                </div>
                <div
                  onClick={() => {
                    setChargeName("Delivery Charge");
                    setInputValue("Delivery Charge");
                    setIsDropdownOpen(false);
                  }}
                  className="bg-red-300 rounded cursor-pointer w-full flex justify-center "
                >
                  Delivery Charge
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end w-full mr-10">
          <button
            onClick={handelClose}
            className="border border-gray-400 rounded p-1 hover:bg-red-400 transition-all duration-200 cursor-pointer hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handelClose}
            className="border border-gray-400 rounded p-1 hover:bg-red-400 transition-all duration-200 cursor-pointer hover:text-white"
          >
            Add
          </button>
        </div>
      </div>
    </PopupModal>
  );
}
