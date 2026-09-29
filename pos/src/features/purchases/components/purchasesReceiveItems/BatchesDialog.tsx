import { useState } from "react";
import { PurchasesItems } from "../../purchase.types";
import { Controller, useForm, UseFormReturn } from "react-hook-form";
import {
  batchSchema,
  BatchSchemaTypeInput,
  BatchSchemaTypeOutput,
} from "../../schemas/batch.schema";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputField } from "@/components/common/InputField";
import { Input } from "@/components/ui/input";
import { BatchDatePicker } from "./BatchDatePicker";
import { BatchListTable } from "./BatchListTable";
import { ReceiveItemsFormValues } from "../../schemas/receiveItem.schema";

export function BatchesDialog({
  item,
  form,
  index,
}: {
  item: PurchasesItems;
  form: UseFormReturn<ReceiveItemsFormValues>;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  const batchForm = useForm<
    BatchSchemaTypeInput,
    unknown,
    BatchSchemaTypeOutput
  >({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      batchNumber: "",
      quantity: 0,
      manufacturedDate: null,
      expiryDate: null,
    },
  });
  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      batchForm.reset();
    }
  }
  const currentBatches = form.watch(`items.${index}.batches`) || [];
  async function onSubmit(data: BatchSchemaTypeOutput) {
    const existingBatches = form.getValues(`items.${index}.batches`) || [];
    // Append the new batch to the list
    form.setValue(`items.${index}.batches`, [...existingBatches, data], {
      shouldValidate: true,
      shouldDirty: true,
    });

    // Reset the mini-form so the user can type another batch
    batchForm.reset();
  }
  const handleRemoveBatch = (batchIndex: number) => {
    // 1. Get the current batches for this specific item
    const currentBatches = form.getValues(`items.${index}.batches`) || [];

    // 2. Filter out the batch at the specific index
    const updatedBatches = currentBatches.filter((_, i) => i !== batchIndex);

    // 3. Update the form state with the new list
    form.setValue(`items.${index}.batches`, updatedBatches, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className="hover:cursor-pointer">
            {item.trackingType}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Batch Information</DialogTitle>
          <DialogDescription>Product Name: {item.productName}</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <div className="flex gap-3">
            {/* batchNumber */}
            <InputField
              name="batchNumber"
              form={batchForm}
              fieldLabel="Batch Number"
              placeholder="Type Batch Number"
            />
            {/* Quantity */}
            <Controller
              name="quantity"
              control={batchForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Quantity</FieldLabel>
                  <Input
                    min={1}
                    id={field.name}
                    {...field}
                    placeholder="0"
                    type="number"
                  />
                  {fieldState.error && (
                    <FieldError> {fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />
          </div>
          <div className="flex gap-3">
            <BatchDatePicker
              name="manufacturedDate"
              batchForm={batchForm}
              label="Manufactured Date"
            />
            <BatchDatePicker
              name="expiryDate"
              batchForm={batchForm}
              label="Expiry Date"
            />
          </div>
          <Button
            type="button"
            onClick={() => batchForm.handleSubmit(onSubmit)()}
          >
            Add Batch
          </Button>
        </FieldGroup>
        {/* batch list */}
        <div>
          <h1 className="text-lg font-semibold mb-2">Batch List</h1>
          <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
            <BatchListTable
              batchList={currentBatches}
              handleRemoveBatch={handleRemoveBatch}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Done</Button>} />
          
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
