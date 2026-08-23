import { Controller } from "react-hook-form";
import { Field, FieldLabel } from "@/components/ui/field.js";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ExpiryDatePickerProps } from "../../addProduct.types";
export function ExpiryDatePicker({ form, index }: ExpiryDatePickerProps) {
  return (
    <Controller
      name={`variants.${index}.expiryDate`}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>Expiry Date</FieldLabel>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  id={field.name}
                  className="justify-start font-normal"
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value !== null ? field.value : undefined}
                onSelect={field.onChange}
                defaultMonth={field.value ?? new Date()}
              />
            </PopoverContent>
          </Popover>
        </Field>
      )}
    />
  );
}
