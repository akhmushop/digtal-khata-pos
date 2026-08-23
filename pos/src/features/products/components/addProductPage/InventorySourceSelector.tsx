import { Controller } from "react-hook-form";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
} from "@/components/ui/field.js";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InventorySourceSelectorProps } from "../../addProduct.types";
export function InventorySourceSelector({
  form,
  inventoryOptions,
}: InventorySourceSelectorProps) {
  return (
    <Controller
      name="source"
      control={form.control}
      render={({ field: { onChange, value } }) => (
        <RadioGroup onValueChange={onChange} value={value} className="w-fit">
          {inventoryOptions.map((option, index) => {
            const uniqueId = `source-${option.value}`;
            return (
              <Field key={index} orientation="horizontal">
                <RadioGroupItem value={option.value} id={uniqueId} />
                <FieldContent>
                  <FieldLabel htmlFor={uniqueId}>{option.title}</FieldLabel>
                  <FieldDescription>{option.label}.</FieldDescription>
                </FieldContent>
              </Field>
            );
          })}
        </RadioGroup>
      )}
    />
  );
}
