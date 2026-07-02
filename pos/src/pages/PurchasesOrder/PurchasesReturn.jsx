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
export const PurchaseViewItems = () => {
  const { id } = useParams();

  const { purchases, purchasesItems, purchaseReturn } = usePurchasesStore();
  const purchaseOrder = purchases.purchases?.find(
    (item) => item.id === Number(id),
  );
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
  const totalRefund = receiveItems.reduce((total, item) => {
    const quantity = item.returnPurchaseQty ?? 0;
    const price = item.purchasePrice ?? 0;
    return total + quantity * price;
  }, 0);
  const paymentsInfoCards = [
    {
      bg: "bg-amber-50",
      circleBg: "bg-amber-500",
      title: "Total Refund",
      total: totalRefund,
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
  const handleReceiveOnchange = (e, receiveItem) => {
    const { name, value, max } = e.target;
    const newValue =
      name === "returnPurchaseQty"
        ? Math.max(0, Math.min(value, Number(max)))
        : value;
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
        receiveQuantity: item.receive_quantity,
        purchasePrice: item.cost_price,
        returnPurchaseQty: 0,
      })),
    );
  }, [receivePurchasesItems]);
  const navigate = useNavigate();
  const handleSubmit = () => {
    // 1. Loop over ORIGINAL items so we don't miss items deleted from the UI
    if (!window.confirm("Do you want to Return Product")) return;
    const changedItems = receivePurchasesItems.map((original) => {
      // Find the current state of this item (returns undefined if user clicked 'X')
      const current = receiveItems.find((r) => r.id === original.id);

      // If deleted, treat receiveQuantity as 0. Otherwise, use current state.
      const currentReturnQty = current ? Number(current.returnPurchaseQty) : 0;
      if (current.returnPurchaseQty === 0) return null;
      return {
        id: original.id,
        product_id: original.product_id,
        returnPurchaseQty: currentReturnQty,
      };
    }).filter(Boolean);
    if(changedItems.length === 0) return alert('Add return Items')
    const res = purchaseReturn(id, changedItems);
    // toast.promise(res, {
    //   loading: "Loading...",
    //   success: (data) => {
    //     setTimeout(() => navigate("/purchases-list"), 1000);
    //     return data?.message;
    //   },
    //   error: (err) => err.response?.data?.error || "Error when fetching",
    // });
    console.log(id,changedItems);
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
                  <th>Received</th>
                  <th>Already Return</th>
                  <th>Return Now</th>
                  <th>Purchase Price</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                {receiveItems.map((item) => {
                  return (
                    <tr key={item.id}>
                      <th>{item.product_name}</th>
                      <td>{item.product_unit}</td>
                      <td>{item.quantity}</td>
                      <td>{item.receive_quantity}</td>
                      <td>0</td>
                      <td>
                        <input
                          name="returnPurchaseQty"
                          max={item.quantity}
                          onChange={(e) => {
                            handleReceiveOnchange(e, item);
                          }}
                          value={item.returnPurchaseQty}
                          className="input"
                          type="number"
                        />
                      </td>
                      <td>
                        <input
                          disabled
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
                        {(item.returnPurchaseQty * item.purchasePrice).toFixed(2)}
                      </td>
                      <td>
                        <button className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 hover:cursor-pointer">
                          Return
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
        {/* payment summary */}
        <div className="border-dashed rounded border border-gray-400  w-full mt-2">
          <div className="flex justify-between gap-6 p-2">
            <div className="flex justify-between w-full">
              <p>Receiving Now</p>
              <p>{formatCurrency(totalRefund)}</p>
            </div>
            <div className="flex justify-between w-full">
              <p>Paying Now</p>
              <p>{}</p>
            </div>
          </div>
          <div className="flex justify-between gap-6 p-2">
            <div className="flex justify-between w-full">
              <p>Previous Balance</p>
              <p>{due_amount}</p>
            </div>
            <div className="flex justify-between w-full">
              <p>New Balance Due</p>
              <p>{}</p>
            </div>
          </div>
        </div>
        <div className="flex mt-5">
          <button
            onClick={handleSubmit}
            className="btn btn-success flex-1 mr-2"
          >
            Process Purchase Return
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
