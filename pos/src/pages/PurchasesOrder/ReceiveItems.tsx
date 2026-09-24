import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { usePurchasesStore } from "../../store/usePurchaseStore.js";
import toast, { Toaster } from "react-hot-toast";
import type {
  PaymentDetails,
  PaymentsInfoCard,
  PurchasesItems,
  SummaryCardProps,
} from "../../features/purchases/purchase.types.js";
import { Button } from "@/components/ui/button.js";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.js";
import { Controller, FieldPath, useForm, UseFormReturn } from "react-hook-form";
import { createEntityPromiseToast } from "@/lib/toast-utils.js";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field.js";
import { Input } from "@/components/ui/input.js";
import { InputField } from "@/components/common/InputField.js";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.js";
import { Calendar } from "@/components/ui/calendar.js";
import {
  batchSchema,
  BatchSchemaTypeInput,
  BatchSchemaTypeOutput,
} from "@/features/purchases/schemas/batch.schema.js";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.js";
import { Trash } from "lucide-react";
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

  const { purchases, purchasesItems, updateStock } = usePurchasesStore();
  console.log(purchasesItems);
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
  const grandTotal = receiveItems.reduce((total, item) => {
    const quantity = item.receivedQuantity ?? 0;
    const price = item.unitCost ?? 0;
    return total + quantity * price;
  }, 0);
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
  const getInputValue = (name: string, value: number, max: number) => {
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
  const handleReceiveOnchange = (
    e: React.ChangeEvent<HTMLInputElement>,
    receiveItem: PurchasesItems,
  ) => {
    const { name, value, max } = e.target;
    const newValue = getInputValue(name, Number(value), Number(max));
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
        receiveNow: item.quantity - item.receivedQuantity,
        unitCost: item.unitCost,
        sellingPrice: item.sellingPrice,
      })),
    );
  }, [receivePurchasesItems]);
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
  const navigate = useNavigate();
  const handleSubmit = () => {
    // 1. Loop over ORIGINAL items so we don't miss items deleted from the UI
    if (!window.confirm("Do you want to Receive Product")) return;
    const changedItems = receivePurchasesItems.map((original) => {
      // Find the current state of this item (returns undefined if user clicked 'X')
      const current = receiveItems.find((r) => r.id === original.id);

      // If deleted, treat receiveQuantity as 0. Otherwise, use current state.
      const currentQty = current ? Number(current.sellingPrice) : 0;
      const currentPurchasePrice = current
        ? Number(current.unitCost)
        : Number(original.unitCost);
      const currentSellingPrice = current
        ? Number(current.sellingPrice)
        : Number(original.sellingPrice);
      const quantityChanged =
        currentQty + Number(original.sellingPrice) !==
        Number(original.quantity);
      return {
        id: original.id,
        productId: original.productId,
        receiveQuantity: currentQty,
        purchasePrice: currentPurchasePrice,
        sellingPrice: currentSellingPrice,
        changedFields: quantityChanged,
      };
    });
    const res = updateStock(paymentDetails, changedItems);
    toast.promise(res, {
      loading: "Loading...",
      success: (data) => {
        setTimeout(() => navigate("/purchases-list"), 1000);
        return data?.message;
      },
      error: (err) => err.response?.data?.error || "Error when fetching",
    });
  };
  const receivedItemsTotalCost = receivePurchasesItems.reduce(
    (sum, item) => sum + item.unitCost * item.receivedQuantity,
    0,
  );
  const amountToReceive = Number(totalAmount) - Number(receivedItemsTotalCost);
  const updatedDue =
    Number(dueAmount) + (Number(grandTotal) - Number(amountToReceive));

  return (
    <div className="col-span-10 px-5">
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
                <th>Already Received</th>
                <th>Remaining</th>
                <th>Receive Now</th>
                <th>Unit Cost</th>
                <th>Selling Price</th>
                <th>Total</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              {receiveItems.map((item) => {
                const itemsReceived =
                  Number(item.receivedQuantity) === Number(item.quantity);
                const remaining = item.quantity - item.receivedQuantity;
                return (
                  <tr key={item.id}>
                    <th>{item.productName}</th>
                    <td>{item.productUnit}</td>
                    <td>{item.quantity}</td>
                    <td>{item.receivedQuantity}</td>
                    <td>{remaining}</td>
                    <td>
                      <input
                        disabled={itemsReceived}
                        min={0}
                        max={item.quantity - item.receivedQuantity}
                        name="receiveNow"
                        onChange={(e) => {
                          handleReceiveOnchange(e, item);
                        }}
                        value={item.receiveNow}
                        className="input"
                        type="number"
                      />
                    </td>
                    <td>
                      <input
                        disabled={itemsReceived}
                        name="unitCost"
                        onChange={(e) => {
                          handleReceiveOnchange(e, item);
                        }}
                        value={item.unitCost}
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
                    <td>{(item.receiveNow * item.unitCost).toFixed(2)}</td>
                    <td>
                      <DetailsDialog item={item} />
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
            max={updatedDue}
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
          <legend className="fieldset-legend">Payment Notes (Optional)</legend>
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
            <p>{formatCurrency(updatedDue - paymentDetails.payment_amount)}</p>
          </div>
        </div>
      </div>
      <div className="flex mt-5">
        <button onClick={handleSubmit} className="btn btn-success flex-1 mr-2">
          Receive Items & Update Stock
        </button>
        <Toaster />
        <button className="btn btn-soft  flex-none">Cancel</button>
      </div>
    </div>
  );
};
const SummaryCard = ({ card, formatCurrency }: SummaryCardProps) => {
  const displayValue =
    "total" in card
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
function DetailsDialog({ item }: { item: PurchasesItems }) {
  const [open, setOpen] = useState(false);
  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
    }
  }
  const form = useForm<BatchSchemaTypeInput, unknown, BatchSchemaTypeOutput>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      batchNumber: "",
      quantity: 0,
      manufacturedDate: null,
      expiryDate: null,
    },
  });
  const [batchList, setBatchList] = useState<BatchSchemaTypeOutput[]>([]);
  async function onSubmit(data: BatchSchemaTypeOutput) {
    console.log(data);
    setBatchList((prev) => [...prev, data]);
    // await createEntityPromiseToast({
    //   data,
    //   apiCall: createBrand,
    //   entityName: "Brand",
    //   displayName: data.brandName,
    // });
    form.reset();
  }
  console.log(batchList)
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form id="add-batch-number" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTrigger
          render={
            <Button onClick={() => {}} className="hover:cursor-pointer">
              {item.trackingType}
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batch Information</DialogTitle>
            <DialogTitle>Product Name: {item.productName}</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <div className="flex gap-3">
              {/* batchNumber */}
              <InputField
                name="batchNumber"
                form={form}
                fieldLabel="Batch Number"
                placeholder="Type Batch Number"
              />
              {/* Quantity */}
              <Controller
                name="quantity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Quantity</FieldLabel>
                    <Input
                      min={1}
                      id={field.name}
                      {...field}
                      placeholder="0"
                      type="number"
                    />
                    {fieldState.error && (
                      <FieldError> {fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />
            </div>
            <div className="flex gap-3">
              <BatchDatePicker
                name="manufacturedDate"
                form={form}
                label="Manufactured Date"
              />
              <BatchDatePicker
                name="expiryDate"
                form={form}
                label="Expiry Date"
              />
            </div>
          </FieldGroup>
          {/* batch list */}
          <div>
            <h1 className="text-lg font-semibold mb-2">Batch List</h1>
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
            <BatchListTable batchList={batchList} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button form="add-batch-number" type="submit">
              Add Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
interface BatchDatePickerProps {
  name: FieldPath<BatchSchemaTypeInput>;
  form: UseFormReturn<BatchSchemaTypeInput>;
  label: string;
}
export function BatchDatePicker({ name, form, label }: BatchDatePickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  id={field.name}
                  className="justify-start font-normal"
                >
                  {field.value
                    ? new Date(field.value).toLocaleDateString()
                    : "Select date"}
                </Button>
              }
            />
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                defaultMonth={field.value ? new Date(field.value) : new Date()}
                captionLayout="dropdown"
                onSelect={(date) => {
                  field.onChange(date);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          {fieldState.error && (
            <FieldError>{fieldState.error.message}</FieldError>
          )}
        </Field>
      )}
    />
  );
}
export function BatchListTable({batchList}:{batchList:BatchSchemaTypeOutput[]}) {
  const totalQuantity = batchList.reduce((sum,batch)=>(sum + batch.quantity),0)
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Batch Number</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>M/E</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {batchList.map((batch) => (
          <TableRow key={batch.batchNumber}>
            <TableCell className="font-medium">{batch.batchNumber}</TableCell>
            <TableCell>{batch.quantity}</TableCell>
            <TableCell>{new Date(batch.manufacturedDate).toLocaleDateString()} - {new Date(batch.expiryDate).toLocaleDateString()}</TableCell>
            <TableCell><Trash /></TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total Quantity</TableCell>
          <TableCell className="text-right">{totalQuantity}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
