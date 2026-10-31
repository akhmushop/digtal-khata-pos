import React, { useState } from "react";
import { Calendar, RotateCcw, Search } from "lucide-react";
import { format } from "date-fns";
import type {
  ReportFilters,
  ReportPeriod,
  DateRange,
} from "../types/report.types";
import { periodOptions, getPeriodDateRange } from "../utils/reportUtils";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { useSessionStore } from "@/auth/sessionStore";

interface ReportDateFilterProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
  showPaymentStatus?: boolean;
  showLocationFilter?: boolean;
  extraFilters?: React.ReactNode;
  className?: string;
}

export function ReportDateFilter({
  filters,
  onFiltersChange,
  showSearch = false,
  searchPlaceholder = "Search...",
  showPaymentStatus = false,
  showLocationFilter = true,
  extraFilters,
  className = "",
}: ReportDateFilterProps) {
  const locations = useSessionStore((state) => state.locations);
  const [customStart, setCustomStart] = useState(
    filters.dateRange?.startDate || format(new Date(), "yyyy-MM-01")
  );
  const [customEnd, setCustomEnd] = useState(
    filters.dateRange?.endDate || format(new Date(), "yyyy-MM-dd")
  );

  const handleLocationChange = (value: string) => {
    const next: ReportFilters = { ...filters, page: 1 };
    if (value === "all") {
      delete next.locationId;
    } else {
      next.locationId = Number(value);
    }
    onFiltersChange(next);
  };

  const handlePeriodChange = (period: ReportPeriod) => {
    if (period === "custom") {
      const dateRange: DateRange = {
        startDate: customStart,
        endDate: customEnd,
      };
      onFiltersChange({ ...filters, period, dateRange, page: 1 });
      return;
    }
    const dateRange = getPeriodDateRange(period);
    onFiltersChange({ ...filters, period, dateRange, page: 1 });
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onFiltersChange({
        ...filters,
        period: "custom",
        dateRange: { startDate: customStart, endDate: customEnd },
        page: 1,
      });
    }
  };

  const handleReset = () => {
    const defaultRange = getPeriodDateRange("this_month");
    onFiltersChange({
      period: "this_month",
      dateRange: defaultRange,
      page: 1,
      limit: 50,
      search: "",
      paymentStatus: undefined,
      categoryId: undefined,
      brandId: undefined,
    });
    setCustomStart(defaultRange.startDate);
    setCustomEnd(defaultRange.endDate);
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white p-3 shadow-xs ${className}`}
    >
      {/* Location Scope (all accessible locations + consolidated) */}
      {showLocationFilter && locations.length > 1 ? (
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1">
          <MapPin className="size-4 text-slate-400" />
          <select
            value={filters.locationId ?? "all"}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="h-7 cursor-pointer bg-transparent text-sm font-medium text-slate-700 outline-none"
          >
            <option value="all">All Locations</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Period Selection */}
      <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1">
        <Calendar className="size-4 text-slate-400" />
        <select
          value={filters.period}
          onChange={(e) => handlePeriodChange(e.target.value as ReportPeriod)}
          className="h-7 cursor-pointer bg-transparent text-sm font-medium text-slate-700 outline-none"
        >
          {periodOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Date Range Inputs */}
      {filters.period === "custom" && (
        <div className="flex items-center gap-1.5 bg-slate-50/60 p-1 rounded-lg border border-slate-200">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="h-7 rounded border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="h-7 rounded border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none"
          />
          <button
            type="button"
            onClick={handleCustomApply}
            className="h-7 rounded bg-slate-900 px-2.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            Apply
          </button>
        </div>
      )}

      {/* Payment Status Dropdown */}
      {showPaymentStatus && (
        <select
          value={filters.paymentStatus ?? ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              paymentStatus:
                (e.target.value as ReportFilters["paymentStatus"]) || undefined,
              page: 1,
            })
          }
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-2xs outline-none"
        >
          <option value="">All payment statuses</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
      )}

      {/* Search Bar */}
      {showSearch && (
        <div className="relative min-w-44 flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={filters.search ?? ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value, page: 1 })
            }
            placeholder={searchPlaceholder}
            className="h-9 w-full pl-8 text-sm"
          />
        </div>
      )}

      {/* Additional slot filters */}
      {extraFilters}

      {/* Reset */}
      <button
        type="button"
        onClick={handleReset}
        className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
        title="Reset filters"
      >
        <RotateCcw className="size-3.5" />
        Reset
      </button>
    </div>
  );
}

