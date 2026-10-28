import api from "@/api/axios";

export type DueSummary = {
  customerOutstanding: number;
  customerOverdue: number;
  supplierOutstanding: number;
  supplierOverdue: number;
  amountCollectedToday: number;
  amountPaidToSuppliersToday: number;
};

export type CustomerDueRow = {
  id: number;
  customerId: number | null;
  customerName: string | null;
  phone: string | null;
  invoiceNumber: string;
  invoiceDate: string | null;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentStatus: "unpaid" | "partial" | "paid";
  isOverdue: boolean;
  dueDate: string | null;
};

export type SupplierDueRow = {
  id: number;
  supplierId: number | null;
  supplierName: string | null;
  phone: string | null;
  purchaseInvoice: string;
  purchaseDate: string | null;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentStatus: "unpaid" | "partial" | "paid";
  isOverdue: boolean;
  dueDate: string | null;
};

export async function getDueManagementSummaryApi() {
  const { data } = await api.get<DueSummary>("/due-management/summary");
  return data;
}

export async function getCustomerDueRowsApi() {
  const { data } = await api.get<CustomerDueRow[]>("/due-management/customers");
  return data;
}

export async function getSupplierDueRowsApi() {
  const { data } = await api.get<SupplierDueRow[]>("/due-management/suppliers");
  return data;
}

export async function recordCustomerPaymentApi(payload: {
  saleId: number;
  customerId?: number | null;
  amount: number;
  paymentMethod: "cash" | "bangla_qr" | "card";
  reference?: string | null;
  tendered?: number | null;
  notes?: string | null;
  paymentDate?: string | null;
}) {
  const { data } = await api.post("/due-management/customer-payment", payload);
  return data;
}

export async function recordSupplierPaymentApi(payload: {
  purchaseId: number;
  amount: number;
  method: "cash" | "bank_transfer" | "cheque" | "card" | "other";
  notes?: string | null;
  paymentDate?: string | null;
}) {
  const { data } = await api.post("/due-management/supplier-payment", payload);
  return data;
}

export async function getCustomerLedgerApi(customerId: number) {
  const { data } = await api.get(`/due-management/customer-ledger/${customerId}`);
  return data;
}

export async function getSupplierLedgerApi(supplierId: number) {
  const { data } = await api.get(`/due-management/supplier-ledger/${supplierId}`);
  return data;
}
