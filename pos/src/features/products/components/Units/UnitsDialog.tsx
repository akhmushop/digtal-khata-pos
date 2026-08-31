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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Spinner } from "@/components/ui/spinner";

import { createEntityPromiseToast } from "@/lib/toast-utils";
import { unitSchema, UnitSchemaType } from "../../schemas/unit.schema";
import { InputField } from "@/components/common/InputField";

export function UnitsDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<UnitSchemaType>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      unitName: "",
      abbreviation: "",
    },
  });
  const { createUnit } = useProductStore();
  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
    }
  }
  async function onSubmit(data: UnitSchemaType) {
    await createEntityPromiseToast({
      data,
      apiCall: createUnit,
      entityName: "Unit",
      displayName: data.unitName,
    });
    form.reset();
  }
  const isSubmitting = form.formState.isSubmitting;
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form id="unit-form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTrigger
          render={
            <Button variant="outline">
              <Plus />
              Add Unit
            </Button>
          }
        />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Unit</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <InputField
              name="unitName"
              form={form}
              fieldLabel="Unit Name"
              placeholder="Type Unit Name"
            />{" "}
            <InputField
              name="abbreviation"
              form={form}
              fieldLabel="Abbreviation"
              placeholder="Type Abbreviation"
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />

            <Button disabled={isSubmitting} form="unit-form" type="submit">
              {isSubmitting ? (
                <>
                  <Spinner /> Creating
                </>
              ) : (
                <>
                  <Save />
                  Create Unit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
