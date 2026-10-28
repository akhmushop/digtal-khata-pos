import { Controller, FieldPath, UseFormReturn } from "react-hook-form";
import { BatchSchemaTypeInput } from "../../schemas/batch.schema";
import { useState } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

interface BatchDatePickerProps {
  name: FieldPath<BatchSchemaTypeInput>;
  batchForm: UseFormReturn<BatchSchemaTypeInput>;
  label: string;
}
export function BatchDatePicker({ name, batchForm, label }: BatchDatePickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <Controller
      name={name}
      control={batchForm.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="justify-start font-normal"
                >
                  {field.value
                    ? new Date(field.value).toLocaleDateString()
                    : "Select date"}
                </Button>
              }
            />
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                defaultMonth={field.value ? new Date(field.value) : new Date()}
                captionLayout="dropdown"
                onSelect={(date) => {
                  field.onChange(date);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          {fieldState.error && (
            <FieldError>{fieldState.error.message}</FieldError>
          )}
        </Field>
      )}
    />
  );
}
