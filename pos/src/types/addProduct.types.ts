import { AddProductFormInput } from "@/schemas/product.schema";
import {
  FieldPath,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFieldArrayReplace,
  UseFormReturn,
} from "react-hook-form";
export interface InitialFormData {
  id: number;
  barcode: string;
  productName: string;
  productUnit: string;
  productType: string;
  alertQuantity: number;
  cost: number;
  price: number;
  discountPercent: number;
  flatDiscount: number;
  quantity: number;
  batchNumber: string;
  expiryDate: string;
  description: string;
  brand: string;
  category: string;
  supplier: string;
  tags: string[];
  sku: string;
  weight: string;
  dimensions: string;
  variations: string;
  status: string;
  location: string;
}
export interface Errors {
  barcode: string;
  productName: string;
  cost: string;
  price: string;
  quantity: string;
  image: string | null;
}
export interface SelectOptionsProps {
  options: {
    label: string;
    value: number | string | null;
    title?: string;
  }[];
  label: string;
  form: UseFormReturn<AddProductFormInput>;
  name: FieldPath<AddProductFormInput>;
}
export interface InputFieldProps {
  placeholder: string;
  label?: string;
  name: FieldPath<AddProductFormInput>;
  type: "text" | "number" | "textArea";
  form: UseFormReturn<AddProductFormInput>;
}
export interface DatePickerSimpleProps {
  form: UseFormReturn<AddProductFormInput>;
  index: number;
}
export interface AllVariantsType {
  color: string;
  size: string;
}
export interface ProductInfoInputProps {
  form: UseFormReturn<AddProductFormInput>;
  variantIndex: number;
  remove?: UseFieldArrayRemove;
}
export interface AccordionCardProps {
  form: UseFormReturn<AddProductFormInput>;
  append: UseFieldArrayAppend<AddProductFormInput, "variants">;
  replace: UseFieldArrayReplace<AddProductFormInput, "variants">;
  remove: UseFieldArrayRemove;
}
export interface VariantRowProps {
  form: UseFormReturn<AddProductFormInput>;
  append: UseFieldArrayAppend<AddProductFormInput, "variants">;
  remove: UseFieldArrayRemove;
  replace: UseFieldArrayReplace<AddProductFormInput, "variants">;
}
export interface InputFileProps {
  urlName: FieldPath<AddProductFormInput>;
  fileName: FieldPath<AddProductFormInput>;
  form: UseFormReturn<AddProductFormInput>;
  label: string;
}
export interface RadioGroupDescriptionProps {
  form: UseFormReturn<AddProductFormInput>;
  inventoryOptions: {
    value: string;
    title: string;
    label: string;
  }[];
}
