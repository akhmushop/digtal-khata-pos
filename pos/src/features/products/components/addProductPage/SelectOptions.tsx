import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field.js";
import { Controller } from "react-hook-form";
import { SelectOptionsProps } from "../../addProduct.types";
export const SelectOptions = ({
  options,
  label,
  form,
  name,
}: SelectOptionsProps) => {
  const items =
    name === "productType" ||
    name === "status" ||
    name === "trackingType" ||
    name === "unitId"
      ? options
      : [{ label: `Select ${label}`, value: null }, ...options];
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

          <Select
            items={items}
            name={field.name}
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              id={field.name}
              aria-invalid={fieldState.invalid}
              className="w-full"
            >
              <SelectValue
                placeholder={
                  name === "trackingType" || name === "unitId"
                    ? `Select ${label}`
                    : ""
                }
              />
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
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
