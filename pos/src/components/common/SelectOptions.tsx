import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { Field, FieldLabel } from "@/components/ui/field";
export function SelectOptions<T extends FieldValues>({
  name,
  form,
  label,
  options,
}: {
  name: FieldPath<T>;
  form: UseFormReturn<T>;
  label: string;
  options: { label: string; value: string | number }[];
}) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => {
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <Select
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
              items={options}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {options.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        );
      }}
    />
  );
}
