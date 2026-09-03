import { zodResolver } from "@hookform/resolvers/zod";
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
import { FieldGroup } from "@/components/ui/field";

import { Spinner } from "@/components/ui/spinner";

import { createEntityPromiseToast } from "@/lib/toast-utils";
import { InputField } from "@/components/common/InputField";
import {
  variantTypeSchema,
  VariantTypeSchemaType,
} from "../../schemas/variant.schema";

export function VariantTypeDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<VariantTypeSchemaType>({
    resolver: zodResolver(variantTypeSchema),
    defaultValues: {
      variantTypeName: "",
    },
  });
  const { createVariantType } = useProductStore();
  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
    }
  }
  async function onSubmit(data: VariantTypeSchemaType) {
    await createEntityPromiseToast({
      data,
      apiCall: createVariantType,
      entityName: "Variant Type",
      displayName: data.variantTypeName,
    });
    form.reset();
    setOpen(false)
  }
  const isSubmitting = form.formState.isSubmitting;
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form id="type-form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTrigger
          render={
            <Button variant="outline">
              <Plus />
              Add Type
            </Button>
          }
        />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Type</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <InputField
              name="variantTypeName"
              form={form}
              fieldLabel="Variant Type Name"
              placeholder="Type VariantType Name"
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />

            <Button disabled={isSubmitting} form="type-form" type="submit">
              {isSubmitting ? (
                <>
                  <Spinner /> Creating
                </>
              ) : (
                <>
                  <Save />
                  Create Type
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
