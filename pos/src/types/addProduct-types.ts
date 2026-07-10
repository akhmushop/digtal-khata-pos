export interface InitialFormData {
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
  tags: string[];
}
export interface Errors {
  barcode: string;
  product_name: string;
  cost: string;
  price: string;
  quantity: string;
  image: string | null;
}
