import { Input } from "@/components/ui/input";
import { PurchasesItems } from "../../purchase.types";
import { Controller, UseFormReturn } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { ReceiveItemsFormValues } from "../../schemas/receiveItem.schema";
import { Minus } from "lucide-react";
import { SerialsDialog } from "./SerialsDialog";
import { BatchesDialog } from "./BatchesDialog";

export function ItemsReceiveTable({
  fields,
  receivePurchasesItems,
  form,
}: {
  fields: ({
    itemId: number;
    receiveNow: number;
    unitCost: number;
    sellingPrice: number;
  } & Record<"id", string> & {
      disabled?: boolean;
    })[];
  receivePurchasesItems: PurchasesItems[];
  form: UseFormReturn<ReceiveItemsFormValues>;
}) {
  return (
    <div>
      <h1>Items To Receive</h1>
      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th>Product</th>
              <th>Type/Variant</th>
              <th>Ordered</th>
              <th>Already Received</th>
              <th>Remaining</th>
              <th>Receive Now</th>
              <th>Unit Cost</th>
              <th>Selling Price</th>
              <th>Total</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}
            {fields.map((field, index) => {
              const originalItem = receivePurchasesItems.find(
                (p) => p.id === field.itemId,
              );
              if (!originalItem) return null;
              const itemsReceived =
                Number(originalItem.receivedQuantity) ===
                Number(originalItem.quantity);
              const remaining =
                originalItem.quantity - originalItem.receivedQuantity;
              const rowTotal =
                (Number(form.getValues(`items.${index}.receiveNow`)) || 0) *
                (Number(form.getValues(`items.${index}.unitCost`)) || 0);
              const serialError =
                form.formState.errors.items?.[index]?.serialNumbers?.message;
              const batchError =
                form.formState.errors.items?.[index]?.batches?.message;
              return (
                <tr key={field.id}>
                  <th>{originalItem.productName}</th>
                  <td>{originalItem.productUnit}</td>
                  <td>{originalItem.quantity}</td>
                  <td>{originalItem.receivedQuantity}</td>
                  <td>{remaining}</td>
                  <td>
                    <Controller
                      name={`items.${index}.receiveNow`}
                      control={form.control}
                      render={({ field: inputField, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Input
                            disabled={itemsReceived}
                            min={0}
                            max={remaining}
                            {...inputField}
                            value={
                              inputField.value === undefined ||
                              inputField.value === null
                                ? ""
                                : inputField.value
                            }
                            // 2. Convert the HTML string back to a number for RHF!
                            onChange={(e) => {
                              const val = e.target.value;
                              // If empty, pass undefined (or 0). If typed, convert to Number.
                              inputField.onChange(
                                val === "" ? undefined : Number(val),
                              );
                            }}
                            type="number"
                          />

                          {fieldState.error && (
                            <FieldError> {fieldState.error.message}</FieldError>
                          )}
                          {serialError &&
                            originalItem.trackingType === "serial" && (
                              <p className="text-sm font-medium text-destructive bg-red-50 border border-red-200 p-2 rounded-md">
                                {serialError as string}
                              </p>
                            )}
                          {batchError &&
                            originalItem.trackingType === "batch" && (
                              <p className="text-sm font-medium text-destructive bg-red-50 border border-red-200 p-2 rounded-md">
                                {batchError as string}
                              </p>
                            )}
                        </Field>
                      )}
                    />
                  </td>
                  <td>
                    <Controller
                      name={`items.${index}.unitCost`}
                      control={form.control}
                      render={({ field: inputField, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Input
                            disabled={itemsReceived}
                            min={0}
                            {...inputField}
                            value={
                              inputField.value === undefined ||
                              inputField.value === null
                                ? ""
                                : inputField.value
                            }
                            // 2. Convert the HTML string back to a number for RHF!
                            onChange={(e) => {
                              const val = e.target.value;
                              // If empty, pass undefined (or 0). If typed, convert to Number.
                              inputField.onChange(
                                val === "" ? undefined : Number(val),
                              );
                            }}
                            type="number"
                          />

                          {fieldState.error && (
                            <FieldError> {fieldState.error.message}</FieldError>
                          )}
                        </Field>
                      )}
                    />
                  </td>
                  <td>
                    <Controller
                      name={`items.${index}.sellingPrice`}
                      control={form.control}
                      render={({ field: inputField, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Input
                            disabled={itemsReceived}
                            min={0}
                            {...inputField}
                            value={
                              inputField.value === undefined ||
                              inputField.value === null
                                ? ""
                                : inputField.value
                            }
                            // 2. Convert the HTML string back to a number for RHF!
                            onChange={(e) => {
                              const val = e.target.value;
                              // If empty, pass undefined (or 0). If typed, convert to Number.
                              inputField.onChange(
                                val === "" ? undefined : Number(val),
                              );
                            }}
                            type="number"
                          />

                          {fieldState.error && (
                            <FieldError> {fieldState.error.message}</FieldError>
                          )}
                        </Field>
                      )}
                    />
                  </td>
                  <td>{rowTotal.toFixed(2)}</td>
                  <td>
                    {originalItem.trackingType === "batch" ? (
                      <BatchesDialog
                        item={originalItem}
                        form={form}
                        index={index}
                      />
                    ) : originalItem.trackingType === "serial" ? (
                      <SerialsDialog
                        item={originalItem}
                        form={form}
                        index={index}
                      />
                    ) : (
                      <Minus />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
