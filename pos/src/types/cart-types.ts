import type React from "react";
import type { ProductsTypes } from "./products-types.js";
interface CartType extends ProductsTypes {
  sold_quantity: number;
}
export interface CartStore {
  cart: CartType[];
  addToCart: (cartProduct: ProductsTypes) => void;
  removeCartItem: (id: number) => void;
  addCartQuantity: (id: number) => void;
  removeCartQuantity: (id: number) => void;
  addCustomCartQuantity: (id: number, customCartQuantity: number) => void;
  resetCart: () => void;
}
export interface CashForm {
  discount: number;
  amountReceived: number;
  change: number;
  final_total: number;
  paid_amount: number;
  note: string;
  due_amount: number;
  subtotal: number;
  vat: number;
}
export interface HoldCartItems {
  id: number;
  name: string;
  time: string;
  items: CartType[];
}
export interface ClickToShowMoreProps {
  showMore: boolean;
  setHoldConfirm: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  holdCartItems: HoldCartItems[];
  setShowMoreFalse: () => void;
  setShowHoldItems: () => void;
}
export type ClickType = "payments" | "cash";
export interface CashModalProps {
  handlePay: (handelClose: () => void, click: ClickType) => void;
  handleCashChange: (id: string, value: number | string) => void;
  cashForm: CashForm;
  setCashForm: React.Dispatch<React.SetStateAction<CashForm>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCashModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  initialCashFrom: CashForm;
}
interface BaseHoldProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  holdCartItems: HoldCartItems[];
}
export interface CartHoldBtnProps extends BaseHoldProps {
  setHoldConfirmFalse: () => void;
  setHoldCartItems: () => void;
}
export interface CartHoldShowBtnProps extends BaseHoldProps {
  setShowHoldItemsFalse: () => void;
  setHoldCartItems: React.Dispatch<React.SetStateAction<HoldCartItems[]>>;
}
export interface PeerInputProps {
  id: string;
  peerName: string;
  value: string | number;
  onChange: (id: string, value: number | string) => void;
}
export interface PaymentModalProps {
  initialCashFrom: CashForm;
  handlePay: (handelClose: () => void, click: ClickType) => void;
  paymentMethod: string;
  setPaymentMethod: React.Dispatch<React.SetStateAction<string>>;
  handleCashChange: (id: string, value: string | number) => void;
  cashForm: CashForm;
  setCashForm: React.Dispatch<React.SetStateAction<CashForm>>;
  isOpen: boolean;
  setIsPaymentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface PopupModalProps {
  handelClose: () => void;
  isOpen: boolean;
  className: string;
  children: React.ReactNode;
}
export interface CartTextModalProps {
  subTotal: number;
  vat: number;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isAddChargeModalOpen: boolean;
  setIsChargeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}
export interface AddChargeModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsChargeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface ClickEmptyToResetCartProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEmptyCartCon: () => void;
}
