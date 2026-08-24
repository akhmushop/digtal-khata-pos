import { Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field.js";
import { TbCurrencyTaka } from "react-icons/tb";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input.js";
import { InputFieldProps } from "../../product.types";
export function InputField({
  placeholder,
  label,
  type,
  name,
  form,
  disabled,
}: InputFieldProps) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
          {type === "number" && (
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>
                  <TbCurrencyTaka />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                disabled={disabled}
                id={field.name}
                {...field}
                value={
                  typeof field.value === "string" ||
                  typeof field.value === "number"
                    ? field.value
                    : ""
                }
                aria-invalid={fieldState.invalid}
                placeholder={placeholder}
                type={type}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>BDT</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          )}
          {type === "text" && (
            <Input
              id={field.name}
              {...field}
              value={typeof field.value === "string" ? field.value : ""}
              aria-invalid={fieldState.invalid}
              placeholder={placeholder}
              type={type}
            />
          )}
          {type === "textArea" && (
            <InputGroup>
              <InputGroupTextarea
                id={field.name}
                {...field}
                value={typeof field.value === "string" ? field.value : ""}
                aria-invalid={fieldState.invalid}
                placeholder={placeholder}
              />
              <InputGroupAddon align="block-end">
                <InputGroupText className="text-xs text-muted-foreground">
                  {120 -
                    (typeof field.value === "string"
                      ? field.value.length
                      : 0)}{" "}
                  characters left
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          )}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
