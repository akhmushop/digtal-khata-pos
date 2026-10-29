import React from "react";
import { Download, RefreshCw, Printer } from "lucide-react";

interface ReportHeaderProps {
  title: string;
  description: string;
  category?: string;
  onExport?: () => void;
  onRefresh?: () => void;
  onPrint?: () => void;
  loading?: boolean;
  actions?: React.ReactNode;
}

export function ReportHeader({
  title,
  description,
  category = "Reports",
  onExport,
  onRefresh,
  onPrint,
  loading = false,
  actions,
}: ReportHeaderProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:mb-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          {category}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 print:hidden">
        {actions}

        {onPrint !== undefined || true ? (
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
            title="Print report"
          >
            <Printer className="size-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        ) : null}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            title="Refresh data"
          >
            <RefreshCw
              className={`size-4 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}

        {onExport && (
          <button
            type="button"
            onClick={onExport}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-3.5 text-sm font-medium text-white shadow-xs transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="size-4" />
            Export CSV
          </button>
        )}
      </div>
    </header>
  );
}

