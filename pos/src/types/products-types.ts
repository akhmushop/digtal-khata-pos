import { InitialFormData } from "./addProduct-types";

export interface ProductsTypes {
  id?: number;
  barcode: string;
  product_name: string;
  product_unit: string;
  product_type: string;
  alert_quantity: number;
  cost: number;
  price: number;
  discount_percent: number;
  flat_discount: number;
  quantity: number;
  batch_number: string;
  expiry_date: string;
  description: string;
  brand: string;
  category: string;
  supplier: string;
  image: string | null;
  status?: string;
  created_at: string;
  sku?: string;
  weight?: string;
  dimensions?: string;
  variations?: string;
  final_price: number;
  tags: string[];
}

export interface ProductsStore {
  products: ProductsTypes[];
  loading: boolean;
  error: string | null;
  getProducts: () => void;
  removeProductQuantity: (id: number) => void;
  removeProductQuantityToCart: (id: number) => void;
  addProductQuantityToCart: (id: number) => void;
  restoreSingleProductQuantityToCart: (
    id: number,
    sold_quantity: number,
  ) => void;
  addCustomProductQuantityToCart: (
    id: number,
    customQuantity: number,
    sold_quantity: number,
  ) => void;
  restoreAllProductQuantityToCart: (id: number, sold_quantity: number) => void;
  updateStock: (id: number, newStock: number) => void;
  addToProduct: (product: ProductsTypes) => void;
  removeProduct: (id: number) => void;
  duplicateProduct: (product: ProductsTypes) => void;
  updateProduct: (
    id: number | undefined,
    updated_product: Partial<ProductsTypes>,
  ) => void;
}
export interface EditingProductsStore {
  editingProduct: ProductsTypes | null;
  setEditingProduct: (product: ProductsTypes | null) => void;
}
