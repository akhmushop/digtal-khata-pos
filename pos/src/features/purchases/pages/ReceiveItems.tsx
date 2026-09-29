import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import type {
  PaymentDetails,
  PaymentsInfoCard,
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
import { createEntityPromiseToast } from "@/lib/toast-utils.js";
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
const PAYMENT_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Cheque", value: "cheque" },
  { label: "Card", value: "card" },
  { label: "Other", value: "other" },
];

export const ReceiveItems = () => {
  const { id } = useParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    orderId: Number(id),
    paymentAmount: 0,
    paymentMethod: "cash",
    paymentNotes: "",
  });
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
      paymentAmount: 0,
      paymentMethod: paymentDetails.paymentMethod,
      paymentNotes: "",
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
      paymentAmount: 0,
      paymentMethod: paymentDetails.paymentMethod,
      paymentNotes: "",
    });
  }, [receivePurchasesItems, form]); // Add 'form' to dependencies

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
          name === "paymentAmount"
            ? Math.min(Number(value), Number(max))
            : value,
      };
    });
  };
  const navigate = useNavigate();
  const receivedItemsTotalCost = receivePurchasesItems.reduce(
    (sum, item) => sum + item.unitCost * item.receivedQuantity,
    0,
  );
  const amountToReceive = Number(totalAmount) - Number(receivedItemsTotalCost);
  const updatedDue =
    Number(dueAmount) + (Number(grandTotal) - Number(amountToReceive));

  async function onSubmit(data: ReceiveItemsFormValues) {
    await createEntityPromiseToast({
      data,
      apiCall: createReceivePurchase,
      entityName: "Receive Purchase",
      getSuccessMessage: (response) => {
        return response.data.message;
      },
    });
    setTimeout(() => navigate("/purchases-list"), 1000);
  }
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
              name="paymentAmount"
              onChange={handlePaymentOnchange}
              type="number"
              className="input w-full"
              value={paymentDetails.paymentAmount}
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
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
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
              name="paymentNotes"
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
              <p>{paymentDetails.paymentAmount}</p>
            </div>
          </div>
          <div className="flex justify-between gap-6 p-2">
            <div className="flex justify-between w-full">
              <p>Previous Balance</p>
              <p>{dueAmount}</p>
            </div>
            <div className="flex justify-between w-full">
              <p>New Balance Due</p>
              <p>{formatCurrency(updatedDue - paymentDetails.paymentAmount)}</p>
            </div>
          </div>
        </div>
        <div className="flex mt-5">
          <button type="submit" className="btn btn-success flex-1 mr-2">
            Receive Items & Update Stock
          </button>
          <button className="btn btn-soft  flex-none">Cancel</button>
        </div>
      </form>
    </div>
  );
};
