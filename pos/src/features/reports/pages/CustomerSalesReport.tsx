import React, { useState } from "react";
import { reportsApi } from "../api/reports.api";
import { useReportData } from "../hooks/useReportData";
import type { ReportFilters, CustomerSalesRow } from "../types/report.types";
import {
  exportToCsv,
  formatCurrency,
  formatNumber,
} from "../utils/reportUtils";
import { ReportHeader } from "../components/ReportHeader";
import { ReportDateFilter } from "../components/ReportDateFilter";
import { ReportTable, type ReportColumn } from "../components/ReportTable";

export function CustomerSalesReport() {
  const [filters, setFilters] = useState<ReportFilters>({
    period: "this_month",
    page: 1,
    limit: 50,
  });

  const { data, loading, error, refetch } = useReportData(
    () => reportsApi.getCustomerSales(filters),
    [filters]
  );

  const customers = data?.data || [];
  const total = data?.total || 0;

  const handleExport = () => {
    const headers = [
      "Customer Name",
      "Phone",
      "Invoices",
      "Total Sales (BDT)",
      "Total Discounts (BDT)",
      "Outstanding Due (BDT)",
    ];
    const exportRows = customers.map((c) => [
      c.customerName,
      c.phone,
      c.invoiceCount,
      c.totalSales,
      c.totalDiscount,
      c.outstandingDue,
    ]);
    exportToCsv("customer-sales-report", headers, exportRows);
  };

  const columns: ReportColumn<CustomerSalesRow>[] = [
    {
      key: "customerName",
      header: "Customer",
      render: (r) => (
        <span className="font-semibold text-slate-900">{r.customerName}</span>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (r) => <span className="text-slate-500">{r.phone}</span>,
    },
    {
      key: "invoiceCount",
      header: "Orders / Invoices",
      render: (r) => formatNumber(r.invoiceCount),
    },
    {
      key: "totalSales",
      header: "Total Sales",
      render: (r) => (
        <span className="font-semibold text-slate-900">
          {formatCurrency(r.totalSales)}
        </span>
      ),
    },
    {
      key: "totalDiscount",
      header: "Discounts",
      render: (r) => (
        <span className="text-amber-600">{formatCurrency(r.totalDiscount)}</span>
      ),
    },
    {
      key: "outstandingDue",
      header: "Outstanding Due",
      render: (r) =>
        r.outstandingDue > 0 ? (
          <span className="font-semibold text-rose-600">
            {formatCurrency(r.outstandingDue)}
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
        title="Customer Sales"
        description="Purchasing patterns, order frequency, total spending, and outstanding dues per customer."
        onExport={handleExport}
        onRefresh={refetch}
        loading={loading}
      />

      <ReportDateFilter
        filters={filters}
        onFiltersChange={setFilters}
        showSearch
        searchPlaceholder="Search customer name or phone..."
      />

      <ReportTable
        columns={columns}
        data={customers}
        loading={loading}
        error={error}
        keyExtractor={(r) => `${r.customerId}-${r.phone}`}
        page={filters.page || 1}
        limit={filters.limit || 50}
        total={total}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />
    </div>
  );
}

