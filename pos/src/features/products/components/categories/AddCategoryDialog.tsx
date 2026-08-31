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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Plus, Save } from "lucide-react";
import { Controller, FieldPath, useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addCategorySchema,
  AddCategorySchemaType,
} from "../../addCategory.schema";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useProductStore from "../../useProductStore";
import { createCategoryPromiseToast } from "../../utils/categoryPromiseToast";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { addCategoryStatus } from "../../constants/status";

export function AddCategoryDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<AddCategorySchemaType>({
    resolver: zodResolver(addCategorySchema),
    defaultValues: {
      categoryName: "",
      parentCategoryId: null,
      description: "",
      status: "active",
    },
  });
  const { productSelectOptions, createCategory } = useProductStore();
  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
    }
  }
  async function onSubmit(data: AddCategorySchemaType) {
    await createCategoryPromiseToast(data, createCategory);
    form.reset();
  }
  const isSubmitting = form.formState.isSubmitting;
  console.log(form.formState.errors);
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form id="add-category-form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTrigger
          render={
            <Button variant="outline">
              <Plus />
              Add Category
            </Button>
          }
        />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name="categoryName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Category Name</FieldLabel>
                  <Input
                    id={field.name}
                    {...field}
                    placeholder="Type Category Name"
                  />
                  {fieldState.error && (
                    <FieldError> {fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <AddCategorySelect
              name="parentCategoryId"
              label="Parent Category"
              form={form}
              options={productSelectOptions.categories}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Textarea
                    id={field.name}
                    placeholder="Type your message here."
                    {...field}
                  />
                </Field>
              )}
            />
            <AddCategorySelect
              name="status"
              label="Status"
              form={form}
              options={addCategoryStatus}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />

            <Button
              disabled={isSubmitting}
              form="add-category-form"
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <Spinner /> Creating
                </>
              ) : (
                <>
                  <Save />
                  Create Category
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}

function AddCategorySelect({
  name,
  form,
  label,
  options,
}: {
  name: FieldPath<AddCategorySchemaType>;
  form: UseFormReturn<AddCategorySchemaType>;
  label: string;
  options: { label: string; value: string | number }[];
}) {
  const items =
    name === "parentCategoryId"
      ? [{ label: "None", value: null }, ...options]
      : options;
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => {
        const selected = items.find(
          (o) => String(o.value) === String(field.value),
        );
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <Select
              name={field.name}
              value={field.value === null ? "" : String(field.value)}
              onValueChange={field.onChange}
              items={items}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue>{selected?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        );
      }}
    />
  );
}
