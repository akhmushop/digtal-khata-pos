import { Controller, ControllerRenderProps } from "react-hook-form";
import { useState } from "react";
import { Field, FieldLabel, FieldError } from "@/components/ui/field.js";
import { Switch } from "@/components/ui/switch";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputFileProps } from "../../product.types";
import { ProductTypeInput } from "../../product.schema";
export function InputFile({ urlName, fileName, form, label }: InputFileProps) {
  const handleAddHttp = (field: ControllerRenderProps<ProductTypeInput>) => {
    const value = typeof field.value === "string" ? field.value.trim() : "";
    if (!value) {
      field.onChange(null);
    } else if (!/^https?:\/\//i.test(value)) {
      field.onChange(`https://${value}`);
    }
    field.onBlur();
  };
  const [addUrl, setAddUrl] = useState(false);
  const handleOnCheckedChange = (checked: boolean) => {
    setAddUrl(checked);

    // Clear the inactive field
    if (checked) {
      form.setValue(fileName, null);
      form.clearErrors(fileName);
    } else {
      form.setValue(urlName, null);
      form.clearErrors(urlName);
    }
  };
  return (
    <Field>
      <div className="flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>

        <div className="flex items-center space-x-2">
          <Switch
            id="add-image-url"
            checked={addUrl}
            onCheckedChange={handleOnCheckedChange}
          />

          <Label htmlFor="add-image-url" className="cursor-pointer">
            Add URL
          </Label>
        </div>
      </div>

      {addUrl ? (
        <Controller
          name={urlName}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <InputGroup>
                {!field.value && (
                  <InputGroupAddon>
                    <InputGroupText>https://</InputGroupText>
                  </InputGroupAddon>
                )}

                <InputGroupInput
                  id={field.name}
                  name={field.name}
                  value={typeof field.value === "string" ? field.value : ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={() => {
                    handleAddHttp(field);
                  }}
                  ref={field.ref}
                  placeholder="example.com"
                  className="pl-0.5!"
                  aria-invalid={fieldState.invalid}
                />
              </InputGroup>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      ) : (
        <Controller
          name={fileName}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                id={field.name}
                name={field.name}
                type="file"
                ref={field.ref}
                onBlur={field.onBlur}
                onChange={(e) => {
                  field.onChange(e.target.files?.[0] ?? null);
                }}
                aria-invalid={fieldState.invalid}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}
    </Field>
  );
}
