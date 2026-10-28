import { useState, type FormEvent } from "react";
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
import { createEntityPromiseToast } from "@/lib/toast-utils";
import { useExpenseStore } from "../useExpenseStore";

export function ExpenseCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const createCategory = useExpenseStore((state) => state.createCategory);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setCategoryName("");
      setError(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = categoryName.trim();
    if (!name) {
      setError("Enter a category name");
      return;
    }
    if (name.length > 100) {
      setError("Category names can be up to 100 characters");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createEntityPromiseToast({
        data: name,
        apiCall: createCategory,
        entityName: "Expense category",
        displayName: name,
      });
      handleOpenChange(false);
    } catch {
      // The promise toast displays the API error and leaves the dialog open.
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <Plus />
            Add category
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Add expense category</DialogTitle>
            <DialogDescription>
              Create a category to organize future expense records.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4">
            <Field data-invalid={Boolean(error)}>
              <FieldLabel htmlFor="expense-category-name">
                Category name
              </FieldLabel>
              <Input
                id="expense-category-name"
                autoFocus
                maxLength={100}
                placeholder="e.g. Utilities"
                value={categoryName}
                aria-invalid={Boolean(error)}
                onChange={(event) => {
                  setCategoryName(event.target.value);
                  if (error) setError(null);
                }}
              />
              <FieldError>{error}</FieldError>
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
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Spinner />
                  Saving
                </>
              ) : (
                <>
                  <Save />
                  Save category
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
