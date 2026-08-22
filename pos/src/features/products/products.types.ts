

export interface ProductsTypes {
  id: number;
  productName: string;
  productUnit: string;
  productType: string;
  description: string;
  brand: string;
  category: string;
  supplier: string;
  image: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  hasVariants: boolean;
  variants: {
    id: number;
    sku: string;
    image: string;
    status: string;
    weight: number;
    barcode: string;
    options: { type: string; value: string }[] | null;
    quantity: number;
    created_at: string;
    dimensions: string;
    is_default: boolean;
    product_id: number;
    updated_at: string;
    expiry_date: string;
    final_price: number;
    batch_number: number;
    flat_discount: number;
    selling_price: number;
    alert_quantity: number;
    purchase_price: number;
    discount_percent: number;
  }[];
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
  addToProduct: (product: ProductsTypes) => void;
  removeProduct: (id: number) => void;
  duplicateProduct: (product: ProductsTypes) => void;
  updateProduct: (id: number, updated_product: Partial<ProductsTypes>) => void;
}
export interface EditingProductsStore {
  editingProduct: ProductsTypes | null;
  setEditingProduct: (product: ProductsTypes | null) => void;
}
