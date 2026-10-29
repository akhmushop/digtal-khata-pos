import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCustomerDueBalancesApi,
  getCustomerDueRowsApi,
  getCustomerLedgerApi,
  getDueSummaryApi,
  getDueTrendApi,
  getPurchasePaymentsApi,
  getSalePaymentsApi,
  getSupplierDueRowsApi,
  getSupplierLedgerApi,
  recordCustomerPaymentApi,
  recordSupplierPaymentApi,
  type DueRowFilter,
  type RecordCustomerPaymentInput,
  type RecordSupplierPaymentInput,
} from "../api/dueManagement.api";

export const dueKeys = {
  all: ["due-management"] as const,
  summary: () => [...dueKeys.all, "summary"] as const,
  trend: (days: number) => [...dueKeys.all, "trend", days] as const,
  customerRows: (filters: DueRowFilter) =>
    [...dueKeys.all, "customers", filters] as const,
  supplierRows: (filters: DueRowFilter) =>
    [...dueKeys.all, "suppliers", filters] as const,
  customerBalances: () => [...dueKeys.all, "customer-balances"] as const,
  salePayments: (saleId: number) =>
    [...dueKeys.all, "sale-payments", saleId] as const,
  purchasePayments: (purchaseId: number) =>
    [...dueKeys.all, "purchase-payments", purchaseId] as const,
  customerLedger: (customerId: number, from?: string, to?: string) =>
    [...dueKeys.all, "customer-ledger", customerId, from ?? null, to ?? null] as const,
  supplierLedger: (supplierId: number, from?: string, to?: string) =>
    [...dueKeys.all, "supplier-ledger", supplierId, from ?? null, to ?? null] as const,
};

export function useDueSummary() {
  return useQuery({
    queryKey: dueKeys.summary(),
    queryFn: getDueSummaryApi,
  });
}

export function useDueTrend(days = 14) {
  return useQuery({
    queryKey: dueKeys.trend(days),
    queryFn: () => getDueTrendApi(days),
  });
}

export function useCustomerDueRows(filters: DueRowFilter) {
  return useQuery({
    queryKey: dueKeys.customerRows(filters),
    queryFn: () => getCustomerDueRowsApi(filters),
  });
}

export function useSupplierDueRows(filters: DueRowFilter) {
  return useQuery({
    queryKey: dueKeys.supplierRows(filters),
    queryFn: () => getSupplierDueRowsApi(filters),
  });
}

export function useCustomerDueBalances() {
  return useQuery({
    queryKey: dueKeys.customerBalances(),
    queryFn: getCustomerDueBalancesApi,
  });
}

export function useSalePayments(saleId: number | null) {
  return useQuery({
    queryKey: dueKeys.salePayments(saleId ?? 0),
    queryFn: () => getSalePaymentsApi(saleId as number),
    enabled: saleId !== null,
  });
}

export function usePurchasePayments(purchaseId: number | null) {
  return useQuery({
    queryKey: dueKeys.purchasePayments(purchaseId ?? 0),
    queryFn: () => getPurchasePaymentsApi(purchaseId as number),
    enabled: purchaseId !== null,
  });
}

export function useCustomerLedger(
  customerId: number | null,
  range: { from?: string | undefined; to?: string | undefined },
) {
  return useQuery({
    queryKey: dueKeys.customerLedger(
      customerId ?? 0,
      range.from,
      range.to,
    ),
    queryFn: () => getCustomerLedgerApi(customerId as number, range),
    enabled: customerId !== null,
  });
}

export function useSupplierLedger(
  supplierId: number | null,
  range: { from?: string | undefined; to?: string | undefined },
) {
  return useQuery({
    queryKey: dueKeys.supplierLedger(
      supplierId ?? 0,
      range.from,
      range.to,
    ),
    queryFn: () => getSupplierLedgerApi(supplierId as number, range),
    enabled: supplierId !== null,
  });
}

function useInvalidateDueData() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: dueKeys.all });
  };
}

export function useRecordCustomerPayment() {
  const invalidate = useInvalidateDueData();
  return useMutation({
    mutationFn: (payload: RecordCustomerPaymentInput) =>
      recordCustomerPaymentApi(payload),
    onSuccess: invalidate,
  });
}

export function useRecordSupplierPayment() {
  const invalidate = useInvalidateDueData();
  return useMutation({
    mutationFn: (payload: RecordSupplierPaymentInput) =>
      recordSupplierPaymentApi(payload),
    onSuccess: invalidate,
  });
}
