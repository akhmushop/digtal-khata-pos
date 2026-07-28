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
