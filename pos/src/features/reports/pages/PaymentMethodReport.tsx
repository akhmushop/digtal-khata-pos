import React, { useState } from "react";
import { CreditCard, Banknote, QrCode, Wallet } from "lucide-react";
import { reportsApi } from "../api/reports.api";
import { useReportData } from "../hooks/useReportData";
import type { ReportFilters, PaymentMethodRow } from "../types/report.types";
import {
  exportToCsv,
  formatCurrency,
  formatNumber,
} from "../utils/reportUtils";
import { ReportHeader } from "../components/ReportHeader";
import { ReportDateFilter } from "../components/ReportDateFilter";
import { ReportMetricCard } from "../components/ReportMetricCard";
import { ReportPieChart } from "../components/ReportChart";
import { ReportTable, type ReportColumn } from "../components/ReportTable";

export function PaymentMethodReport() {
  const [filters, setFilters] = useState<ReportFilters>({
    period: "this_month",
  });

  const { data, loading, error, refetch } = useReportData(
    () => reportsApi.getPaymentMethods(filters),
    [filters]
  );

  const methods = data || [];
  const grandTotal = methods.reduce((acc, m) => acc + Number(m.totalAmount), 0);
  const totalTransactions = methods.reduce(
    (acc, m) => acc + Number(m.paymentCount),
    0
  );

  const getMethodLabel = (m: string) => {
    if (m === "bangla_qr") return "Bangla QR / Mobile";
    if (m === "card") return "Debit / Credit Card";
    if (m === "cash") return "Cash";
    return m.charAt(0).toUpperCase() + m.slice(1);
  };

  const getMethodIcon = (m: string) => {
    if (m === "cash") return Banknote;
    if (m === "bangla_qr") return QrCode;
    if (m === "card") return CreditCard;
    return Wallet;
  };

  const chartData = methods.map((m) => ({
    name: getMethodLabel(m.paymentMethod),
    value: Number(m.totalAmount),
  }));

  const handleExport = () => {
    const headers = [
      "Payment Method",
      "Transactions",
      "Total Collected (BDT)",
      "Percentage",
    ];
    const exportRows = methods.map((m) => [
      getMethodLabel(m.paymentMethod),
      m.paymentCount,
      m.totalAmount,
      grandTotal > 0
        ? `${((Number(m.totalAmount) / grandTotal) * 100).toFixed(1)}%`
        : "0%",
    ]);
    exportToCsv("payment-method-report", headers, exportRows);
  };

  const columns: ReportColumn<PaymentMethodRow>[] = [
    {
      key: "paymentMethod",
      header: "Payment Method",
      render: (r) => {
        const Icon = getMethodIcon(r.paymentMethod);
        return (
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <Icon className="size-4" />
            </span>
            <span className="font-semibold text-slate-900">
              {getMethodLabel(r.paymentMethod)}
            </span>
          </div>
        );
      },
    },
    {
      key: "paymentCount",
      header: "Transactions",
      render: (r) => formatNumber(r.paymentCount),
    },
    {
      key: "totalAmount",
      header: "Total Collected",
      render: (r) => (
        <span className="font-semibold text-slate-950">
          {formatCurrency(r.totalAmount)}
        </span>
      ),
    },
    {
      key: "share",
      header: "Share of Collections",
      render: (r) => {
        const pct =
          grandTotal > 0 ? (Number(r.totalAmount) / grandTotal) * 100 : 0;
        return (
          <div className="flex items-center gap-3">
            <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-600">
              {pct.toFixed(1)}%
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <ReportHeader
        category="Sales Reports"
        title="Payment Method Breakdown"
        description="Cash collection breakdown by payment channel: Cash, Cards, and Bangla QR."
        onExport={handleExport}
        onRefresh={refetch}
        loading={loading}
      />

      <ReportDateFilter filters={filters} onFiltersChange={setFilters} />

      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportMetricCard
          title="Total Cash Collected"
          value={grandTotal}
          icon={Wallet}
          accent="bg-emerald-50 text-emerald-700"
        />
        <ReportMetricCard
          title="Payment Transactions"
          value={totalTransactions}
          isCurrency={false}
          isCount
          icon={CreditCard}
          accent="bg-sky-50 text-sky-700"
        />
      </div>

      {/* Chart & Table */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-1">
          <h3 className="text-base font-semibold text-slate-900 mb-2">
            Collection Share
          </h3>
          <ReportPieChart data={chartData} />
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-2">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Payment Channels
          </h3>
          <ReportTable
            columns={columns}
            data={methods}
            loading={loading}
            error={error}
            keyExtractor={(r) => r.paymentMethod}
          />
        </div>
      </div>
    </div>
  );
}

