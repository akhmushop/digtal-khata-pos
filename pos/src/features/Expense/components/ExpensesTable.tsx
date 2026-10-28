import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Pencil, Trash2 } from "lucide-react";
import { ExpenseDialog } from "./ExpenseDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExpenseCategory, ExpenseRecord } from "../expense.type";
import { useExpenseStore } from "../useExpenseStore";

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-BD", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

interface ExpensesTableProps {
  expenses: ExpenseRecord[];
  categories: ExpenseCategory[];
  loading: boolean;
}

export function ExpensesTable({
  expenses,
  categories,
  loading,
}: ExpensesTableProps) {
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);

  async function handleDelete(expense: ExpenseRecord) {
    if (
      !window.confirm(
        `Delete "${expense.title}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await toast.promise(deleteExpense(expense.id), {
        loading: "Deleting expense…",
        success: "Expense deleted successfully",
        error: (error) =>
          error?.response?.data?.message ??
          error?.message ??
          "Could not delete expense",
      });
    } catch {
      // The promise toast displays the API error.
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Date</TableHead>
            <TableHead>Expense</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-28 text-center text-muted-foreground"
              >
                Loading expenses…
              </TableCell>
            </TableRow>
          ) : expenses.length ? (
            expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {dateFormatter.format(new Date(`${expense.expenseDate}T00:00:00Z`))}
                </TableCell>
                <TableCell className="min-w-48 whitespace-normal">
                  <div className="font-medium">{expense.title}</div>
                  {expense.note ? (
                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {expense.note}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell>{expense.categoryName ?? "Uncategorized"}</TableCell>
                <TableCell>
                  {expense.paymentMethod ? (
                    <Badge variant="secondary">{expense.paymentMethod}</Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="max-w-40 truncate text-muted-foreground">
                  {expense.referenceNo || "—"}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {currencyFormatter.format(Number(expense.amount) || 0)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <ExpenseDialog
                      categories={categories}
                      expense={expense}
                      trigger={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${expense.title}`}
                        >
                          <Pencil />
                        </Button>
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${expense.title}`}
                      onClick={() => void handleDelete(expense)}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-28 text-center text-muted-foreground"
              >
                No expenses match your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
