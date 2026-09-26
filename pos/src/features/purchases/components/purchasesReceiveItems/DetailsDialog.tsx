import { useState } from "react";
import { PurchasesItems } from "../../purchase.types";
import { Controller, useForm } from "react-hook-form";
import { batchSchema, BatchSchemaTypeInput, BatchSchemaTypeOutput } from "../../schemas/batch.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputField } from "@/components/common/InputField";
import { Input } from "@/components/ui/input";
import { BatchDatePicker } from "./BatchDatePicker";
import { BatchListTable } from "./BatchListTable";

export function DetailsDialog({ item }: { item: PurchasesItems }) {
  const [open, setOpen] = useState(false);
  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
    }
  }
  const form = useForm<BatchSchemaTypeInput, unknown, BatchSchemaTypeOutput>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      batchNumber: "",
      quantity: 0,
      manufacturedDate: null,
      expiryDate: null,
    },
  });
  const [batchList, setBatchList] = useState<BatchSchemaTypeOutput[]>([]);
  async function onSubmit(data: BatchSchemaTypeOutput) {
    console.log(data);
    setBatchList((prev) => [...prev, data]);
    // await createEntityPromiseToast({
    //   data,
    //   apiCall: createBrand,
    //   entityName: "Brand",
    //   displayName: data.brandName,
    // });
    form.reset();
  }
  console.log(batchList);
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form id="add-batch-number" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTrigger
          render={
            <Button onClick={() => {}} className="hover:cursor-pointer">
              {item.trackingType}
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batch Information</DialogTitle>
            <DialogTitle>Product Name: {item.productName}</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <div className="flex gap-3">
              {/* batchNumber */}
              <InputField
                name="batchNumber"
                form={form}
                fieldLabel="Batch Number"
                placeholder="Type Batch Number"
              />
              {/* Quantity */}
              <Controller
                name="quantity"
                control={form.control}
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
                form={form}
                label="Manufactured Date"
              />
              <BatchDatePicker
                name="expiryDate"
                form={form}
                label="Expiry Date"
              />
            </div>
          </FieldGroup>
          {/* batch list */}
          <div>
            <h1 className="text-lg font-semibold mb-2">Batch List</h1>
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
              <BatchListTable batchList={batchList} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button form="add-batch-number" type="submit">
              Add Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
