import React, { useState } from "react";
import { reportsApi } from "../api/reports.api";
import { useReportData } from "../hooks/useReportData";
import type { ReportFilters, RefundRow } from "../types/report.types";
import {
  exportToCsv,
  formatCurrency,
  formatDateTime,
} from "../utils/reportUtils";
import { ReportHeader } from "../components/ReportHeader";
import { ReportDateFilter } from "../components/ReportDateFilter";
import { ReportTable, type ReportColumn } from "../components/ReportTable";
import { StatusBadge } from "../components/StatusBadge";

export function SaleRefundsReport() {
  const [filters, setFilters] = useState<ReportFilters>({
    period: "this_month",
    page: 1,
    limit: 50,
  });

  const { data, loading, error, refetch } = useReportData(
    () => reportsApi.getSaleRefunds(filters),
    [filters]
  );

  const refunds = data?.data || [];
  const total = data?.total || 0;

  const handleExport = () => {
    const headers = [
      "Refund ID",
      "Date",
      "Original Invoice",
      "Customer",
      "Reason",
      "Status",
      "Refund Total (BDT)",
    ];
    const exportRows = refunds.map((r) => [
      r.id,
      r.createdAt,
      r.invoiceNumber,
      r.customerName,
      r.reason,
      r.status,
      r.refundTotal,
    ]);
    exportToCsv("sales-refunds-report", headers, exportRows);
  };

  const columns: ReportColumn<RefundRow>[] = [
    {
      key: "id",
      header: "Refund #",
      render: (r) => (
        <span className="font-semibold text-rose-600 font-mono">
          REF-{r.id}
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
      key: "invoiceNumber",
      header: "Original Invoice",
      render: (r) => (
        <span className="font-medium text-slate-900">{r.invoiceNumber}</span>
      ),
    },
    {
      key: "customerName",
      header: "Customer",
      render: (r) => (
        <span className="text-slate-700">{r.customerName}</span>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      render: (r) => (
        <span className="text-xs text-slate-600 max-w-xs truncate block">
          {r.reason || "Customer return"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "refundTotal",
      header: "Refund Amount",
      render: (r) => (
        <span className="font-semibold text-rose-600">
          {formatCurrency(r.refundTotal)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ReportHeader
        category="Sales Reports"
        title="Discounts & Sales Returns"
        description="Audit log of customer returns, product refunds, reasons, and refunded sums."
        onExport={handleExport}
        onRefresh={refetch}
        loading={loading}
      />

      <ReportDateFilter filters={filters} onFiltersChange={setFilters} />

      <ReportTable
        columns={columns}
        data={refunds}
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

