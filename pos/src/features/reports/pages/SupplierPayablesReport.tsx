import React from "react";
import { Truck, AlertCircle, Phone, Mail } from "lucide-react";
import { reportsApi } from "../api/reports.api";
import { useReportData } from "../hooks/useReportData";
import type { SupplierPayableRow } from "../types/report.types";
import {
  exportToCsv,
  formatCurrency,
  formatNumber,
} from "../utils/reportUtils";
import { ReportHeader } from "../components/ReportHeader";
import { ReportMetricCard } from "../components/ReportMetricCard";
import { ReportTable, type ReportColumn } from "../components/ReportTable";

export function SupplierPayablesReport() {
  const { data, loading, error, refetch } = useReportData(
    () => reportsApi.getSupplierPayables(),
    []
  );

  const suppliers = data?.suppliers || [];
  const totals = data?.totals;

  const handleExport = () => {
    const headers = [
      "Supplier Name",
      "Phone",
      "Email",
      "Purchase Orders",
      "Total Purchased (BDT)",
      "Total Paid (BDT)",
      "Outstanding Payable (BDT)",
    ];
    const exportRows = suppliers.map((s) => [
      s.name,
      s.phone,
      s.email,
      s.purchaseCount,
      s.totalPurchased,
      s.totalPaid,
      s.outstandingDue,
    ]);
    exportToCsv("supplier-payables-report", headers, exportRows);
  };

  const columns: ReportColumn<SupplierPayableRow>[] = [
    {
      key: "name",
      header: "Supplier Name",
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-900">{r.name}</p>
          {r.email && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Mail className="size-3" />
              {r.email}
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
      key: "purchaseCount",
      header: "Pending POs",
      render: (r) => formatNumber(r.purchaseCount),
    },
    {
      key: "totalPurchased",
      header: "Total Purchased",
      render: (r) => formatCurrency(r.totalPurchased),
    },
    {
      key: "totalPaid",
      header: "Paid Amount",
      render: (r) => (
        <span className="text-emerald-700 font-medium">
          {formatCurrency(r.totalPaid)}
        </span>
      ),
    },
    {
      key: "outstandingDue",
      header: "Outstanding Payable",
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
        category="Purchase Reports"
        title="Supplier Payables & Ledger"
        description="Outstanding dues to suppliers, vendor balances, and procurement liabilities."
        onExport={handleExport}
        onRefresh={refetch}
        loading={loading}
      />

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportMetricCard
          title="Total Supplier Payables"
          value={totals?.totalPayable}
          icon={AlertCircle}
          accent="bg-rose-50 text-rose-700"
          valueClassName="text-rose-700"
        />
        <ReportMetricCard
          title="Suppliers with Pending Due"
          value={totals?.supplierCount}
          isCurrency={false}
          isCount
          icon={Truck}
          accent="bg-amber-50 text-amber-700"
        />
      </div>

      <ReportTable
        columns={columns}
        data={suppliers}
        loading={loading}
        error={error}
        keyExtractor={(r) => r.id}
      />
    </div>
  );
}

