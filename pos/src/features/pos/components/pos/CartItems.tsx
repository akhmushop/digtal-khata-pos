import React, { Children, useEffect, useRef, useState } from "react";
import { MdOutlineAddCircleOutline, MdDeleteOutline } from "react-icons/md";
import { FiMinusCircle } from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
import { ClickToShowMore } from "./CartMoreMenu.js";
import { ClickEmptyToResetCart } from "./CartEmptyBtn.js";
import type {
  AddChargeModalProps,
  CartHoldBtnProps,
  CartHoldShowBtnProps,
  CartTextModalProps,
  CashForm,
  CashModalProps,
  ClickType,
  HoldCartItems,
  PaymentModalProps,
  PeerInputProps,
  PopupModalProps,
} from "../../../../types/cart.types.js";
import { useProductStore } from "@/features/products/usedashboardProductStore.js";
import { useCartStore } from "@/store/useCartStore.js";
import { CustomerDue } from "@/types/customers.types.js";
import axios from "../../../../api/axios.js";
import { useCustomerStore } from "@/store/useCustomerStore.js";
import { useSoldStore } from "@/store/useSalesStore.js";

export default function CartItems() {
  const {
    addProductQuantityToCart,
    removeProductQuantityToCart,
    addCustomProductQuantityToCart,
    restoreSingleProductQuantityToCart,
  } = useProductStore();
  const {
    cart,
    addCartQuantity,
    removeCartQuantity,
    removeCartItem,
    addCustomCartQuantity,
  } = useCartStore();
  const [dueByCustomers, setDueByCustomers] = useState<CustomerDue[]>([]);
  const getDueByCustomers = async () => {
    const res = await axios.get("due_by_customers");
    setDueByCustomers(res.data);
  };
  useEffect(() => {
    getDueByCustomers();
  }, []);
  const [editQuantityId, setEditQuantityId] = useState<number | null>(null);
  const [customQuantity, setCustomQuantity] = useState<number | null>(null);
  const editQuantityRef = useRef<HTMLInputElement>(null);
  // ClickOutSideToSaveCustomQuantity
  useEffect(() => {
    const clickOutside = (event: MouseEvent) => {
      if (
        editQuantityRef.current &&
        !editQuantityRef.current.contains(event.target as Node)
      ) {
        setEditQuantityId(null);
      }
      const items = cart.find((p) => p.id === editQuantityId);
      if (
        editQuantityRef.current &&
        items &&
        !editQuantityRef.current.contains(event.target as Node)
      ) {
        const newQuantity = Number(customQuantity);
        if (!isNaN(newQuantity) && newQuantity > 0) {
          addCustomCartQuantity(items.id, newQuantity); // Send the difference to update
          addCustomProductQuantityToCart(
            items.id,
            newQuantity,
            items.soldQuantity,
          );
        }
        setCustomQuantity(null);
        setEditQuantityId(null);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => {
      document.removeEventListener("mousedown", clickOutside);
    };
  }, [
    cart,
    customQuantity,
    editQuantityId,
    addCustomCartQuantity,
    addCustomProductQuantityToCart,
  ]);
  // ClickOutSideToSaveCustomQuantity
  const { showCustomerInfo } = useCustomerStore();
  const { name, phone, address, id } = showCustomerInfo;
  const customerDue = dueByCustomers.find((c) => c.customerId === id);
  return (
    <div className="h-[calc(100vh-4.25rem)]">
      <div className="h-full overflow-scroll  no-scrollbar bg-zuccini-50">
        {/* show customer info */}
        {(name || phone) && (
          <div className="grid grid-cols-2 my-2 px-5">
            <h1 className="col-span-1 ">name: {name}</h1>
            <h1 className="col-span-1">phone: {phone}</h1>
            <h1 className="col-span-2">address: {address}</h1>
            {customerDue ? (
              <h1 className="col-span-2">
                Total Amount: {customerDue.totalAmount} , Total Paid:{" "}
                {customerDue.total_paid} , Total Due: {customerDue.total_due}
              </h1>
            ) : (
              <h1 className="col-span-2">No Due</h1>
            )}
          </div>
        )}

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
                  <h1>{items.productName}</h1>
                  <p>
                    {Number(items.price).toFixed(2)} ×{" "}
                    {Number(items.soldQuantity)} ={" "}
                    {(Number(items.price) * Number(items.soldQuantity)).toFixed(
                      2,
                    )}
                  </p>
                </div>
                <div className="flex text-2xl gap-x-4 items-center pr-5  ">
                  <div
                    onClick={() => {
                      addProductQuantityToCart(items.id);
                      removeCartQuantity(items.id);
                    }}
                    className="cursor-pointer"
                  >
                    <FiMinusCircle />
                  </div>
                  <span
                    onClick={() => {
                      setEditQuantityId(items.id);
                    }}
                    className=""
                  >
                    {editQuantityId === items.id ? (
                      <input
                        type="number"
                        className="h-7 w-11 border"
                        ref={editQuantityRef}
                        defaultValue={items.soldQuantity}
                        autoFocus
                        onChange={(e) => {
                          setCustomQuantity(Number(e.target.value));
                        }}
                      />
                    ) : (
                      items.soldQuantity
                    )}
                  </span>
                  <div
                    onClick={() => {
                      removeProductQuantityToCart(items.id);
                      addCartQuantity(items.id);
                    }}
                    className="cursor-pointer"
                  >
                    <MdOutlineAddCircleOutline />
                  </div>
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      restoreSingleProductQuantityToCart(
                        items.id,
                        items.soldQuantity,
                      );
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
        <CartCalculation showCustomerInfo={showCustomerInfo} />
        {/* cartCalculation */}
      </div>
    </div>
  );
}

function CartCalculation({ showCustomerInfo }: ShowCustomerInfoProps) {
  const cart = useCartStore((state) => state.cart);
  const [isOpen, setIsOpen] = useState(false);
  const [emptyCartCon, setEmptyCartCon] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const closeMore = useRef<HTMLInputElement>(null);
  const [isAddChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [holdCartItems, setHoldCartItems] = useState<HoldCartItems[]>(() => {
    try {
      const storedHold = localStorage.getItem("holdCart");
      return storedHold ? JSON.parse(storedHold) : [];
    } catch {
      return [];
    }
  });
  const subTotal = Number(
    cart.reduce((total, item) => total + item.price * item.soldQuantity, 0),
  );
  const vat = Number(subTotal * (5 / 100));
  const [holdConfirm, setHoldConfirm] = useState(false);

  useEffect(() => {
    const clickOutside = (event: MouseEvent) => {
      if (
        closeMore.current &&
        !closeMore.current.contains(event.target as Node)
      ) {
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
  const initialCashFrom = {
    discount: 0,
    amountReceived: 0,
    change: 0,
    finalTotal: 0,
    paidAmount: 0,
    note: "",
    dueAmount: 0,
    subtotal: 0,
    vat: 0,
  };
  const [cashForm, setCashForm] = useState<CashForm>(initialCashFrom);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const handleCashTk = () => {
    const total = subTotal + vat;
    setCashForm((prev) => ({
      ...prev,
      subtotal: subTotal,
      vat: vat,
      finalTotal: total,
    }));
    setIsCashModalOpen(true);
    setTimeout(() => setIsOpen(true), 30);
  };
  const handlePayment = () => {
    const total = subTotal + vat;
    setCashForm((prev) => ({
      ...prev,
      subtotal: subTotal,
      vat: vat,
      finalTotal: total,
      dueAmount: total,
    }));
    setIsOpen(false);
    setIsPaymentModalOpen(true);
    setTimeout(() => setIsOpen(true), 10);
  };
  const handleCashChange = (id: string, value: number | string) => {
    setCashForm((prev) => {
      const updated = { ...prev, [id]: value };
      // payable AFTER discount
      const baseTotal = Number(prev.subtotal) + Number(prev.vat);
      updated.finalTotal = baseTotal - Number(updated.discount);
      // change = amountReceived - payable
      const calculateDueAmount = updated.finalTotal - updated.paidAmount;
      updated.dueAmount = calculateDueAmount;
      const calculatedChange =
        Number(updated.amountReceived) - Number(updated.finalTotal);
      updated.change = calculatedChange < 0 ? 0 : calculatedChange;

      return updated;
    });
  };
  const addToSoldProduct = useSoldStore((state) => state.addToSoldProduct);
  const resetCart = useCartStore((state) => state.resetCart);

  const handlePay = (handelClose: () => void, click: ClickType) => {
    const { id } = showCustomerInfo;
    const updatedCash = {
      ...cashForm,
      paidAmount: cashForm.finalTotal,
      paymentMethod: "Cash",
      customerId: id,
    };
    const updatedPayment = {
      ...cashForm,
      paymentMethod: paymentMethod,
      customerId: id,
    };
    if (click === "cash") {
      if (
        cashForm.amountReceived > 0 &&
        cashForm.amountReceived > cashForm.finalTotal
      ) {
        addToSoldProduct(cart, updatedCash);
        resetCart();
        handelClose();
        setCashForm(initialCashFrom);
      } else {
        alert("add money");
      }
    } else if (click === "payments") {
      addToSoldProduct(cart, updatedPayment);
      resetCart();
      handelClose();
      setCashForm(initialCashFrom);
    }
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
            initialCashFrom={initialCashFrom}
            handlePay={handlePay}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            handleCashChange={handleCashChange}
            cashForm={cashForm}
            setCashForm={setCashForm}
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
            handlePay={handlePay}
            handleCashChange={handleCashChange}
            cashForm={cashForm}
            setCashForm={setCashForm}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            setIsCashModalOpen={setIsCashModalOpen}
            initialCashFrom={initialCashFrom}
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
}: CartHoldBtnProps) {
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
}: CartHoldShowBtnProps) {
  // const addHoldItemsToCart = useCartStore((state) => state.addHoldItemsToCart);
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
              // addHoldItemsToCart(cart.items);
              setHoldCartItems((prev) =>
                prev.filter((hold) => hold.id !== cart.id),
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
function PeerInput({ id, peerName, value, onChange }: PeerInputProps) {
  const handelChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const rawValue = e.target.value;

    // NOTE field does not need number filtering

    if (id === "note") {
      onChange(id, rawValue);
      return;
    }

    // Number only
    const onlyNumber = rawValue.replace(/\D/g, "");
    const finalValue = onlyNumber === "" ? "0" : onlyNumber;
    onChange(id, Number(finalValue));
  };
  return (
    <div className="relative">
      <input
        disabled={id === "finalTotal" || id === "dueAmount"}
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
  handleCashChange,
  cashForm,
  setCashForm,
  isOpen,
  setIsPaymentModalOpen,
  setIsOpen,
  paymentMethod,
  setPaymentMethod,
  handlePay,
  initialCashFrom,
}: PaymentModalProps) {
  const handelClose = () => {
    setTimeout(() => setIsPaymentModalOpen(false), 300);
    setIsOpen(false);
    setCashForm(initialCashFrom);
  };
  const methods = ["Cash", "Mobile", "Card"];
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
            id="paidAmount"
            peerName="Paid Amount"
            value={cashForm.paidAmount}
            onChange={handleCashChange}
          />
          <PeerInput
            id="finalTotal"
            peerName="Final Total"
            value={cashForm.finalTotal}
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
            id="dueAmount"
            peerName="Due Amount"
            value={cashForm.dueAmount}
            onChange={handleCashChange}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {methods.map((method) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`py-2 border rounded transition hover:cursor-pointer
            ${
              paymentMethod === method
                ? "bg-blue-500 text-white border-blue-500"
                : "border-gray-300 hover:bg-gray-50 active:bg-gray-100"
            }
          `}
            >
              {method}
            </button>
          ))}
        </div>
        <PeerInput
          id="note"
          peerName="Note"
          value={cashForm.note}
          onChange={handleCashChange}
        />
        <button
          onClick={() => handlePay(handelClose, "payments")}
          className="w-full  py-5 border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition"
        >
          PAY
        </button>
      </div>
    </PopupModal>
  );
}

function CashModal({
  handleCashChange,
  isOpen,
  setIsOpen,
  setIsCashModalOpen,
  cashForm,
  setCashForm,
  initialCashFrom,
  handlePay,
}: CashModalProps) {
  const handelClose = () => {
    setTimeout(() => setIsCashModalOpen(false), 300);
    setIsOpen(false);
    setCashForm(initialCashFrom);
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
            value={cashForm.change.toFixed(2)}
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
            id="finalTotal"
            peerName="Final Total"
            value={cashForm.finalTotal.toFixed(2)}
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
          onClick={() => handlePay(handelClose, "cash")}
          className="w-full  py-5 border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition"
        >
          PAY
        </button>
      </div>
    </PopupModal>
  );
}
export function PopupModal({
  isOpen,
  handelClose,
  children,
  className,
}: PopupModalProps) {
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
}: CartTextModalProps) {
  const cart = useCartStore((state) => state.cart);
  const totalItemsCount = cart.reduce((total) => total + 1, 0);
  const totalQuantityCount = cart.reduce(
    (total, item) => total + (item.soldQuantity || 0),
    0,
  );

  const handelClose = () => {
    setTimeout(() => setIsChargeModalOpen(false), 300);
    setIsOpen(false);
  };
  return (
    <>
      <div className="flex justify-between py-2 border-b">
        <h4>Total Items: {totalItemsCount}</h4>
        <h4>Qty: {totalQuantityCount}</h4>
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
function AddChargeModal({
  isOpen,
  setIsOpen,
  setIsChargeModalOpen,
}: AddChargeModalProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const handleOption = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  const addChargeHtml = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const clickOutside = (event: MouseEvent) => {
      if (
        addChargeHtml.current &&
        !addChargeHtml.current.contains(event.target as Node)
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
