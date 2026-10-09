import { useEffect, useMemo, useState } from "react";
import { MdOutlineAddCircleOutline, MdDeleteOutline } from "react-icons/md";
import { FiMinusCircle } from "react-icons/fi";
import { useWatch } from "react-hook-form";
import { ClearCartDialog } from "./ClearCartDialog.js";
import type { DiscountType } from "../../types/cart.types.js";
import { useProductStore } from "@/features/products/usedashboardProductStore.js";
import { useCartStore } from "@/features/pos/stores/useCartStore.js";
import type {
  CustomerDue,
  ShowCustomerInfoProps,
} from "@/types/customers.types.js";
import axios from "../../../../api/axios.js";
import { useCustomerStore } from "@/store/useCustomerStore.js";
import { PaymentModal } from "./PaymentModal.js";
import { DiscountModal } from "./DiscountModal.js";
import { HoldDropdownMenu } from "./HoldDropdownMenu.js";
import { Card, CardContent } from "@/components/ui/card.js";
import { Input } from "@/components/ui/input.js";
import { Switch } from "@/components/ui/switch.js";
import { getCartTotals, getLinePricing } from "../../cartPricing.js";

const FALLBACK_IMAGE =
  "https://www.startech.com.bd/image/cache/catalog/ceiling-fan/qulik/windora/windora-01-500x500.webp";

type CartItem = ReturnType<typeof useCartStore.getState>["cart"][number];

const tk = (n: number) => `৳${n.toFixed(2)}`;

// ---------- shared totals (used by every cart component) ----------
function useCartTotals(form: ShowCustomerInfoProps["form"]) {
  const cart = useCartStore((state) => state.cart);
  const discount = useWatch({ control: form.control, name: "discount" });
  const vatPercent =
    useWatch({ control: form.control, name: "vatPercent" }) ?? 0;

  return useMemo(
    () => getCartTotals(cart, discount, Number(vatPercent)),
    [cart, discount, vatPercent],
  );
}

// ---------- customer info ----------
function CartCustomerInfo() {
  const showCustomerInfo = useCustomerStore((state) => state.showCustomerInfo);
  const [dueByCustomers, setDueByCustomers] = useState<CustomerDue[]>([]);
  const { name, phone, address, id } = showCustomerInfo || {};

  // reload when the customer changes, so the due is never stale
  useEffect(() => {
    let ignore = false;
    axios
      .get("due_by_customers")
      .then((res) => {
        if (!ignore) setDueByCustomers(res.data);
      })
      .catch((err) => console.error("Failed to load customer dues", err));
    return () => {
      ignore = true;
    };
  }, [id]);

  if (!name && !phone) return null;

  const customerDue = dueByCustomers.find((c) => c.customerId === id);

  return (
    <Card className="my-2">
      <CardContent className="grid grid-cols-2 gap-1">
        <span>Name: {name}</span>
        <span>Phone: {phone}</span>
        <span className="col-span-2">Address: {address}</span>
        <span className="col-span-2">
          {customerDue
            ? `Total Amount: ${customerDue.totalAmount}, Total Paid: ${customerDue.total_paid}, Total Due: ${customerDue.total_due}`
            : "No Due"}
        </span>
      </CardContent>
    </Card>
  );
}

// ---------- cart list ----------
export default function CartItems() {
  const cart = useCartStore((state) => state.cart);

  return (
    <>
      <CartCustomerInfo />
      <div className="flex flex-col gap-3">
        {cart.map((item) => (
          <CartItemRow key={item.variants[0]?.id ?? item.id} item={item} />
        ))}
      </div>
    </>
  );
}

