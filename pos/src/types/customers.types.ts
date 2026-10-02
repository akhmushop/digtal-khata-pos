import { FieldValues, UseFormReturn } from "react-hook-form";

export type InputValue = {
  id: number;
  name: string;
  phone: string;
  address: string;
};
export interface CustomerStore {
  customers: InputValue[];
  customerInfo: InputValue;
  customerInputValue: InputValue;
  showCustomerInfo: InputValue;
  loading: boolean;
  error: string | null;
  handleOnchange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setChecked: (value: boolean) => void,
  ) => void;
  setShowCustomerInfo: (customer: InputValue | null) => void;
  resetCustomerInfo: () => void;
  resetShowCustomerInfo: () => void;
  handleAddCustomer: () => void;
  getCustomers: () => void;
  addCustomer: (customerInfo: InputValue) => void;
}
export type PeerFocusInputProps = {
  placeholder: string;
  id: string;
  handleOnchange: React.ChangeEventHandler<HTMLInputElement>;
  value: string;
  colSpan: string;
};
export type AddCustomerProps = {
  handleOnchange: React.ChangeEventHandler<HTMLInputElement>;
  customerInfo: InputValue;
  handleAddCustomer: () => void;
  setIsOpenCustomerModal: React.Dispatch<React.SetStateAction<boolean>>;
  resetCustomerInfo: () => void;
};
export interface CustomerDue {
  customerId: number;
  totalAmount: number;
  total_due: number;
  total_paid: number;
}
export interface ShowCustomerInfoProps {
  showCustomerInfo: InputValue;
  form: UseFormReturn<FieldValues, any, FieldValues>;
}
