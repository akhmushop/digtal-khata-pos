import { InitialFormData } from "./addProduct-types";

export interface ProductsTypes {
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
  image: string;
  status: string;
  createdAt: string;
  sku: string;
  weight: string;
  dimensions: string;
  variations: string;
  finalPrice: number;
  tags: string[];
  location: string;
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
    soldQuantity: number,
  ) => void;
  addCustomProductQuantityToCart: (
    id: number,
    customQuantity: number,
    soldQuantity: number,
  ) => void;
  restoreAllProductQuantityToCart: (id: number, soldQuantity: number) => void;
  updateStock: (id: number, newStock: number) => void;
  addToProduct: (product: Partial<ProductsTypes>) => void;
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
