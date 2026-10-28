import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Download,
  ReceiptText,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactListLayout } from "@/features/Contacts/components/ContactListLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ExpenseDialog } from "./components/ExpenseDialog";
import { ExpenseCategoryDialog } from "./components/ExpenseCategoryDialog";
import { ExpensesTable } from "./components/ExpensesTable";
import type { ExpenseRecord } from "./expense.type";
import { useExpenseStore } from "./useExpenseStore";

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function getCsvValue(value: string | number) {
  let text = String(value);
  if (/^[\t\r ]*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replaceAll('"', '""')}"`;
}

function exportExpenses(expenses: ExpenseRecord[]) {
  const rows = [
    ["Date", "Title", "Category", "Payment method", "Reference", "Note", "Amount"],
    ...expenses.map((expense) => [
      expense.expenseDate,
      expense.title,
      expense.categoryName ?? "Uncategorized",
      expense.paymentMethod ?? "",
      expense.referenceNo ?? "",
      expense.note ?? "",
      Number(expense.amount).toFixed(2),
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(getCsvValue).join(",")).join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function Expense() {
  const expenses = useExpenseStore((state) => state.expenses);
  const categories = useExpenseStore((state) => state.categories);
  const loading = useExpenseStore((state) => state.loading);
  const error = useExpenseStore((state) => state.error);
  const categoriesError = useExpenseStore((state) => state.categoriesError);
  const loadExpenses = useExpenseStore((state) => state.loadExpenses);
  const loadCategories = useExpenseStore((state) => state.loadCategories);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    void loadExpenses().catch(() => undefined);
    void loadCategories().catch(() => undefined);
  }, [loadCategories, loadExpenses]);

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return expenses.filter((expense) => {
      const matchesSearch =
        !query ||
        [
          expense.title,
          expense.categoryName,
          expense.paymentMethod,
          expense.referenceNo,
          expense.note,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      const matchesCategory =
        categoryFilter === "all" ||
        (categoryFilter === "uncategorized"
          ? expense.categoryId === null
          : expense.categoryId === Number(categoryFilter));
      const matchesDate =
        (!dateFrom || expense.expenseDate >= dateFrom) &&
        (!dateTo || expense.expenseDate <= dateTo);
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [categoryFilter, dateFrom, dateTo, expenses, search]);

  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}`;
  const thisMonthExpenses = expenses.filter((expense) =>
    expense.expenseDate.startsWith(currentMonth),
  );
  const thisMonthTotal = thisMonthExpenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0,
  );
  const averageExpense = expenses.length
    ? expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0) /
      expenses.length
    : 0;
  const invalidDateRange = Boolean(dateFrom && dateTo && dateFrom > dateTo);
  const hasFilters = Boolean(
    search || categoryFilter !== "all" || dateFrom || dateTo,
  );

  return (
    <ContactListLayout
      title="Expenses"
      description="Track business spending, review payment details, and keep your records organized."
      action={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={!filteredExpenses.length || loading}
            onClick={() => exportExpenses(filteredExpenses)}
          >
            <Download />
            Export CSV
          </Button>
          <ExpenseCategoryDialog />
          <ExpenseDialog categories={categories} />
        </div>
      }
      metrics={[
        {
          label: "Spent this month",
          value: error ? "—" : loading ? "…" : currencyFormatter.format(thisMonthTotal),
          description: "Total expenses dated this month",
        },
        {
          label: "Expenses this month",
          value: error ? "—" : loading ? "…" : String(thisMonthExpenses.length),
          description: "Expense records dated this month",
        },
        {
          label: "Average expense",
          value: error ? "—" : loading ? "…" : currencyFormatter.format(averageExpense),
          description: "Average amount across all records",
        },
      ]}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search title, category, payment, or reference"
      resultCount={error ? "—" : loading ? "…" : filteredExpenses.length}
      filter={
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Select
            value={categoryFilter}
            onValueChange={(value) => value && setCategoryFilter(value)}
          >
            <SelectTrigger
              aria-label="Filter expenses by category"
              className="w-full sm:w-44"
            >
              <SelectValue>
                {categoryFilter === "all"
                  ? "All categories"
                  : categoryFilter === "uncategorized"
                    ? "Uncategorized"
                    : categories.find(
                        (category) => String(category.id) === categoryFilter,
                      )?.categoryName ?? "All categories"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="uncategorized">Uncategorized</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.categoryName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="relative">
            <span className="sr-only">Expenses from date</span>
            <CalendarDays
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label="Expenses from date"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="pl-9 sm:w-40"
            />
          </label>
          <label className="relative">
            <span className="sr-only">Expenses to date</span>
            <CalendarDays
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label="Expenses to date"
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="pl-9 sm:w-40"
            />
          </label>
          {hasFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
                setDateFrom("");
                setDateTo("");
              }}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-3">
        {invalidDateRange ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            The start date must be on or before the end date.
          </p>
        ) : null}
        {error ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-destructive">
              Could not load expenses. {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadExpenses().catch(() => undefined)}
            >
              <RefreshCw />
              Try again
            </Button>
          </div>
        ) : null}
        {categoriesError ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Could not load expense categories. {categoriesError}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadCategories().catch(() => undefined)}
            >
              <RefreshCw />
              Try again
            </Button>
          </div>
        ) : null}
        {!loading && !expenses.length && !error ? (
          <Card className="border-dashed shadow-none">
            <CardContent className="items-center py-10 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ReceiptText />
              </div>
              <h2 className="font-medium">No expenses recorded yet</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Add your first expense to start tracking where your business
                money goes.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ExpensesTable
            expenses={invalidDateRange ? [] : filteredExpenses}
            categories={categories}
            loading={loading}
          />
        )}
      </div>
    </ContactListLayout>
  );
}
