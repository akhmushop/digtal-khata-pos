export type ReportPeriod =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "this_month"
  | "last_month"
  | "this_year"
  | "custom";

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface ReportFilters {
  period: ReportPeriod;
  dateRange?: DateRange;
  customerId?: number;
  supplierId?: number;
  categoryId?: number;
  brandId?: number;
  paymentMethod?: string;
  paymentStatus?: "paid" | "partial" | "unpaid";
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ---------------- Sales ----------------
export interface SalesDailyRow {
  sale_date: string;
  invoice_count: number;
  gross_sales: number;
  total_discount: number;
  total_refunds: number;
  net_sales: number;
  gross_profit: number;
}

export interface SalesSummaryTotals {
  total_invoices: number;
  total_gross_sales: number;
  total_discount: number;
  total_refunds: number;
  total_net_sales: number;
  total_gross_profit: number;
  overall_profit_margin: number;
}

export interface SalesSummaryReportData {
  rows: SalesDailyRow[];
  totals: SalesSummaryTotals;
  periodBounds: { start: string; end: string };
}

export interface SalesInvoiceRow {
  id: number;
  invoiceNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  subtotal: number;
  discount: number;
  vat: number;
  finalTotal: number;
  paymentStatus: "paid" | "partial" | "unpaid";
  dueAmount: number;
  status: string;
  itemCount: number;
  refundAmount: number;
}

export interface ProductSalesRow {
  productId: number;
  productName: string;
  categoryName: string;
  brandName: string;
  sku: string;
  qtySold: number;
  grossSales: number;
  totalDiscount: number;
  netSales: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
}

export interface CustomerSalesRow {
  customerId: number;
  customerName: string;
  phone: string;
  invoiceCount: number;
  totalSales: number;
  outstandingDue: number;
  totalDiscount: number;
}

export interface PaymentMethodRow {
  paymentMethod: string;
  paymentCount: number;
  totalAmount: number;
}

export interface RefundRow {
  id: number;
  createdAt: string;
  invoiceNumber: string;
  customerName: string;
  reason: string;
  status: string;
  refundTotal: number;
}

// ---------------- Financial ----------------
export interface ProfitByCategoryRow {
  categoryName: string;
  netSales: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
}

export interface ProfitTotals {
  totalNetSales: number;
  totalCost: number;
  totalGrossProfit: number;
  overallMargin: number;
}

export interface ProfitReportData {
  categories: ProfitByCategoryRow[];
  totals: ProfitTotals;
}

export interface ExpenseRow {
  id: number;
  expenseDate: string;
  title: string;
  categoryName: string;
  amount: number;
  paymentMethod: string;
  referenceNo: string;
  note: string;
}

export interface ExpenseCategoryTotal {
  categoryName: string;
  expenseCount: number;
  totalAmount: number;
}

export interface ExpenseReportData {
  data: ExpenseRow[];
  total: number;
  categoryTotals: ExpenseCategoryTotal[];
  summary: { totalCount: number; grandTotal: number };
  page: number;
  limit: number;
}

export interface CustomerReceivableRow {
  id: number;
  name: string;
  phone: string;
  address: string;
  invoiceCount: number;
  totalInvoiced: number;
  outstandingDue: number;
}

export interface CustomerReceivablesReportData {
  customers: CustomerReceivableRow[];
  totals: { customerCount: number; totalReceivable: number };
}

// ---------------- Inventory ----------------
export interface StockRow {
  productId: number;
  productName: string;
  categoryName: string;
  brandName: string;
  variantId: number;
  sku: string;
  barcode: string;
  sellingPrice: number;
  alertQuantity: number;
  currentStock: number;
  reserved: number;
  stockValue: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
}

export interface StockReportData {
  data: StockRow[];
  total: number;
  valuation: { totalValuation: number; totalUnits: number };
  page: number;
  limit: number;
}

export interface StockMovementRow {
  id: number;
  createdAt: string;
  productName: string;
  sku: string;
  movementType: string;
  quantity: number;
  referenceType: string;
  referenceId: number;
}

export interface BatchRow {
  id: number;
  batchNumber: string;
  productName: string;
  sku: string;
  purchasePrice: number;
  quantityReceived: number;
  quantityRemaining: number;
  manufacturedDate: string | null;
  expiryDate: string | null;
  expiryStatus: "no_expiry" | "expired" | "expiring_soon" | "valid";
}

// ---------------- Purchases ----------------
export interface PurchaseRow {
  id: number;
  purchaseOrderNumber: string;
  purchaseDate: string;
  createdAt: string;
  supplierName: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: string;
  paymentStatus: string;
}

export interface PurchaseReportData {
  data: PurchaseRow[];
  total: number;
  totals: {
    totalPurchases: number;
    grandTotalAmount: number;
    grandPaidAmount: number;
    grandDueAmount: number;
  };
  page: number;
  limit: number;
}

export interface SupplierPayableRow {
  id: number;
  name: string;
  phone: string;
  email: string;
  purchaseCount: number;
  totalPurchased: number;
  totalPaid: number;
  outstandingDue: number;
}

export interface SupplierPayablesReportData {
  suppliers: SupplierPayableRow[];
  totals: { supplierCount: number; totalPayable: number };
}

