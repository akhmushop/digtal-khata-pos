import { useEffect, useRef, useState } from "react";
import { MdOutlineAddCircleOutline, MdDeleteOutline } from "react-icons/md";
import { FiMinusCircle } from "react-icons/fi";
import { ClearCartDialog } from "./ClearCartDialog.js";
import type {
  CartTextModalProps,
  DiscountType,
} from "../../../../types/cart.types.js";
import { useProductStore } from "@/features/products/usedashboardProductStore.js";
import { useCartStore } from "@/store/useCartStore.js";
import { CustomerDue, ShowCustomerInfoProps } from "@/types/customers.types.js";
import axios from "../../../../api/axios.js";
import { useCustomerStore } from "@/store/useCustomerStore.js";
import { PaymentModal } from "./PaymentModal.js";
import { UseFormReturn, useWatch } from "react-hook-form";
import { CartSchemaType } from "../../schemas/cart.schema.js";
import { DiscountModal } from "./DiscountModal.js";
import { Card, CardContent } from "@/components/ui/card.js";
import { HoldDropdownMenu } from "./HoldDropdownMenu.js";
import { Input } from "@/components/ui/input.js";
import { Switch } from "@/components/ui/switch.js";
import { Label } from "@/components/ui/label.js";

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
    addDiscount,
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
          addCustomProductQuantityToCart(items.id, newQuantity, items.quantity);
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

  const { name, phone, address, id } = showCustomerInfo || {};
  const customerDue = dueByCustomers.find((c) => c.customerId === id);
  console.log(cart);
  return (
    <>
      {(name || phone) && (
        <Card className="my-2">
          <CardContent className="grid grid-cols-2">
            <span className="col-span-1 ">Name: {name}</span>
            <span className="col-span-1">Phone: {phone}</span>
            <span className="col-span-2">Address: {address}</span>
            {customerDue ? (
              <span className="col-span-2">
                Total Amount: {customerDue.totalAmount} , Total Paid:{" "}
                {customerDue.total_paid} , Total Due: {customerDue.total_due}
              </span>
            ) : (
              <span className="col-span-2">No Due</span>
            )}
          </CardContent>
        </Card>
      )}

      {/* cartitem */}

      <div className="flex flex-col gap-3">
        {cart.map((item) => {
          const variant = item.variants[0];
          if (!variant) {
            return;
          }
          const discountPercentage =
            item.discount?.type === "percentage" ? item.discount?.value : 0;
          const discountFixed =
            item.discount?.type === "fixed" ? item.discount?.value : 0;
          const totalSellingPrice =
            Number(variant.sellingPrice) * Number(item.quantity);
          const priceAfterPercentDiscount =
            totalSellingPrice - (totalSellingPrice * discountPercentage) / 100;
          const priceAfterFixedDiscount = totalSellingPrice + discountFixed;
          console.log(priceAfterPercentDiscount, discountPercentage);
          return (
            <Card key={variant.id}>
              <CardContent>
                <div className="flex items-center gap-3">
                  <img
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                    src={
                      item.imageUrl ??
                      "https://www.startech.com.bd/image/cache/catalog/ceiling-fan/qulik/windora/windora-01-500x500.webp"
                    }
                    alt={item.name}
                  />

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {Number(variant.sellingPrice).toFixed(2)} ×{" "}
                      {Number(item.quantity)} ={" "}
                      <span className="font-semibold text-foreground">
                        {totalSellingPrice.toFixed(2)}
                      </span>
                    </span>

                    <CartItemDiscount
                      variantId={variant.id}
                      addDiscount={addDiscount}
                      priceAfterPercentDiscount={priceAfterPercentDiscount}
                      priceAfterFixedDiscount={priceAfterFixedDiscount}
                    />
                  </div>

                  <div className="flex items-center gap-x-3 text-2xl">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => {
                        addProductQuantityToCart(item.id);
                        removeCartQuantity(item.id);
                      }}
                      className="cursor-pointer rounded-full transition hover:text-primary"
                    >
                      <FiMinusCircle />
                    </button>

                    <span
                      onClick={() => {
                        setEditQuantityId(item.id);
                      }}
                      className="min-w-8 cursor-pointer text-center text-lg font-medium"
                    >
                      {editQuantityId === item.id ? (
                        <input
                          type="number"
                          className="h-7 w-14 rounded border text-center text-base"
                          ref={editQuantityRef}
                          defaultValue={item.quantity}
                          autoFocus
                          onChange={(e) => {
                            setCustomQuantity(Number(e.target.value));
                          }}
                        />
                      ) : (
                        item.quantity
                      )}
                    </span>

                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => {
                        removeProductQuantityToCart(item.id);
                        addCartQuantity(item.id);
                      }}
                      className="cursor-pointer rounded-full transition hover:text-primary"
                    >
                      <MdOutlineAddCircleOutline />
                    </button>

                    <button
                      type="button"
                      aria-label="Remove item"
                      onClick={() => {
                        restoreSingleProductQuantityToCart(
                          item.id,
                          item.quantity,
                        );
                        removeCartItem(variant.id);
                      }}
                      className="cursor-pointer rounded-full text-red-500 transition hover:text-red-600"
                    >
                      <MdDeleteOutline />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

export function CartCalculation({ form }: ShowCustomerInfoProps) {
  const cart = useCartStore((state) => state.cart);
  const subTotal = Number(
    cart.reduce(
      (total, item) =>
        total + (item.variants[0]?.sellingPrice ?? 0) * item.quantity,
      0,
    ),
  );
  const vatPercent =
    useWatch({ control: form.control, name: "vatPercent" }) ?? 0;
  const vat = Number(subTotal * (vatPercent / 100));

  return (
    <div className="p-5">
      <CartTextModal subTotal={subTotal} vat={vat} form={form} />
      <div className="grid grid-cols-6 py-2 gap-1 ">
        <div className="col-span-2">
          <ClearCartDialog />
        </div>
        <div className="col-span-2">
          <HoldDropdownMenu />
        </div>
        <div className="col-span-2">
          <DiscountModal form={form} subTotal={subTotal} />
        </div>
        <div className=" col-span-6 ">
          <PaymentModal form={form} subTotal={subTotal} vat={vat} />
        </div>
      </div>
    </div>
  );
}
function CartTextModal({ subTotal, vat, form }: CartTextModalProps) {
  const cart = useCartStore((state) => state.cart);
  const totalItemsCount = cart.reduce((total) => total + 1, 0);
  const totalQuantityCount = cart.reduce(
    (total, item) => total + (item.quantity || 0),
    0,
  );

  // const handelClose = () => {
  //   setTimeout(() => setIsChargeModalOpen(false), 300);
  //   setIsOpen(false);
  // };
  const discount = useWatch({ control: form.control, name: "discount" });
  const vatPercent =
    useWatch({ control: form.control, name: "vatPercent" }) ?? 0;
  const discountValue = Number(discount?.value ?? 0);
  const rawDiscount = (subTotal * discountValue) / 100;
  const totalDiscount = Math.round((rawDiscount + Number.EPSILON) * 100) / 100;

  return (
    <>
      <div className="flex justify-between py-2 border-b">
        <span>Total Items: {totalItemsCount}</span>
        <span>Qty: {totalQuantityCount}</span>
      </div>
      <div className="flex justify-between py-2 border-b">
        <span>Subtotal</span>
        <span>TK: {subTotal.toFixed(2)}</span>
      </div>
      {discount && (
        <div className="flex justify-between py-2 ">
          <span>Discount</span>
          <span>TK: {totalDiscount.toFixed(2)}</span>
        </div>
      )}
      {Number(vatPercent) > 0 && (
        <div className="flex justify-between py-2 ">
          <span>VAT: {vatPercent}%</span>
          <span>TK: {vat.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between py-2 border-b">
        <span>FINAL TOTAL</span>
        <span>TK: {(subTotal + vat).toFixed(2)}</span>
      </div>
    </>
  );
}

export function CartItemDiscount({
  variantId,
  addDiscount,
  priceAfterFixedDiscount,
  priceAfterPercentDiscount,
  initialValue = "",
  initialType = "percentage",
}: {
  variantId: number; // match the type of variant.id
  addDiscount: (id: number, value: number, type: DiscountType) => void;
  priceAfterPercentDiscount: number;
  priceAfterFixedDiscount: number;
  initialValue?: string;
  initialType?: DiscountType;
}) {
  const [discountValue, setDiscountValue] = useState(initialValue);
  const [discountType, setDiscountType] = useState<DiscountType>(initialType);
  console.log(priceAfterFixedDiscount);
  return (
    <div className="flex items-center space-x-2">
      <Input
        value={discountValue}
        onChange={(e) => setDiscountValue(e.target.value)}
        onBlur={() => {
          addDiscount(variantId, Number(discountValue), discountType);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // Enter must not submit the cart form
            addDiscount(variantId, Number(discountValue), discountType);
          }
        }}
        className="h-8 w-20"
        type="number"
        placeholder={`${discountType === "percentage" ? "%" : "৳"} off`}
      />
      <Switch
        checked={discountType === "fixed"}
        onCheckedChange={(checked) => {
          const newType: DiscountType = checked ? "fixed" : "percentage";
          setDiscountType(newType);
          if (discountValue) {
            addDiscount(variantId, Number(discountValue), newType);
          }
        }}
        id={`discount-mode-${variantId}`}
      />
      <span>
        =
        {discountType === "percentage"
          ? priceAfterPercentDiscount
          : priceAfterFixedDiscount}
      </span>
    </div>
  );
}
