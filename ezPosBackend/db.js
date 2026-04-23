import { Pool } from "pg";
export const pool = new Pool({
  user: "postgres",
  password: "000010",
  host: "localhost",
  port: 5432,
  database: "ezPos",
});

// {"id":"PROD-001","barcode":"18210001","productName":"Apple iPhone 15 Pro Max","productUnit":"PC","productType":"SIMPLE","alertQuantity":5,"cost":899.99,"price":1199.99,"discountPercent":0,"flatDiscount":0,"quantity":50,"batchNumber":"BATCH-2024-01","expiryDate":"2025-12-31","description":"Latest iPhone with Titanium design, A17 Pro chip, and advanced camera system. 256GB storage, Deep Purple color.","brand":"Apple","category":"Electronics","tags":["smartphone","premium","apple","iphone"],"supplier":"Apple Inc.","image":"https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400","status":"active","createdAt":"2024-01-15","sku":"APL-IP15PM-256-PUR","weight":"221g","dimensions":"159.9 x 76.7 x 8.3 mm"}