// ---------- one cart row ----------
function CartItemRow({ item }: { item: CartItem }) {
  const addProductQuantityToCart = useProductStore(
    (s) => s.addProductQuantityToCart,
  );
  const removeProductQuantityToCart = useProductStore(
    (s) => s.removeProductQuantityToCart,
  );
  const restoreSingleProductQuantityToCart = useProductStore(
    (s) => s.restoreSingleProductQuantityToCart,
  );
  const addCartQuantity = useCartStore((s) => s.addCartQuantity);
  const removeCartQuantity = useCartStore((s) => s.removeCartQuantity);
  const removeCartItem = useCartStore((s) => s.removeCartItem);
  const addCustomCartQuantity = useCartStore((s) => s.addCustomCartQuantity);
  const addDiscount = useCartStore((s) => s.addDiscount);

  const variant = item.variants[0];
  if (!variant) return null;

  const quantity = Number(item.quantity);
  const unitPrice = Number(variant.sellingPrice);
  const line = getLinePricing(unitPrice, quantity, item.discount);

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-3">
          <img
            className="h-20 w-20 shrink-0 rounded-xl object-cover"
            src={item.imageUrl ?? FALLBACK_IMAGE}
            alt={item.name}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate font-medium">{item.name}</span>
            <span className="text-sm text-muted-foreground">
              {unitPrice.toFixed(2)} × {quantity} ={" "}
              <span className="font-semibold text-foreground">
                {line.base.toFixed(2)}
              </span>
            </span>

            <CartItemDiscount
              variantId={variant.id}
              discount={item.discount}
              lineBase={line.base}
              lineTotal={line.total}
              hasDiscount={line.discountAmount > 0}
              addDiscount={addDiscount}
            />
          </div>

          <div className="flex items-center gap-x-3 text-2xl">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => {
                addProductQuantityToCart(item.id);
                removeCartQuantity(variant.id);
              }}
              className="cursor-pointer rounded-full transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiMinusCircle />
            </button>

            <CartQuantityInput
              itemId={variant.id}
              quantity={quantity}
              addCustomCartQuantity={addCustomCartQuantity}
            />

            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => {
                removeProductQuantityToCart(item.id);
                addCartQuantity(variant.id);
              }}
              className="cursor-pointer rounded-full transition hover:text-primary"
            >
              <MdOutlineAddCircleOutline />
            </button>

            <button
              type="button"
              aria-label="Remove item"
              onClick={() => {
                restoreSingleProductQuantityToCart(item.id, item.quantity);
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
}

// ---------- totals + action buttons ----------
export function CartCalculation({ form }: ShowCustomerInfoProps) {
  const totals = useCartTotals(form);

  return (
    <div className="p-5">
      <CartTextModal totals={totals} />
      <div className="grid grid-cols-6 gap-1 py-2">
        <div className="col-span-2">
          <ClearCartDialog />
        </div>
        <div className="col-span-2">
          <HoldDropdownMenu />
        </div>
        <div className="col-span-2">
          {/* discount is applied on the amount after item discounts */}
          <DiscountModal form={form} subTotal={totals.itemsTotal} />
        </div>
        <div className="col-span-6">
          {/* payment gets the amount after discount, plus VAT */}
          <PaymentModal
            form={form}
            subTotal={totals.afterDiscount}
            vat={totals.vat}
          />
        </div>
      </div>
    </div>
  );
}

function CartTextModal({
  totals,
}: {
  totals: ReturnType<typeof getCartTotals>;
}) {
  const cart = useCartStore((state) => state.cart);
  const totalItemsCount = cart.length;
  const totalQuantityCount = cart.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );

  return (
    <>
      <div className="flex justify-between border-b py-2">
        <span>Total Items: {totalItemsCount}</span>
        <span>Qty: {totalQuantityCount}</span>
      </div>
      <div className="flex justify-between border-b py-2">
        <span>Subtotal</span>
        <span>{tk(totals.itemsBase)}</span>
      </div>
      {totals.itemDiscount > 0 && (
        <div className="flex justify-between py-2">
          <span>Item discounts</span>
          <span>-{tk(totals.itemDiscount)}</span>
        </div>
      )}
      {totals.cartDiscountAmount > 0 && (
        <div className="flex justify-between py-2">
          <span>Discount</span>
          <span>-{tk(totals.cartDiscountAmount)}</span>
        </div>
      )}
      {totals.vatPercent > 0 && (
        <div className="flex justify-between py-2">
          <span>VAT: {totals.vatPercent}%</span>
          <span>{tk(totals.vat)}</span>
        </div>
      )}
      <div className="flex justify-between border-b py-2 font-semibold">
        <span>FINAL TOTAL</span>
        <span>{tk(totals.finalTotal)}</span>
      </div>
    </>
  );
}

