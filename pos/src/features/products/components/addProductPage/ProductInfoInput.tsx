import { Controller, useFieldArray } from "react-hook-form";
import { ProductInfoInputProps } from "../../addProduct.types";
import { Field, FieldLabel, FieldError } from "@/components/ui/field.js";
import { Trash2 } from "lucide-react";
import { InputField } from "./InputField";
import { ExpiryDatePicker } from "./ExpiryDatePicker";
import { InputFile } from "./InputFile";
import { variantStatus } from "../../constants/form-status";
import { SelectOptions } from "./SelectOptions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export function ProductInfoInput({
  form,
  variantIndex,
  remove,
}: ProductInfoInputProps) {
  const {
    fields,
    append,
    remove: serialRemove,
  } = useFieldArray({
    control: form.control,
    name: `variants.${variantIndex}.serialNumbers`,
  });
  const hasVariants = form.watch("hasVariants");
  const serialNumbers = form.watch(`variants.${variantIndex}.serialNumbers`);
  const source = form.watch("source");
  const trackingType = form.watch("trackingType");
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {source === "opening" && (
        <div className="space-y-2">
          <InputField
            placeholder="0.00"
            label="Purchase Price"
            type="number"
            name={`variants.${variantIndex}.purchasePrice`}
            form={form}
          />
        </div>
      )}
      {/* Price */}
      {!hasVariants && (
        <div className="space-y-2">
          <InputField
            placeholder="0.00"
            label="Selling Price"
            type="number"
            name={`variants.${variantIndex}.sellingPrice`}
            form={form}
          />
        </div>
      )}
      {/*WholeSale Price */}
      {/* <div className="space-y-2">
      <InputField
        placeholder="0.00"
        label="WholeSale Price"
        type="number"
        name={`variants.${index}.wholeSalePrice`}
        form={form}
      />
    </div> */}
      {/* Quantity */}
      {source === "opening" && (
        <div className="space-y-2">
          {
            <InputField
              disabled={trackingType !== "serial" ? false : true}
              placeholder="0.00"
              label="Quantity"
              type="number"
              name={`variants.${variantIndex}.quantity`}
              form={form}
            />
          }
        </div>
      )}
      {/* Alert Quantity */}
      <div className="space-y-2">
        <InputField
          placeholder="0.00"
          label="Alert Quantity"
          type="number"
          name={`variants.${variantIndex}.alertQuantity`}
          form={form}
        />
      </div>
      {/* Barcode */}
      <div className="space-y-2">
        <InputField
          placeholder="Enter Barcode"
          label="Barcode"
          type="text"
          name={`variants.${variantIndex}.barcode`}
          form={form}
        />
      </div>
      {/* Batch Number */}
      {source === "opening" && trackingType === "batch" && (
        <div className="space-y-2">
          <InputField
            placeholder="Enter Batch Number"
            label="Batch Number"
            type="text"
            name={`variants.${variantIndex}.batchNumber`}
            form={form}
          />
        </div>
      )}
      {!hasVariants && (
        <div className="space-y-2">
          <InputField
            placeholder="auto-generated if blank"
            label="Sku"
            type="text"
            name={`variants.${variantIndex}.sku`}
            form={form}
          />
        </div>
      )}
      {/* Expiry Date */}
      {source === "opening" && trackingType === "batch" && (
        <div className="space-y-2">
          <ExpiryDatePicker form={form} index={variantIndex} />
        </div>
      )}
      {hasVariants && (
        <div className="space-y-2">
          <InputFile
            urlName={`variants.${variantIndex}.imageUrl`}
            fileName={`variants.${variantIndex}.imageFile`}
            form={form}
            label="Image"
          />
        </div>
      )}
      {/* status */}
      <div className="space-y-2">
        <SelectOptions
          options={variantStatus}
          label="Status"
          form={form}
          name={`variants.${variantIndex}.status`}
        />
      </div>
      {/* switch */}
      {/* {trackingType === "serial" && (
        <div className="col-span-3">
          <div className="flex justify-end mb-5">
            <div className="flex items-center space-x-2">
              <Switch
                checked={hasSerials}
                onCheckedChange={(checked) => {
                  setHasSerials(checked); // Update the state
                  if (!checked) {
                    replace([]);
                  }
                }}
                id="track-serials"
              />
              <Label htmlFor="track-serials">Track Serials</Label>
            </div>
          </div>
        </div>
      )} */}
      {trackingType === "serial" && source === "opening" && (
        <div className="space-y-2 col-span-3">
          <p className="text-center">
            The quantity will automatically equal the number of serial numbers
          </p>
          {fields.map((field, serialIndex) => (
            <Controller
              key={serialIndex}
              control={form.control}
              name={`variants.${variantIndex}.serialNumbers.${serialIndex}.serial`}
              render={({ field, fieldState }) => (
                <>
                  <Field>
                    <FieldLabel>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldLabel>
                    <div className="flex gap-5 items-center">
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        type="text"
                        placeholder="e.g.IMEI12345678"
                      />
                      <Trash2
                        onClick={() => {
                          serialRemove(serialIndex);
                        }}
                      />
                    </div>
                  </Field>
                </>
              )}
            />
          ))}
          {serialNumbers?.length === 0 && (
            <div className="h-15 w-full border border-gray border-dashed rounded flex items-center justify-center">
              <p>No serial numbers tracked. Click “Add serial” to start.</p>
            </div>
          )}
          <Button
            onClick={() => {
              append({ serial: "" });
            }}
          >
            Add Serial
          </Button>
        </div>
      )}
      {hasVariants && (
        <div className="space-y-2 col-span-3 flex justify-end gap-5">
          <Button
            onClick={() => {
              remove?.(variantIndex);
            }}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}
