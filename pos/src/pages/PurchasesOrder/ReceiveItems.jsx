import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import { useNavigate, useParams } from "react-router";
import { usePurchasesStore } from "../../store/purchases-store";
import { useProductStore } from "../../store/product-store";
import toast, { Toaster } from "react-hot-toast";
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
const PAYMENT_METHODS = [
  "Cash",
  "Debit Card",
  "Credit Card",
  "Bank Transfer",
  "Cheque",
  "Other",
];
export const ReceiveItems = () => {
  const { id } = useParams();

  const { purchases, purchasesItems, updateStock } = usePurchasesStore();
  const purchaseOrder = purchases.find((item) => item.id === Number(id));
  const {
    supplier_name,
    final_total,
    payment_status,
    due_amount,
    paid_amount,
    status,
  } = purchaseOrder ?? {};
  const receivePurchasesItems = useMemo(
    () => purchasesItems.filter((item) => item.purchase_id === Number(id)),
    [purchasesItems, id],
  );
  const itemsStatusCards = [
    {
      bg: "bg-amber-50",
      circleBg: "bg-amber-500",
      title: "Order Status",
      status: status?.toUpperCase(),
    },
    {
      bg: "bg-emerald-50",
      circleBg: "bg-emerald-500",
      title: "Payment Status",
      status: payment_status?.toUpperCase(),
    },
    {
      bg: "bg-blue-50",
      circleBg: "bg-blue-500",
      title: "Amount Paid",
      total: paid_amount,
    },
    {
      bg: "bg-rose-50",
      circleBg: "bg-rose-500",
      title: "Amount Due",
      total: due_amount,
    },
  ];
  const [receiveItems, setReceiveItems] = useState([]);
  const grandTotal = receiveItems.reduce((total, item) => {
    const quantity = item.receiveQuantity ?? 0;
    const price = item.purchasePrice ?? 0;
    return total + quantity * price;
  }, 0);
  const paymentsInfoCards = [
    {
      bg: "bg-amber-50",
      circleBg: "bg-amber-500",
      title: "Grand Total",
      total: grandTotal,
    },
    {
      bg: "bg-emerald-50",
      circleBg: "bg-emerald-500",
      title: "Already Paid",
      status: paid_amount,
    },
    {
      bg: "bg-blue-50",
      circleBg: "bg-blue-500",
      title: "Current Balance",
      total: due_amount,
    },
  ];
  const getInputValue = (name, value, max) => {
    const num = Number(value);
    switch (name) {
      case "receiveQuantity":
        return Math.max(0, Math.min(num, Number(max)));
      case "purchasePrice":
      case "sellingPrice":
        return Math.max(0, num);
      default:
        return value;
    }
  };
  const handleReceiveOnchange = (e, receiveItem) => {
    const { name, value, max } = e.target;
    const newValue = getInputValue(name, value, max);
    setReceiveItems((prev) => {
      return prev.map((item) =>
        item.id === receiveItem.id
          ? {
              ...item,
              [name]: newValue,
            }
          : item,
      );
    });
  };
  useEffect(() => {
    setReceiveItems(
      receivePurchasesItems.map((item) => ({
        ...item,
        receiveQuantity: item.quantity - item.receive_quantity,
        purchasePrice: item.cost_price,
        sellingPrice: item.price,
      })),
    );
  }, [receivePurchasesItems]);
  const [paymentDetails, setPaymentDetails] = useState({
    orderId: id,
    payment_amount: "0",
    payment_method: "Cash",
    payment_notes: "",
  });
  const handlePaymentOnchange = (e) => {
    const { value, name, max } = e.target;
    setPaymentDetails((prev) => {
      return {
        ...prev,
        [name]:
          name === "payment_amount"
            ? Math.min(Number(value), Number(max))
            : value,
      };
    });
  };
  const navigate = useNavigate();
  const handleSubmit = () => {
    // 1. Loop over ORIGINAL items so we don't miss items deleted from the UI
    if (!window.confirm("Do you want to Receive Product")) return;
    const changedItems = receivePurchasesItems.map((original) => {
      // Find the current state of this item (returns undefined if user clicked 'X')
      const current = receiveItems.find((r) => r.id === original.id);

      // If deleted, treat receiveQuantity as 0. Otherwise, use current state.
      const currentQty = current ? Number(current.receiveQuantity) : 0;
      const currentPurchasePrice = current
        ? Number(current.purchasePrice)
        : Number(original.cost);
      const currentSellingPrice = current
        ? Number(current.sellingPrice)
        : Number(original.price);
      const quantityChanged =
        currentQty + Number(original.receive_quantity) !==
        Number(original.quantity);
      return {
        id: original.id,
        product_id: original.product_id,
        receiveQuantity: currentQty,
        purchasePrice: currentPurchasePrice,
        sellingPrice: currentSellingPrice,
        changedFields: quantityChanged,
      };
    });
    const res = updateStock(paymentDetails, changedItems);
    // toast.promise(res, {
    //   loading: "Loading...",
    //   success: (data) => {
    //     setTimeout(() => navigate("/purchases-list"), 1000);
    //     return data?.message;
    //   },
    //   error: (err) => err.response?.data?.error || "Error when fetching",
    // });
  };

  return (
    <div className="grid grid-cols-12">
      {/* Sidebar */}
      <div className="col-span-2">
        <div className="fixed w-60">
          <Sidebar />
        </div>
      </div>
      {/* receive items */}
      <div className="col-span-10 m-5">
        <div className="flex justify-between mb-5">
          <div>
            <p>Back to Purchase Orders</p>
            <h1>Receive Items</h1>
            <p>
              OrderId: {id} | Supplier: {supplier_name}
            </p>
          </div>
          <div>
            <p>Order Total</p>
            <p>{final_total}</p>
          </div>
        </div>
        {/* summer card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {itemsStatusCards.map((card, index) => (
            <SummaryCard
              key={index}
              card={card}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
        {/* Items To Receive */}
        <div>
          <h1>Items To Receive</h1>
          <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type/Variant</th>
                  <th>Ordered</th>
                  <th>Already Receive</th>
                  <th>Receive Now</th>
                  <th>Purchase Price</th>
                  <th>Selling Price</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                {receiveItems.map((item) => {
                  const itemsReceived =
                    Number(item.receive_quantity) === Number(item.quantity);

                  return (
                    <tr key={item.id}>
                      <th>{item.product_name}</th>
                      <td>{item.product_unit}</td>
                      <td>{item.quantity}</td>
                      <td>{item.receive_quantity}</td>
                      <td>
                        <input
                          disabled={itemsReceived}
                          min={0}
                          max={item.quantity - item.receive_quantity}
                          name="receiveQuantity"
                          onChange={(e) => {
                            handleReceiveOnchange(e, item);
                          }}
                          value={item.receiveQuantity}
                          className="input"
                          type="number"
                        />
                      </td>
                      <td>
                        <input
                          disabled={itemsReceived}
                          name="purchasePrice"
                          onChange={(e) => {
                            handleReceiveOnchange(e, item);
                          }}
                          value={item.purchasePrice}
                          className="input"
                          type="number"
                        />
                      </td>
                      <td>
                        <input
                          disabled={itemsReceived}
                          name="sellingPrice"
                          onChange={(e) => {
                            handleReceiveOnchange(e, item);
                          }}
                          value={item.sellingPrice}
                          className="input"
                          type="number"
                        />
                      </td>
                      <td>
                        {(item.receiveQuantity * item.purchasePrice).toFixed(2)}
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setReceiveItems((prev) =>
                              prev.filter((p) => p.id !== item.id),
                            );
                          }}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 hover:cursor-pointer"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/* payment details */}
        <div>
          <h1>Payment Details</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paymentsInfoCards.map((card, index) => (
              <SummaryCard
                key={index}
                card={card}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-between gap-6">
          {/* payment amount */}
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend">Payment Amount</legend>
            <input
              min={0}
              max={due_amount}
              name="payment_amount"
              onChange={handlePaymentOnchange}
              type="number"
              className="input w-full"
              value={paymentDetails.payment_amount}
            />
            <p className="label">Maximum {formatCurrency(due_amount)}</p>
          </fieldset>
          {/* payment method */}
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend">Payment Method</legend>
            <select
              name="payment_method"
              onChange={handlePaymentOnchange}
              value={paymentDetails.payment_method}
              className="select w-full"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method}>{method}</option>
              ))}
            </select>
          </fieldset>
        </div>
        {/* Payment notes */}
        <div>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">
              Payment Notes (Optional)
            </legend>
            <textarea
              name="payment_notes"
              onChange={handlePaymentOnchange}
              className="textarea h-24 w-full"
              placeholder="Add any notes about payment"
            ></textarea>
          </fieldset>
        </div>
        {/* payment summary */}
        <div className="border-dashed rounded border border-gray-400  w-full mt-2">
          <div className="flex justify-between gap-6 p-2">
            <div className="flex justify-between w-full">
              <p>Receiving Now</p>
              <p>{formatCurrency(grandTotal)}</p>
            </div>
            <div className="flex justify-between w-full">
              <p>Paying Now</p>
              <p>{paymentDetails.payment_amount}</p>
            </div>
          </div>
          <div className="flex justify-between gap-6 p-2">
            <div className="flex justify-between w-full">
              <p>Previous Balance</p>
              <p>{due_amount}</p>
            </div>
            <div className="flex justify-between w-full">
              <p>New Balance Due</p>
              <p>
                {formatCurrency(due_amount - paymentDetails.payment_amount)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex mt-5">
          <button
            onClick={handleSubmit}
            className="btn btn-success flex-1 mr-2"
          >
            Receive Items & Update Stock
          </button>
          <Toaster />
          <button className="btn btn-soft  flex-none">Cancel</button>
        </div>
      </div>
    </div>
  );
};
const SummaryCard = ({ card, formatCurrency }) => {
  const displayValue =
    card.total != null
      ? `TK ${formatCurrency(card.total)}`
      : (card.status ?? "N/A");
  return (
    <div className={`flex items-center p-3 ${card.bg} rounded-lg`}>
      <div className={`w-3 h-3 ${card.circleBg} rounded-full mr-3`}></div>
      <div>
        <p className="text-sm font-medium text-gray-600">{card.title}</p>
        <p className="font-bold">{displayValue}</p>
      </div>
    </div>
  );
};
