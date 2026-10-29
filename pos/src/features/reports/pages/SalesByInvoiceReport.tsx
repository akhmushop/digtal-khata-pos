import React, { useState } from "react";
import { Link } from "react-router";
import { reportsApi } from "../api/reports.api";
import { useReportData } from "../hooks/useReportData";
import type { ReportFilters, SalesInvoiceRow } from "../types/report.types";
import {
  exportToCsv,
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "../utils/reportUtils";
import { ReportHeader } from "../components/ReportHeader";
import { ReportDateFilter } from "../components/ReportDateFilter";
import { ReportTable, type ReportColumn } from "../components/ReportTable";
import { StatusBadge } from "../components/StatusBadge";

export function SalesByInvoiceReport() {
  const [filters, setFilters] = useState<ReportFilters>({
    period: "this_month",
    page: 1,
    limit: 50,
  });

  const { data, loading, error, refetch } = useReportData(
    () => reportsApi.getSalesByInvoice(filters),
    [filters]
  );

  const invoices = data?.data || [];
  const total = data?.total || 0;

  const handleExport = () => {
    const headers = [
      "Invoice Number",
      "Date",
      "Customer",
      "Phone",
      "Subtotal",
      "Discount",
      "VAT",
      "Final Total",
      "Payment Status",
      "Due Amount",
      "Items",
      "Refund Amount",
    ];
    const exportRows = invoices.map((inv) => [
      inv.invoiceNumber,
      inv.createdAt,
      inv.customerName,
      inv.customerPhone,
      inv.subtotal,
      inv.discount,
      inv.vat,
      inv.finalTotal,
      inv.paymentStatus,
      inv.dueAmount,
      inv.itemCount,
      inv.refundAmount,
    ]);
    exportToCsv("sales-by-invoice", headers, exportRows);
  };

  const columns: ReportColumn<SalesInvoiceRow>[] = [
    {
      key: "invoiceNumber",
      header: "Invoice #",
      render: (r) => (
        <span className="font-semibold text-emerald-700">
          {r.invoiceNumber}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Date & Time",
      render: (r) => (
        <span className="text-xs text-slate-500">
          {formatDateTime(r.createdAt)}
        </span>
      ),
    },
    {
      key: "customerName",
      header: "Customer",
      render: (r) => (
        <div>
          <p className="font-medium text-slate-900">{r.customerName}</p>
          {r.customerPhone && r.customerPhone !== "-" && (
            <p className="text-xs text-slate-400">{r.customerPhone}</p>
          )}
        </div>
      ),
    },
    {
      key: "itemCount",
      header: "Items",
      render: (r) => formatNumber(r.itemCount),
    },
    {
      key: "subtotal",
      header: "Subtotal",
      render: (r) => formatCurrency(r.subtotal),
    },
    {
      key: "discount",
      header: "Discount",
      render: (r) =>
        r.discount > 0 ? (
          <span className="text-amber-600">-{formatCurrency(r.discount)}</span>
        ) : (
          "—"
        ),
    },
    {
      key: "finalTotal",
      header: "Total",
      render: (r) => (
        <span className="font-semibold text-slate-900">
          {formatCurrency(r.finalTotal)}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      header: "Payment",
      render: (r) => <StatusBadge status={r.paymentStatus} />,
    },
    {
      key: "dueAmount",
      header: "Due",
      render: (r) =>
        r.dueAmount > 0 ? (
          <span className="font-medium text-rose-600">
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
        category="Sales Reports"
        title="Sales by Invoice"
        description="Comprehensive list of sales transactions with payment statuses, line discounts, and dues."
        onExport={handleExport}
        onRefresh={refetch}
        loading={loading}
      />

      <ReportDateFilter
        filters={filters}
        onFiltersChange={setFilters}
        showSearch
        searchPlaceholder="Search invoice # or customer..."
        showPaymentStatus
      />

      <ReportTable
        columns={columns}
        data={invoices}
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

