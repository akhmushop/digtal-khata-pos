import api from "@/api/axios";

export type DuePaymentStatus = "unpaid" | "partial" | "paid" | "credit";

export type DueSummary = {
  customerOutstanding: number;
  customerOverdue: number;
  customersWithDue: number;
  supplierOutstanding: number;
  supplierOverdue: number;
  suppliersWithPayable: number;
  amountCollectedToday: number;
  amountPaidToSuppliersToday: number;
  overdueDays: number;
};

export type DueTrendPoint = {
  date: string;
  collected: number;
  paidToSuppliers: number;
};

export type DueTrend = {
  days: number;
  points: DueTrendPoint[];
};

export type DueRowFilter = {
  search?: string | undefined;
  status?: "all" | "unpaid" | "partial" | "paid" | "overdue" | undefined;
  from?: string | undefined;
  to?: string | undefined;
  overdueDays?: number | undefined;
};

export type CustomerDueRow = {
  saleId: number;
  customerId: number | null;
  customerName: string | null;
  phone: string | null;
  isWalkIn: boolean;
  invoiceNumber: string;
  invoiceDate: string | null;
  totalAmount: number;
  paidAmount: number;
  refundAmount: number;
  outstandingAmount: number;
  status: DuePaymentStatus;
  isOverdue: boolean;
};

export type SupplierDueRow = {
  purchaseId: number;
  supplierId: number | null;
  supplierName: string | null;
  phone: string | null;
  purchaseInvoice: string;
  purchaseDate: string | null;
  purchaseStatus: string | null;
  totalAmount: number;
  paidAmount: number;
  returnAmount: number;
  outstandingAmount: number;
  status: DuePaymentStatus;
  isOverdue: boolean;
};

export type CustomerDueBalance = {
  customerId: number;
  name: string;
  phone: string | null;
  balance: number;
  openInvoices: number;
  latestInvoiceDate: string | null;
};

export type RecordCustomerPaymentInput = {
  saleId: number;
  amount: number;
  paymentMethod: "cash" | "bangla_qr" | "card";
  reference?: string | null;
  tendered?: number | null;
  notes?: string | null;
  paymentDate?: string | null;
};

export type RecordSupplierPaymentInput = {
  purchaseId: number;
  amount: number;
  method: "cash" | "bank_transfer" | "cheque" | "card" | "other";
  notes?: string | null;
  paymentDate?: string | null;
};

export type RecordPaymentResult = {
  saleId?: number;
  purchaseId?: number;
  invoiceNumber?: string;
  purchaseOrderNumber?: string;
  paymentId: number;
  amount: number;
  outstandingAfter: number;
  paymentStatus: string;
};

export type SalePayment = {
  id: number;
  amount: number;
  paymentMethod: string;
  reference: string | null;
  tendered: number | null;
  paymentDate: string;
  notes: string | null;
};

export type PurchasePayment = {
  id: number;
  amount: number;
  method: string;
  notes: string | null;
  paymentDate: string;
};

export type LedgerParty = {
  kind: "customer" | "supplier";
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
};

export type LedgerTransaction = {
  type: "invoice" | "payment" | "refund" | "purchase" | "return";
  transactionDate: string | null;
  reference: string;
  description: string | null;
  debit: number;
  credit: number;
  relatedId: number | null;
  runningBalance: number;
};

export type LedgerStatement = {
  party: LedgerParty;
  from: string | null;
  to: string | null;
  openingBalance: number;
  transactions: LedgerTransaction[];
  totals: { debit: number; credit: number; closing: number };
};

function toQuery(filters: DueRowFilter): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status && filters.status !== "all")
    params.set("status", filters.status);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.overdueDays) params.set("overdueDays", String(filters.overdueDays));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getDueSummaryApi() {
  const { data } = await api.get<DueSummary>("/due-management/summary");
  return data;
}

export async function getDueTrendApi(days = 14) {
  const { data } = await api.get<DueTrend>("/due-management/trend", {
    params: { days },
  });
  return data;
}

export async function getCustomerDueRowsApi(filters: DueRowFilter = {}) {
  const { data } = await api.get<CustomerDueRow[]>(
    `/due-management/customers${toQuery(filters)}`,
  );
  return data;
}

export async function getSupplierDueRowsApi(filters: DueRowFilter = {}) {
  const { data } = await api.get<SupplierDueRow[]>(
    `/due-management/suppliers${toQuery(filters)}`,
  );
  return data;
}

export async function getCustomerDueBalancesApi() {
  const { data } = await api.get<CustomerDueBalance[]>(
    "/due-management/customers/balances",
  );
  return data;
}

export async function recordCustomerPaymentApi(
  payload: RecordCustomerPaymentInput,
) {
  const { data } = await api.post<{ success: boolean; data: RecordPaymentResult }>(
    "/due-management/customer-payment",
    payload,
  );
  return data.data;
}

export async function recordSupplierPaymentApi(
  payload: RecordSupplierPaymentInput,
) {
  const { data } = await api.post<{ success: boolean; data: RecordPaymentResult }>(
    "/due-management/supplier-payment",
    payload,
  );
  return data.data;
}

export async function getSalePaymentsApi(saleId: number) {
  const { data } = await api.get<{
    invoiceNumber: string;
    payments: SalePayment[];
  }>(`/due-management/sales/${saleId}/payments`);
  return data;
}

export async function getPurchasePaymentsApi(purchaseId: number) {
  const { data } = await api.get<{
    purchaseOrderNumber: string;
    payments: PurchasePayment[];
  }>(`/due-management/purchases/${purchaseId}/payments`);
  return data;
}

export type LedgerRange = {
  from?: string | undefined;
  to?: string | undefined;
};

export async function getCustomerLedgerApi(
  customerId: number,
  range: LedgerRange = {},
) {
  const params = new URLSearchParams();
  if (range.from) params.set("from", range.from);
  if (range.to) params.set("to", range.to);
  const query = params.toString();
  const { data } = await api.get<LedgerStatement>(
    `/due-management/customer-ledger/${customerId}${query ? `?${query}` : ""}`,
  );
  return data;
}

export async function getSupplierLedgerApi(
  supplierId: number,
  range: LedgerRange = {},
) {
  const params = new URLSearchParams();
  if (range.from) params.set("from", range.from);
  if (range.to) params.set("to", range.to);
  const query = params.toString();
  const { data } = await api.get<LedgerStatement>(
    `/due-management/supplier-ledger/${supplierId}${query ? `?${query}` : ""}`,
  );
  return data;
}
