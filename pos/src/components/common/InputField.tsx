import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
export interface InputFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  form: UseFormReturn<T>;
  placeholder: string;
  fieldLabel: string;
}
export function InputField<T extends FieldValues>({
  name,
  form,
  fieldLabel,
  placeholder,
}: InputFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{fieldLabel}</FieldLabel>
          <Input id={field.name} {...field} placeholder={placeholder} />
          {fieldState.error && (
            <FieldError> {fieldState.error.message}</FieldError>
          )}
        </Field>
      )}
    />
  );
}
