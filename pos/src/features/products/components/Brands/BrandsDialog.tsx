import { zodResolver } from "@hookform/resolvers/zod";
import { brandSchema, BrandSchemaType } from "../../brand.schema";
import { Controller, FieldPath, useForm, UseFormReturn } from "react-hook-form";
import { useState } from "react";
import useProductStore from "../../useProductStore";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Save } from "lucide-react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { Spinner } from "@/components/ui/spinner";

import { brandsStatus } from "../../constants/status";
import { createEntityPromiseToast } from "@/lib/toast-utils";
import { SelectOptions } from "@/components/common/SelectOptions";

export function BrandsDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<BrandSchemaType>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      brandName: "",
      status: "active",
    },
  });
  const {  createBrand } = useProductStore();
  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
    }
  }
  async function onSubmit(data: BrandSchemaType) {
    await createEntityPromiseToast({
      data,
      apiCall: createBrand,
      entityName: "Brand",
      displayName: data.brandName,
    });
    form.reset();
  }
  const isSubmitting = form.formState.isSubmitting;
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form id="add-category-form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTrigger
          render={
            <Button variant="outline">
              <Plus />
              Add Brand
            </Button>
          }
        />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Brand</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name="brandName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Brand Name</FieldLabel>
                  <Input
                    id={field.name}
                    {...field}
                    placeholder="Type Brand Name"
                  />
                  {fieldState.error && (
                    <FieldError> {fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />
            <SelectOptions
              name="status"
              label="Status"
              form={form}
              options={brandsStatus}
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
                  Create Brand
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}