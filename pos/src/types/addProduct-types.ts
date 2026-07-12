export interface InitialFormData {
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
}
export interface Errors {
  barcode: string;
  productName: string;
  cost: string;
  price: string;
  quantity: string;
  image: string | null;
}
