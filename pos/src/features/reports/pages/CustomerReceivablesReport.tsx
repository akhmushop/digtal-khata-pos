import React, { useState } from "react";
import { Users, AlertCircle, Phone, MapPin } from "lucide-react";
import { reportsApi } from "../api/reports.api";
import { useReportData } from "../hooks/useReportData";
import type { ReportFilters, CustomerReceivableRow } from "../types/report.types";
import {
  exportToCsv,
  formatCurrency,
  formatNumber,
} from "../utils/reportUtils";
import { ReportHeader } from "../components/ReportHeader";
import { ReportDateFilter } from "../components/ReportDateFilter";
import { ReportMetricCard } from "../components/ReportMetricCard";
import { ReportTable, type ReportColumn } from "../components/ReportTable";

export function CustomerReceivablesReport() {
  const [filters, setFilters] = useState<ReportFilters>({
    period: "this_month",
  });

  const { data, loading, error, refetch } = useReportData(
    () => reportsApi.getCustomerReceivables(filters),
    [filters]
  );

  const customers = data?.customers || [];
  const totals = data?.totals;

  const handleExport = () => {
    const headers = [
      "Customer Name",
      "Phone",
      "Address",
      "Unpaid Invoices",
      "Total Invoiced (BDT)",
      "Outstanding Receivable (BDT)",
    ];
    const exportRows = customers.map((c) => [
      c.name,
      c.phone,
      c.address,
      c.invoiceCount,
      c.totalInvoiced,
      c.outstandingDue,
    ]);
    exportToCsv("customer-receivables-report", headers, exportRows);
  };

  const columns: ReportColumn<CustomerReceivableRow>[] = [
    {
      key: "name",
      header: "Customer Name",
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-900">{r.name}</p>
          {r.address && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="size-3" />
              {r.address}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (r) => (
        <span className="text-xs text-slate-600 font-mono flex items-center gap-1">
          <Phone className="size-3 text-slate-400" />
          {r.phone || "—"}
        </span>
      ),
    },
    {
      key: "invoiceCount",
      header: "Unpaid / Partial Invoices",
      render: (r) => formatNumber(r.invoiceCount),
    },
    {
      key: "totalInvoiced",
      header: "Total Invoiced",
      render: (r) => formatCurrency(r.totalInvoiced),
    },
    {
      key: "outstandingDue",
      header: "Outstanding Receivable",
      render: (r) => (
        <span className="font-bold text-rose-600">
          {formatCurrency(r.outstandingDue)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ReportHeader
        category="Financial Reports"
        title="Customer Receivables (Bakir Khata)"
        description="Active credit balances, customer due amounts, and payment reconciliation."
        onExport={handleExport}
        onRefresh={refetch}
        loading={loading}
      />

      <ReportDateFilter
        filters={filters}
        onFiltersChange={setFilters}
        showSearch
        searchPlaceholder="Search customer by name or phone..."
      />

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportMetricCard
          title="Total Receivables Due"
          value={totals?.totalReceivable}
          icon={AlertCircle}
          accent="bg-rose-50 text-rose-700"
          valueClassName="text-rose-700"
        />
        <ReportMetricCard
          title="Customers with Due"
          value={totals?.customerCount}
          isCurrency={false}
          isCount
          icon={Users}
          accent="bg-amber-50 text-amber-700"
        />
      </div>

      {/* Customer List */}
      <ReportTable
        columns={columns}
        data={customers}
        loading={loading}
        error={error}
        keyExtractor={(r) => r.id}
      />
    </div>
  );
}

