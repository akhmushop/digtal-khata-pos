import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import toast, { Toaster } from "react-hot-toast";
import type {
  PaymentDetails,
  PaymentsInfoCard,
  PurchasesItems,
  ReceivePurchasePayload,
} from "../purchase.types.js";
import { SummaryCard } from "../components/purchasesReceiveItems/SummaryCard.js";
import { ItemsReceiveTable } from "../components/purchasesReceiveItems/ItemsReceiveTable.js";
import { useFieldArray, useForm } from "react-hook-form";
import {
  receiveItemsFormSchema,
  ReceiveItemsFormValues,
} from "../schemas/receiveItem.schema.js";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePurchasesStore } from "../usePurchaseStore.js";
const formatCurrency = (value: number) => {
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

  const { purchases, purchasesItems, updateStock, createReceivePurchase } =
    usePurchasesStore();
  const purchaseOrder = purchases.allPurchases?.find(
    (item) => item.id === Number(id),
  );
  const {
    supplierName,
    totalAmount,
    paymentStatus,
    dueAmount,
    paidAmount,
    status,
  } = purchaseOrder ?? {};
  const receivePurchasesItems = useMemo(
    () => purchasesItems.filter((item) => item.purchaseId === Number(id)),
    [purchasesItems, id],
  );
  // 1. Initialize Form
  const form = useForm<ReceiveItemsFormValues>({
    resolver: zodResolver(receiveItemsFormSchema),
    defaultValues: {
      purchaseId: Number(id),
      // Map your DB items into the form array
      items: receivePurchasesItems.map((item) => ({
        itemId: item.id,
        trackingType: item.trackingType,
        receiveNow: item.quantity - item.receivedQuantity,
        unitCost: Number(item.unitCost),
        sellingPrice: Number(item.sellingPrice),
        batches: [],
        serialNumbers: [],
      })),
      payment_amount: 0,
      paymentMethod: "Cash",
      payment_notes: "",
    },
  });
  // 2. Initialize Field Array
  const { fields, append } = useFieldArray({
    control: form.control,
    name: "items",
  });
  // 3. Calculate Grand Total using form.watch
  const watchedItems = form.watch("items");
  const grandTotal = watchedItems.reduce((total, item) => {
    return (
      total + (Number(item.receiveNow) || 0) * (Number(item.unitCost) || 0)
    );
  }, 0);
  const itemsStatusCards: PaymentsInfoCard[] = [
    {
      bg: "bg-amber-50",
      circleBg: "bg-amber-500",
      title: "Order Status",
      status: status?.toUpperCase() ?? "",
    },
    {
      bg: "bg-emerald-50",
      circleBg: "bg-emerald-500",
      title: "Payment Status",
      status: paymentStatus?.toUpperCase() ?? "",
    },
    {
      bg: "bg-blue-50",
      circleBg: "bg-blue-500",
      title: "Amount Paid",
      total: paidAmount ?? 0,
    },
    {
      bg: "bg-rose-50",
      circleBg: "bg-rose-500",
      title: "Amount Due",
      total: dueAmount ?? 0,
    },
  ];
  const [receiveItems, setReceiveItems] = useState<PurchasesItems[]>([]);
  // const grandTotal = receiveItems.reduce((total, item) => {
  //   const quantity = item.receivedQuantity ?? 0;
  //   const price = item.unitCost ?? 0;
  //   return total + quantity * price;
  // }, 0);
  const paymentsInfoCards: PaymentsInfoCard[] = [
    {
      bg: "bg-amber-50",
      circleBg: "bg-amber-500",
      title: "Grand Total",
      total: grandTotal ?? 0,
    },
    {
      bg: "bg-emerald-50",
      circleBg: "bg-emerald-500",
      title: "Already Paid",
      total: paidAmount ?? 0,
    },
    {
      bg: "bg-blue-50",
      circleBg: "bg-blue-500",
      title: "Current Balance",
      total: dueAmount ?? 0,
    },
  ];
  // const getInputValue = (name: string, value: number, max: number) => {
  //   const num = Number(value);
  //   switch (name) {
  //     case "receiveQuantity":
  //       return Math.max(0, Math.min(num, Number(max)));
  //     case "purchasePrice":
  //     case "sellingPrice":
  //       return Math.max(0, num);
  //     default:
  //       return value;
  //   }
  // };
  // const handleReceiveOnchange = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   receiveItem: PurchasesItems,
  // ) => {
  //   const { name, value, max } = e.target;
  //   const newValue = getInputValue(name, Number(value), Number(max));
  //   setReceiveItems((prev) => {
  //     return prev.map((item) =>
  //       item.id === receiveItem.id
  //         ? {
  //             ...item,
  //             [name]: newValue,
  //           }
  //         : item,
  //     );
  //   });
  // };
  useEffect(() => {
    // 1. If there is no data yet, do nothing
    if (receivePurchasesItems.length === 0) return;

    // 2. Map the database items
    const formattedItems = receivePurchasesItems.map((item) => ({
      itemId: item.id,
      trackingType: item.trackingType,
      receiveNow: item.quantity - item.receivedQuantity,
      unitCost: Number(item.unitCost),
      sellingPrice: Number(item.sellingPrice),
      batches: [],
      serialNumbers: [],
    }));

    // 3. Use form.reset to REPLACE the state entirely! (No duplicates!)
    form.reset({
      purchaseId: Number(id),
      items: formattedItems,
      // Include your other form fields here so they don't get erased
      payment_amount: 0,
      paymentMethod: "Cash",
      payment_notes: "",
    });
  }, [receivePurchasesItems, form]); // Add 'form' to dependencies
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    orderId: Number(id),
    payment_amount: 0,
    paymentMethod: "Cash",
    payment_notes: "",
  });
  const handlePaymentOnchange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { value, name } = e.target;
    const max = (e.target as HTMLInputElement).max;
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
  // const navigate = useNavigate();
  // const handleSubmit = () => {
  //   // 1. Loop over ORIGINAL items so we don't miss items deleted from the UI
  //   if (!window.confirm("Do you want to Receive Product")) return;
  //   const changedItems = receivePurchasesItems.map((original) => {
  //     // Find the current state of this item (returns undefined if user clicked 'X')
  //     const current = receiveItems.find((r) => r.id === original.id);

  //     // If deleted, treat receiveQuantity as 0. Otherwise, use current state.
  //     const currentQty = current ? Number(current.sellingPrice) : 0;
  //     const currentPurchasePrice = current
  //       ? Number(current.unitCost)
  //       : Number(original.unitCost);
  //     const currentSellingPrice = current
  //       ? Number(current.sellingPrice)
  //       : Number(original.sellingPrice);
  //     const quantityChanged =
  //       currentQty + Number(original.sellingPrice) !==
  //       Number(original.quantity);
  //     return {
  //       id: original.id,
  //       productId: original.productId,
  //       receiveQuantity: currentQty,
  //       purchasePrice: currentPurchasePrice,
  //       sellingPrice: currentSellingPrice,
  //       changedFields: quantityChanged,
  //     };
  //   });
  //   const res = updateStock(paymentDetails, changedItems);
  //   toast.promise(res, {
  //     loading: "Loading...",
  //     success: (data) => {
  //       setTimeout(() => navigate("/purchases-list"), 1000);
  //       return data?.message;
  //     },
  //     error: (err) => err.response?.data?.error || "Error when fetching",
  //   });
  // };
  const receivedItemsTotalCost = receivePurchasesItems.reduce(
    (sum, item) => sum + item.unitCost * item.receivedQuantity,
    0,
  );
  const amountToReceive = Number(totalAmount) - Number(receivedItemsTotalCost);
  const updatedDue =
    Number(dueAmount) + (Number(grandTotal) - Number(amountToReceive));

  async function onSubmit(data: ReceiveItemsFormValues) {
    // 2. Manually build the payload to match the interface perfectly
    const payload: ReceivePurchasePayload = {
      purchaseId: Number(id),
      items: data.items.map((item) => ({
        itemId: item.itemId,
        trackingType: item.trackingType,
        receiveNow: Number(item.receiveNow),
        unitCost: Number(item.unitCost),
        sellingPrice: Number(item.sellingPrice),
        batches: item.batches,
        serialNumbers: item.serialNumbers,
      })),
      payment_amount: Number(data.payment_amount),
      paymentMethod: data.paymentMethod,
      payment_notes: data.payment_notes || "", // Ensure it's a string, not undefined
    };

    // 3. Send it!
    await createReceivePurchase(payload);
  }
  console.log(form.formState.errors);
  return (
    <div className="col-span-10 px-5">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* receive items */}
        <div className="flex justify-between mb-5">
          <div>
            <p>Back to Purchase Orders</p>
            <h1>Receive Items</h1>
            <p>
              OrderId: {id} | Supplier: {supplierName}
            </p>
          </div>
          <div>
            <p>Order Total</p>
            <p>{totalAmount}</p>
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
        <ItemsReceiveTable
          fields={fields}
          receivePurchasesItems={receivePurchasesItems}
          form={form}
        />
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
              max={updatedDue || 0}
              name="payment_amount"
              onChange={handlePaymentOnchange}
              type="number"
              className="input w-full"
              value={paymentDetails.payment_amount}
            />
            <p className="label">Maximum {formatCurrency(updatedDue)}</p>
          </fieldset>
          {/* payment method */}
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend">Payment Method</legend>
            <select
              name="paymentMethod"
              onChange={handlePaymentOnchange}
              value={paymentDetails.paymentMethod}
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
              <p>{dueAmount}</p>
            </div>
            <div className="flex justify-between w-full">
              <p>New Balance Due</p>
              <p>
                {formatCurrency(updatedDue - paymentDetails.payment_amount)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex mt-5">
          <button type="submit" className="btn btn-success flex-1 mr-2">
            Receive Items & Update Stock
          </button>
          <Toaster />
          <button className="btn btn-soft  flex-none">Cancel</button>
        </div>
      </form>
    </div>
  );
};
