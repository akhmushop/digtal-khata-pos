import { useEffect, useRef, useState } from "react";
import { MdOutlineAddCircleOutline, MdDeleteOutline } from "react-icons/md";
import { FiMinusCircle } from "react-icons/fi";
import { ClearCartDialog } from "./ClearCartDialog.js";
import type { CartTextModalProps } from "../../../../types/cart.types.js";
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
          return (
            <Card key={item.id}>
              <CardContent>
                <div className="flex items-center">
                  <img
                    className="h-20 w-20  rounded-xl "
                    src={
                      item.imageUrl ??
                      "https://www.startech.com.bd/image/cache/catalog/ceiling-fan/qulik/windora/windora-01-500x500.webp"
                    }
                    alt=""
                  />
                  <div className="flex flex-col flex-1 pl-5">
                    <span>{item.name}</span>
                    <span>
                      {Number(variant.sellingPrice).toFixed(2)} ×{" "}
                      {Number(item.quantity)} ={" "}
                      {(
                        Number(variant.sellingPrice) * Number(item.quantity)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex text-2xl gap-x-4 items-center pr-5  ">
                    <div
                      onClick={() => {
                        addProductQuantityToCart(item.id);
                        removeCartQuantity(item.id);
                      }}
                      className="cursor-pointer"
                    >
                      <FiMinusCircle />
                    </div>
                    <span
                      onClick={() => {
                        setEditQuantityId(item.id);
                      }}
                      className=""
                    >
                      {editQuantityId === item.id ? (
                        <input
                          type="number"
                          className="h-7 w-11 border"
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
                    <div
                      onClick={() => {
                        removeProductQuantityToCart(item.id);
                        addCartQuantity(item.id);
                      }}
                      className="cursor-pointer"
                    >
                      <MdOutlineAddCircleOutline />
                    </div>
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        restoreSingleProductQuantityToCart(
                          item.id,
                          item.quantity,
                        );
                        removeCartItem(item.id);
                      }}
                    >
                      <MdDeleteOutline />
                    </div>
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
