import { Input } from "@/components/ui/input";
import { PurchasesItems } from "../../purchase.types";
import { DetailsDialog } from "./DetailsDialog";
import { Controller, UseFormReturn } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { ReceiveItemsFormValues } from "../../schemas/receiveItem.schema";

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
                    <DetailsDialog item={originalItem} />
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
