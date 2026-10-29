import React, { useState } from "react";
import { Clock, TrendingUp, ShoppingBag, Flame } from "lucide-react";
import { reportsApi } from "../api/reports.api";
import { useReportData } from "../hooks/useReportData";
import type { ReportFilters, HourlySalesRow } from "../types/report.types";
import {
  exportToCsv,
  formatCurrency,
  formatNumber,
} from "../utils/reportUtils";
import { ReportHeader } from "../components/ReportHeader";
import { ReportDateFilter } from "../components/ReportDateFilter";
import { ReportMetricCard } from "../components/ReportMetricCard";
import { ReportBarChart } from "../components/ReportChart";
import { ReportTable, type ReportColumn } from "../components/ReportTable";

export function HourlySalesReport() {
  const [filters, setFilters] = useState<ReportFilters>({
    period: "today",
  });

  const { data, loading, error, refetch } = useReportData(
    () => reportsApi.getHourlySales(filters),
    [filters]
  );

  const hours = data?.hours || [];
  const summary = data?.summary;

  // Find peak hour
  const peakHour = [...hours].sort(
    (a, b) => Number(b.grossSales) - Number(a.grossSales)
  )[0];

  const chartData = hours.map((h) => ({
    name: h.hourLabel.split(" - ")[0],
    grossSales: Number(h.grossSales),
    orders: Number(h.transactionCount),
  }));

  const handleExport = () => {
    const headers = [
      "Hour Window",
      "Orders / Invoices",
      "Gross Sales (BDT)",
      "Units Sold",
      "Average Order Value (BDT)",
    ];
    const exportRows = hours.map((h) => [
      h.hourLabel,
      h.transactionCount,
      h.grossSales,
      h.itemsSold,
      h.averageOrderValue,
    ]);
    exportToCsv("hourly-sales-report", headers, exportRows);
  };

  const columns: ReportColumn<HourlySalesRow>[] = [
    {
      key: "hourLabel",
      header: "Time Window",
      render: (r) => {
        const isPeak =
          peakHour &&
          r.hourNum === peakHour.hourNum &&
          Number(r.grossSales) > 0;
        return (
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-slate-400" />
            <span className="font-semibold text-slate-900">{r.hourLabel}</span>
            {isPeak && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                <Flame className="size-3 text-amber-600" />
                Peak Hour
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "transactionCount",
      header: "Transactions",
      render: (r) => formatNumber(r.transactionCount),
    },
    {
      key: "itemsSold",
      header: "Units Sold",
      render: (r) => formatNumber(r.itemsSold),
    },
    {
      key: "grossSales",
      header: "Gross Sales",
      render: (r) => (
        <span className="font-semibold text-slate-900">
          {formatCurrency(r.grossSales)}
        </span>
      ),
    },
    {
      key: "averageOrderValue",
      header: "Avg Order Value (AOV)",
      render: (r) => formatCurrency(r.averageOrderValue),
    },
  ];

  return (
    <div className="space-y-6">
      <ReportHeader
        category="Sales Reports"
        title="Hourly Sales & Peak Hours"
        description="Transaction velocity throughout the day to optimize store hours and staffing schedules."
        onExport={handleExport}
        onRefresh={refetch}
        loading={loading}
      />

      <ReportDateFilter filters={filters} onFiltersChange={setFilters} />

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportMetricCard
          title="Total Period Sales"
          value={summary?.totalSales}
          icon={ShoppingBag}
          accent="bg-sky-50 text-sky-700"
        />
        <ReportMetricCard
          title="Total Transactions"
          value={summary?.totalTransactions}
          isCurrency={false}
          isCount
          icon={TrendingUp}
          accent="bg-emerald-50 text-emerald-700"
        />
        <ReportMetricCard
          title="Average Order Value"
          value={summary?.overallAOV}
          icon={TrendingUp}
          accent="bg-violet-50 text-violet-700"
        />
        <ReportMetricCard
          title="Peak Sales Window"
          value={
            peakHour && Number(peakHour.grossSales) > 0
              ? peakHour.hourLabel
              : "No sales yet"
          }
          isCurrency={false}
          subtitle={
            peakHour && Number(peakHour.grossSales) > 0
              ? `${formatCurrency(peakHour.grossSales)} (${peakHour.transactionCount} orders)`
              : undefined
          }
          icon={Flame}
          accent="bg-amber-50 text-amber-700"
          valueClassName="text-lg text-amber-700"
        />
      </div>

      {/* Hourly Sales Bar Chart */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <h3 className="text-base font-semibold text-slate-900 mb-4">
          Sales Volume by Hour
        </h3>
        <ReportBarChart
          data={chartData}
          xKey="name"
          bars={[
            { key: "grossSales", name: "Gross Sales (BDT)", color: "#0284c7" },
          ]}
        />
      </div>

      {/* Hourly Table */}
      <ReportTable
        columns={columns}
        data={hours}
        loading={loading}
        error={error}
        keyExtractor={(r) => r.hourNum}
      />
    </div>
  );
}

