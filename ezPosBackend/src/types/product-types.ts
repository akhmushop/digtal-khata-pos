export interface ProductsTypes {
  id: number;
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
  image: string ;
  status: string;
  created_at: string;
  sku: string;
  weight: string;
  dimensions: string;
  variations: string;
  final_price: number;
  tags: string[];
  location:string
}