// ---------- per-item discount ----------
type CartItemDiscountProps = {
  variantId: number;
  discount: CartItem["discount"]; // current value from the store
  lineBase: number; // price x qty, the max for a fixed discount
  lineTotal: number;
  hasDiscount: boolean;
  addDiscount: (id: number, value: number, type: DiscountType) => void;
};

export function CartItemDiscount({
  variantId,
  discount,
  lineBase,
  lineTotal,
  hasDiscount,
  addDiscount,
}: CartItemDiscountProps) {
  const [value, setValue] = useState(discount ? String(discount.value) : "");
  const [type, setType] = useState<DiscountType>(
    discount?.type ?? "percentage",
  );

  // keep the input in sync with the store (clear cart, hold/restore, clamped values)
  useEffect(() => {
    setValue(discount ? String(discount.value) : "");
    if (discount) setType(discount.type);
  }, [discount?.value, discount?.type]);

  const commit = (nextValue: string, nextType: DiscountType) => {
    const raw = Number(nextValue);

    // empty / 0 / invalid -> remove the discount
    if (nextValue === "" || !Number.isFinite(raw) || raw <= 0) {
      setValue("");
      addDiscount(variantId, 0, nextType);
      return;
    }

    const max = nextType === "percentage" ? 100 : lineBase;
    const clamped = Math.min(raw, max);
    setValue(String(clamped));
    addDiscount(variantId, clamped, nextType);
  };

  return (
    <div className="flex items-center space-x-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => commit(value, type)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // Enter must not submit the cart form
            commit(value, type);
          }
        }}
        className="h-8 w-20"
        type="number"
        min={0}
        placeholder={`${type === "percentage" ? "%" : "৳"} off`}
        aria-label="Item discount"
      />
      <Switch
        checked={type === "fixed"}
        onCheckedChange={(checked) => {
          const nextType: DiscountType = checked ? "fixed" : "percentage";
          setType(nextType);
          if (value) commit(value, nextType);
        }}
        id={`discount-mode-${variantId}`}
        aria-label="Fixed amount discount"
      />
      {hasDiscount && (
        <span className="text-sm font-medium text-green-600">
          = {tk(lineTotal)}
        </span>
      )}
    </div>
  );
}

// ---------- quantity input ----------
interface CartQuantityInputProps {
  itemId: number;
  quantity: number; // from the cart store
  addCustomCartQuantity: (id: number, qty: number) => void;
}

export function CartQuantityInput({
  itemId,
  quantity,
  addCustomCartQuantity,
}: CartQuantityInputProps) {
  const [inputValue, setInputValue] = useState(String(quantity));

  // changes from the +/- buttons or the product grid update the input
  useEffect(() => {
    setInputValue(String(quantity));
  }, [quantity]);

  const commitChange = (val: string) => {
    const parsed = Math.floor(Number(val));
    // empty, 0, negative or invalid -> go back to the current quantity
    const newQty = Number.isFinite(parsed) && parsed >= 1 ? parsed : quantity;

    if (newQty !== quantity) {
      addCustomCartQuantity(itemId, newQty);
    }

    // Show what the store really holds (it may clamp to available stock).
    // Zustand updates synchronously, so this reads the new value.
    const stored =
      useCartStore.getState().cart.find((i) => i.id === itemId)?.quantity ??
      quantity;
    setInputValue(String(stored));
  };

  return (
    <Input
      className="h-8 w-15 text-center"
      type="number"
      min={1}
      step={1}
      value={inputValue}
      aria-label="Quantity"
      onChange={(e) => setInputValue(e.target.value)}
      onFocus={(e) => e.target.select()}
      onBlur={(e) => commitChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commitChange(e.currentTarget.value);
          e.currentTarget.blur();
        }
      }}
    />
  );
}
