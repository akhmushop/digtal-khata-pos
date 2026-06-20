import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import { useParams } from "react-router";
import { usePurchasesStore } from "../../store/purchases-store";
import { useProductStore } from "../../store/product-store";
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
const PAYMENT_METHODS = ["Cash", "Debit Card", "Credit Card", "Bank Transfer", "Cheque", "Other"];
export const ReceiveItems = () => {
  const { id } = useParams();

  const { purchases, purchasesItems } = usePurchasesStore();
  const purchaseOrder = purchases.find((item) => item.id === Number(id));
  const {
    supplier_name,
    final_total,
    payment_status,
    due_amount,
    paid_amount,
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
      status: "ORDERED",
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
  const [changedItems, setChangedItems] = useState({});
  const handleReceiveOnchange = (e, itemId) => {
    const { name, value, max } = e.target;
    const originalItem = receivePurchasesItems.find(
      (item) => item.id === itemId,
    );
    const originalValueMap = {
      receiveQuantity: originalItem.quantity,
      purchasePrice: originalItem.cost_price,
      sellingPrice: originalItem.price,
    };
    const originalValue = originalValueMap[name];
    const newValue =
      name === "receiveQuantity" ? Math.min(Number(value), Number(max)) : value;
    setReceiveItems((prev) => {
      return prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [name]: newValue,
            }
          : item,
      );
    });
    setChangedItems((prev) => {
      const updated = { ...prev };
      if (Number(newValue) === Number(originalValue)) {
        if (updated[itemId]) {
          delete updated[itemId][name];
          if (Object.keys(updated[itemId]).length === 0) {
            delete updated[itemId];
          }
        }
      } else {
        updated[itemId] = {
          ...(updated[itemId] || {}),
          [name]: newValue,
        };
      }

      return updated;
    });
  };
  useEffect(() => {
    setReceiveItems(
      receivePurchasesItems.map((item) => ({
        ...item,
        receiveQuantity: item.quantity,
        purchasePrice: item.cost_price,
        sellingPrice: item.price,
      })),
    );
  }, [receivePurchasesItems]);
  const [paymentDetails, setPaymentDetails] = useState({
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
                {receiveItems.map((item) => (
                  <tr key={item.id}>
                    <th>{item.product_name}</th>
                    <td>{item.product_unit}</td>
                    <td>{item.quantity}</td>
                    <td>0</td>
                    <td>
                      <input
                        min={0}
                        max={item.quantity}
                        name="receiveQuantity"
                        onChange={(e) => {
                          handleReceiveOnchange(e, item.id);
                        }}
                        value={item.receiveQuantity}
                        className="input"
                        type="number"
                      />
                    </td>
                    <td>
                      <input
                        name="purchasePrice"
                        onChange={(e) => {
                          handleReceiveOnchange(e, item.id);
                        }}
                        value={item.purchasePrice}
                        className="input"
                        type="number"
                      />
                    </td>
                    <td>
                      <input
                        name="sellingPrice"
                        onChange={(e) => {
                          handleReceiveOnchange(e, item.id);
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
                ))}
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
              max={grandTotal}
              name="payment_amount"
              onChange={handlePaymentOnchange}
              type="number"
              className="input w-full"
              value={paymentDetails.payment_amount}
            />
            <p className="label">Maximum {formatCurrency(grandTotal)}</p>
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
              {PAYMENT_METHODS.map(method => <option key={method}>{method}</option>)}
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
                {formatCurrency(grandTotal - paymentDetails.payment_amount)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex mt-5">
          <button
            onClick={() => {
              console.log(paymentDetails, changedItems);
            }}
            className="btn btn-success flex-1 mr-2"
          >
            Receive Items & Update Stock
          </button>
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
