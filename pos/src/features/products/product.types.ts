import {
  ProductTypeInput,
  ProductTypeOutput,
} from "@/features/products/product.schema";
import {
  FieldPath,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFieldArrayReplace,
  UseFormReturn,
} from "react-hook-form";
export interface ProductStoreType {
  productSelectOptions: {
    brands: {
      value: number;
      label: string;
    }[];
    units: {
      value: number;
      label: string;
    }[];
    categories: {
      value: number;
      label: string;
    }[];
    suppliers: {
      value: number;
      label: string;
    }[];
  };
  productVariantOptions: VariantOptionGroup[];
  loading: boolean;
  error: string | null;
  getProductSelectOptions: () => void;
  getProductVariantOptions: () => void;
  createProduct: (data: ProductTypeOutput) => void;
}
export interface SelectOptionsProps {
  options: {
    value: number | string;
    label: string;
    title?: string;
  }[];
  label: string;
  form: UseFormReturn<ProductTypeInput>;
  name: FieldPath<ProductTypeInput>;
}
export interface InputFieldProps {
  placeholder: string;
  label?: string;
  name: FieldPath<ProductTypeInput>;
  type: "text" | "number" | "textArea";
  form: UseFormReturn<ProductTypeInput>;
  disabled?: boolean;
}
export interface ExpiryDatePickerProps {
  form: UseFormReturn<ProductTypeInput>;
  index: number;
}
export interface AllVariantsType {
  color: string;
  size: string;
}
export interface ProductInfoInputProps {
  form: UseFormReturn<ProductTypeInput>;
  variantIndex: number;
  remove?: UseFieldArrayRemove;
}
export interface AccordionCardProps {
  form: UseFormReturn<ProductTypeInput>;
  append: UseFieldArrayAppend<ProductTypeInput, "variants">;
  replace: UseFieldArrayReplace<ProductTypeInput, "variants">;
  remove: UseFieldArrayRemove;
}
export interface VariantRowProps {
  form: UseFormReturn<ProductTypeInput>;
  append: UseFieldArrayAppend<ProductTypeInput, "variants">;
  remove: UseFieldArrayRemove;
  replace: UseFieldArrayReplace<ProductTypeInput, "variants">;
  comboboxVariantTypeName: string[];
  allVariants: GeneratedVariant[];
}
export interface InputFileProps {
  urlName: FieldPath<ProductTypeInput>;
  fileName: FieldPath<ProductTypeInput>;
  form: UseFormReturn<ProductTypeInput>;
  label: string;
}
export interface InventorySourceSelectorProps {
  form: UseFormReturn<ProductTypeInput>;
  inventoryOptions: {
    value: string;
    title: string;
    label: string;
  }[];
}
export type VariantOption = {
  typeId: number;
  typeName: string;
  optionId: number;
  value: string;
};
export type VariantOptionGroup = {
  typeId: number;
  typeName: string;
  options: {
    optionId: number;
    value: string;
  }[];
};
export type GeneratedVariant = {
  options: VariantOption[];
};
export type HasVariantOptions = {
  options?: VariantOption[] | undefined;
};
export type VariantTableRowProps = {
  variant: GeneratedVariant;
  form: UseFormReturn<ProductTypeInput>;
  remove: UseFieldArrayRemove;
  expanded: string | null;
  setExpanded: React.Dispatch<React.SetStateAction<string | null>>;
  onAddVariant: (variant: GeneratedVariant) => void;
  onRemoveVariant: (variantIndex: number) => void;
};
