import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarRange,
  CreditCard,
  HandCoins,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  getCustomerDueRowsApi,
  getDueManagementSummaryApi,
  getSupplierDueRowsApi,
} from "./dueManagement.api";

const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 2,
});

const tabs = ["customers", "suppliers"] as const;
type DueTab = (typeof tabs)[number];

function formatCurrency(value: number) {
  return currency.format(Number(value ?? 0));
}

export function DueManagementPage() {
  const [activeTab, setActiveTab] = useState<DueTab>("customers");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const summaryQuery = useQuery({
    queryKey: ["due-summary"],
    queryFn: getDueManagementSummaryApi,
  });

  const customerDueQuery = useQuery({
    queryKey: ["due-customers"],
    queryFn: getCustomerDueRowsApi,
  });

  const supplierDueQuery = useQuery({
    queryKey: ["due-suppliers"],
    queryFn: getSupplierDueRowsApi,
  });

  const rows = activeTab === "customers" ? customerDueQuery.data ?? [] : supplierDueQuery.data ?? [];
  const titlePrefix = activeTab === "customers" ? "Customer" : "Supplier";

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rows.filter((row) => {
      const subjectName = activeTab === "customers" ? (row as any).customerName : (row as any).supplierName;
      const phone = (row as any).phone ?? "";
      const invoice = activeTab === "customers" ? (row as any).invoiceNumber : (row as any).purchaseInvoice;
      const matchesSearch =
        !normalized ||
        [subjectName, phone, invoice].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalized));
      const matchesStatus = statusFilter === "all" || (row as any).paymentStatus === statusFilter;
      const matchesDateRange =
        dateRange === "all" ||
        ((row as any).isOverdue && dateRange === "overdue") ||
        ((row as any).paymentStatus !== "paid" && dateRange === "open");
      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [activeTab, dateRange, query, rows, statusFilter]);

  const summary = summaryQuery.data ?? {
    customerOutstanding: 0,
    customerOverdue: 0,
    supplierOutstanding: 0,
    supplierOverdue: 0,
    amountCollectedToday: 0,
    amountPaidToSuppliersToday: 0,
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Finance</p>
          <h1 className="text-3xl font-semibold tracking-tight">Due Management</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={activeTab === "customers" ? "default" : "outline"} onClick={() => setActiveTab("customers")}>Customer dues</Button>
          <Button variant={activeTab === "suppliers" ? "default" : "outline"} onClick={() => setActiveTab("suppliers")}>Supplier payables</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total customer dues</CardTitle>
            <CardDescription>Money customers owe the shop</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{formatCurrency(summary.customerOutstanding)}</span>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total supplier payables</CardTitle>
            <CardDescription>Money owed to suppliers</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{formatCurrency(summary.supplierOutstanding)}</span>
            <TrendingDown className="h-5 w-5 text-amber-600" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Overdue customer balances</CardTitle>
            <CardDescription>Past due receivables</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{formatCurrency(summary.customerOverdue)}</span>
            <CalendarRange className="h-5 w-5 text-red-600" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Overdue supplier balances</CardTitle>
            <CardDescription>Past due payables</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{formatCurrency(summary.supplierOverdue)}</span>
            <CalendarRange className="h-5 w-5 text-orange-600" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Amount collected today</CardTitle>
            <CardDescription>Cash and digital collection</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{formatCurrency(summary.amountCollectedToday)}</span>
            <HandCoins className="h-5 w-5 text-emerald-600" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Amount paid to suppliers today</CardTitle>
            <CardDescription>Payments issued today</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{formatCurrency(summary.amountPaidToSuppliersToday)}</span>
            <CreditCard className="h-5 w-5 text-blue-600" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>{titlePrefix} dues</CardTitle>
            <CardDescription>Search, filter, and review outstanding balances.</CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, phone, invoice" className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partially paid</SelectItem>
                <SelectItem value="paid">Settled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Phone</th>
                  <th className="px-3 py-2 text-left">Invoice</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-right">Paid</th>
                  <th className="px-3 py-2 text-right">Outstanding</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">
                      {customerDueQuery.isLoading || supplierDueQuery.isLoading ? "Loading balances…" : "No due records match the selected filters."}
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => {
                    const name = activeTab === "customers" ? (row as any).customerName : (row as any).supplierName;
                    const invoice = activeTab === "customers" ? (row as any).invoiceNumber : (row as any).purchaseInvoice;
                    const date = activeTab === "customers" ? (row as any).invoiceDate : (row as any).purchaseDate;
                    return (
                      <tr key={`${activeTab}-${(row as any).id}`} className="border-t">
                        <td className="px-3 py-2">
                          <div className="font-medium">{name ?? "Walk-in customer"}</div>
                        </td>
                        <td className="px-3 py-2">{(row as any).phone ?? "—"}</td>
                        <td className="px-3 py-2">{invoice ?? "—"}</td>
                        <td className="px-3 py-2">{date ? new Date(date).toLocaleDateString() : "—"}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency((row as any).totalAmount)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency((row as any).paidAmount)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency((row as any).outstandingAmount)}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={(row as any).paymentStatus === "paid" ? "default" : (row as any).paymentStatus === "partial" ? "secondary" : "destructive"}>{(row as any).paymentStatus}</Badge>
                            {(row as any).isOverdue ? <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Overdue</Badge> : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
