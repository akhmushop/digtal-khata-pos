import { zodResolver } from "@hookform/resolvers/zod";
import {
  useEffect,
  useState,
  type ReactElement,
} from "react";
import { useForm } from "react-hook-form";
import { Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { createEntityPromiseToast } from "@/lib/toast-utils";
import { expenseSchema, type ExpenseFormInput, type ExpenseFormOutput } from "../expense.schema";
import type { ExpenseCategory, ExpenseRecord } from "../expense.type";
import { useExpenseStore } from "../useExpenseStore";

function localDateValue() {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

interface ExpenseDialogProps {
  categories: ExpenseCategory[];
  expense?: ExpenseRecord;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactElement;
}

function getDefaultValues(expense?: ExpenseRecord): ExpenseFormInput {
  return {
    title: expense?.title ?? "",
    expenseDate: expense?.expenseDate ?? localDateValue(),
    amount: expense?.amount ?? 0,
    categoryId:
      expense?.categoryId === null || expense?.categoryId === undefined
        ? "none"
        : String(expense.categoryId),
    paymentMethod: expense?.paymentMethod ?? "Cash",
    referenceNo: expense?.referenceNo ?? "",
    note: expense?.note ?? "",
  };
}

export function ExpenseDialog({
  categories,
  expense,
  open: controlledOpen,
  onOpenChange,
  trigger,
}: ExpenseDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const createExpense = useExpenseStore((state) => state.createExpense);
  const updateExpense = useExpenseStore((state) => state.updateExpense);
  const saving = useExpenseStore((state) => state.saving);
  const form = useForm<ExpenseFormInput, unknown, ExpenseFormOutput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: getDefaultValues(expense),
  });

  useEffect(() => {
    if (open) form.reset(getDefaultValues(expense));
  }, [expense, form, open]);

  function handleOpenChange(nextOpen: boolean) {
    if (controlledOpen === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
    if (!nextOpen) {
      form.reset(getDefaultValues());
    }
  }

  async function onSubmit(data: ExpenseFormOutput) {
    try {
      await createEntityPromiseToast({
        data,
        apiCall: (values) =>
          expense
            ? updateExpense(expense.id, values)
            : createExpense(values),
        entityName: expense ? "Expense update" : "Expense",
        displayName: data.title,
      });
      handleOpenChange(false);
      form.reset();
    } catch {
      // The promise toast displays the API error and keeps the form available for correction.
    }
  }

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger
          render={
            <Button>
              <Plus />
              Add expense
            </Button>
          }
        />
      )}
      <DialogContent className="sm:max-w-xl">
        <form
          id="expense-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <DialogHeader>
            <DialogTitle>{expense ? "Edit expense" : "Record an expense"}</DialogTitle>
            <DialogDescription>
              {expense
                ? "Update this expense record and save your changes."
                : "Add the expense details to keep your business records up to date."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4">
            <Field data-invalid={Boolean(errors.title)}>
              <FieldLabel htmlFor="expense-title">Expense title</FieldLabel>
              <Input
                id="expense-title"
                placeholder="e.g. Office supplies"
                aria-invalid={Boolean(errors.title)}
                {...form.register("title")}
              />
              <FieldError>{errors.title?.message}</FieldError>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.amount)}>
                <FieldLabel htmlFor="expense-amount">Amount (৳)</FieldLabel>
                <Input
                  id="expense-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  aria-invalid={Boolean(errors.amount)}
                  {...form.register("amount", { valueAsNumber: true })}
                />
                <FieldError>{errors.amount?.message}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.expenseDate)}>
                <FieldLabel htmlFor="expense-date">Expense date</FieldLabel>
                <Input
                  id="expense-date"
                  type="date"
                  aria-invalid={Boolean(errors.expenseDate)}
                  {...form.register("expenseDate")}
                />
                <FieldError>{errors.expenseDate?.message}</FieldError>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.categoryId)}>
                <FieldLabel htmlFor="expense-category">Category</FieldLabel>
                <select
                  id="expense-category"
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-invalid={Boolean(errors.categoryId)}
                  {...form.register("categoryId")}
                >
                  <option value="none">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
                <FieldError>{errors.categoryId?.message}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.paymentMethod)}>
                <FieldLabel htmlFor="expense-payment">Payment method</FieldLabel>
                <select
                  id="expense-payment"
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-invalid={Boolean(errors.paymentMethod)}
                  {...form.register("paymentMethod")}
                >
                  <option value="Cash">Cash</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Card">Card</option>
                </select>
                <FieldError>{errors.paymentMethod?.message}</FieldError>
              </Field>
            </div>
            <Field data-invalid={Boolean(errors.referenceNo)}>
              <FieldLabel htmlFor="expense-reference">Reference number</FieldLabel>
              <Input
                id="expense-reference"
                placeholder="Optional receipt or transaction ID"
                aria-invalid={Boolean(errors.referenceNo)}
                {...form.register("referenceNo")}
              />
              <FieldError>{errors.referenceNo?.message}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.note)}>
              <FieldLabel htmlFor="expense-note">Note</FieldLabel>
              <Textarea
                id="expense-note"
                placeholder="Add any useful context"
                rows={3}
                aria-invalid={Boolean(errors.note)}
                {...form.register("note")}
              />
              <FieldError>{errors.note?.message}</FieldError>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={saving}>
                  Cancel
                </Button>
              }
            />
            <Button disabled={saving} type="submit">
              {saving ? (
                <>
                  <Spinner />
                  Saving
                </>
              ) : (
                <>
                  <Save />
                  {expense ? "Update expense" : "Save expense"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
