import React, { useState } from "react";
import { DollarSign, FileCheck, ShoppingCart, Truck } from "lucide-react";
import { reportsApi } from "../api/reports.api";
import { useReportData } from "../hooks/useReportData";
import type { ReportFilters, PurchaseRow } from "../types/report.types";
import {
  exportToCsv,
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "../utils/reportUtils";
import { ReportHeader } from "../components/ReportHeader";
import { ReportDateFilter } from "../components/ReportDateFilter";
import { ReportMetricCard } from "../components/ReportMetricCard";
import { ReportTable, type ReportColumn } from "../components/ReportTable";
import { StatusBadge } from "../components/StatusBadge";

export function PurchaseSummaryReport() {
  const [filters, setFilters] = useState<ReportFilters>({
    period: "this_month",
    page: 1,
    limit: 50,
  });

  const { data, loading, error, refetch } = useReportData(
    () => reportsApi.getPurchaseSummary(filters),
    [filters]
  );

  const purchases = data?.data || [];
  const totals = data?.totals;
  const total = data?.total || 0;

  const handleExport = () => {
    const headers = [
      "PO Number",
      "Created Date",
      "Supplier",
      "Total Amount (BDT)",
      "Paid Amount (BDT)",
      "Due Amount (BDT)",
      "Order Status",
      "Payment Status",
    ];
    const exportRows = purchases.map((p) => [
      p.purchaseOrderNumber,
      p.createdAt,
      p.supplierName,
      p.totalAmount,
      p.paidAmount,
      p.dueAmount,
      p.status,
      p.paymentStatus,
    ]);
    exportToCsv("purchases-summary-report", headers, exportRows);
  };

  const columns: ReportColumn<PurchaseRow>[] = [
    {
      key: "purchaseOrderNumber",
      header: "PO Number",
      render: (r) => (
        <span className="font-semibold text-emerald-700 font-mono">
          {r.purchaseOrderNumber}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (r) => (
        <span className="text-xs text-slate-500">
          {formatDateTime(r.createdAt)}
        </span>
      ),
    },
    {
      key: "supplierName",
      header: "Supplier",
      render: (r) => (
        <span className="font-medium text-slate-900">{r.supplierName}</span>
      ),
    },
    {
      key: "status",
      header: "Order Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "paymentStatus",
      header: "Payment",
      render: (r) => <StatusBadge status={r.paymentStatus} />,
    },
    {
      key: "totalAmount",
      header: "Total Cost",
      render: (r) => (
        <span className="font-semibold text-slate-900">
          {formatCurrency(r.totalAmount)}
        </span>
      ),
    },
    {
      key: "paidAmount",
      header: "Paid",
      render: (r) => (
        <span className="text-emerald-700 font-medium">
          {formatCurrency(r.paidAmount)}
        </span>
      ),
    },
    {
      key: "dueAmount",
      header: "Due",
      render: (r) =>
        r.dueAmount > 0 ? (
          <span className="font-semibold text-rose-600">
            {formatCurrency(r.dueAmount)}
          </span>
        ) : (
          <span className="text-slate-400">৳0.00</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <ReportHeader
        category="Purchase Reports"
        title="Purchases by Date & Supplier"
        description="Summary of supplier purchase orders, fulfillment state, and disbursements."
        onExport={handleExport}
        onRefresh={refetch}
        loading={loading}
      />

      <ReportDateFilter filters={filters} onFiltersChange={setFilters} />

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportMetricCard
          title="Total Purchase Spend"
          value={totals?.grandTotalAmount}
          icon={ShoppingCart}
          accent="bg-sky-50 text-sky-700"
        />
        <ReportMetricCard
          title="Disbursed (Paid)"
          value={totals?.grandPaidAmount}
          icon={DollarSign}
          accent="bg-emerald-50 text-emerald-700"
        />
        <ReportMetricCard
          title="Payable (Due)"
          value={totals?.grandDueAmount}
          icon={Truck}
          accent="bg-rose-50 text-rose-700"
          valueClassName="text-rose-700"
        />
        <ReportMetricCard
          title="Purchase Orders"
          value={totals?.totalPurchases}
          isCurrency={false}
          isCount
          icon={FileCheck}
          accent="bg-violet-50 text-violet-700"
        />
      </div>

      <ReportTable
        columns={columns}
        data={purchases}
        loading={loading}
        error={error}
        keyExtractor={(r) => r.id}
        page={filters.page || 1}
        limit={filters.limit || 50}
        total={total}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />
    </div>
  );
}

