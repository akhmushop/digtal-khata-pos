import React, { useState } from "react";
import { DollarSign, FileText, ShoppingBag, TrendingUp } from "lucide-react";
import { reportsApi } from "../api/reports.api";
import { useReportData } from "../hooks/useReportData";
import type { ReportFilters, SalesDailyRow } from "../types/report.types";
import {
  exportToCsv,
  formatCurrency,
  formatDate,
  formatNumber,
} from "../utils/reportUtils";
import { ReportHeader } from "../components/ReportHeader";
import { ReportDateFilter } from "../components/ReportDateFilter";
import { ReportMetricCard } from "../components/ReportMetricCard";
import { ReportTrendChart } from "../components/ReportChart";
import { ReportTable, type ReportColumn } from "../components/ReportTable";

export function SalesSummaryReport() {
  const [filters, setFilters] = useState<ReportFilters>({
    period: "this_month",
  });

  const { data, loading, error, refetch } = useReportData(
    () => reportsApi.getSalesSummary(filters),
    [filters]
  );

  const rows = data?.rows || [];
  const totals = data?.totals;

  const handleExport = () => {
    const headers = [
      "Date",
      "Invoices",
      "Gross Sales (BDT)",
      "Discounts (BDT)",
      "Refunds (BDT)",
      "Net Sales (BDT)",
      "Gross Profit (BDT)",
    ];
    const exportRows = rows.map((r) => [
      r.sale_date,
      r.invoice_count,
      r.gross_sales,
      r.total_discount,
      r.total_refunds,
      r.net_sales,
      r.gross_profit,
    ]);
    exportToCsv("sales-summary-report", headers, exportRows);
  };

  const columns: ReportColumn<SalesDailyRow>[] = [
    {
      key: "sale_date",
      header: "Date",
      render: (r) => (
        <span className="font-medium text-slate-900">
          {formatDate(r.sale_date)}
        </span>
      ),
    },
    {
      key: "invoice_count",
      header: "Invoices",
      render: (r) => formatNumber(r.invoice_count),
    },
    {
      key: "gross_sales",
      header: "Gross Sales",
      render: (r) => formatCurrency(r.gross_sales),
    },
    {
      key: "total_discount",
      header: "Discount",
      render: (r) => (
        <span className="text-amber-600">{formatCurrency(r.total_discount)}</span>
      ),
    },
    {
      key: "total_refunds",
      header: "Refunds",
      render: (r) => (
        <span className="text-rose-600">{formatCurrency(r.total_refunds)}</span>
      ),
    },
    {
      key: "net_sales",
      header: "Net Sales",
      render: (r) => (
        <span className="font-semibold text-slate-950">
          {formatCurrency(r.net_sales)}
        </span>
      ),
    },
    {
      key: "gross_profit",
      header: "Gross Profit",
      render: (r) => (
        <span className="font-semibold text-emerald-700">
          {formatCurrency(r.gross_profit)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ReportHeader
        category="Sales Reports"
        title="Sales Summary by Date"
        description="Daily sales volume, discounts, refunds, net revenue, and gross profit."
        onExport={handleExport}
        onRefresh={refetch}
        loading={loading}
      />

      <ReportDateFilter filters={filters} onFiltersChange={setFilters} />

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportMetricCard
          title="Total Gross Sales"
          value={totals?.total_gross_sales}
          icon={ShoppingBag}
          accent="bg-emerald-50 text-emerald-700"
        />
        <ReportMetricCard
          title="Total Net Sales"
          value={totals?.total_net_sales}
          icon={DollarSign}
          accent="bg-sky-50 text-sky-700"
        />
        <ReportMetricCard
          title="Total Gross Profit"
          value={totals?.total_gross_profit}
          icon={TrendingUp}
          accent="bg-violet-50 text-violet-700"
          valueClassName="text-emerald-700"
        />
        <ReportMetricCard
          title="Completed Invoices"
          value={totals?.total_invoices}
          isCurrency={false}
          isCount
          icon={FileText}
          accent="bg-amber-50 text-amber-700"
        />
      </div>

      {/* Chart Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <h3 className="text-base font-semibold text-slate-900 mb-4">
          Daily Sales & Profit Trend
        </h3>
        <ReportTrendChart
          data={rows}
          xKey="sale_date"
          lines={[
            { key: "net_sales", name: "Net Sales", color: "#0284c7" },
            { key: "gross_profit", name: "Gross Profit", color: "#059669" },
            { key: "total_refunds", name: "Refunds", color: "#e11d48" },
          ]}
        />
      </div>

      {/* Detailed Table */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">
          Daily Breakdown
        </h3>
        <ReportTable
          columns={columns}
          data={rows}
          loading={loading}
          error={error}
          keyExtractor={(r) => r.sale_date}
        />
      </div>
    </div>
  );
}

