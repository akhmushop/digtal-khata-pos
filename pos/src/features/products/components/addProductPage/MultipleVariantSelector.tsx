import { UseFieldArrayReplace } from "react-hook-form";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field.js";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import React from "react";
import { ProductTypeInput } from "../../product.schema";
import useProductStore from "../../useProductStore";

export function MultipleVariantSelector({
  setComboboxVariantTypeName,
  replace,
}: {
  setComboboxVariantTypeName: React.Dispatch<React.SetStateAction<string[]>>;
  replace: UseFieldArrayReplace<ProductTypeInput, "variants">;
}) {
  const anchor = useComboboxAnchor();
  const { productVariantOptions } = useProductStore();
  return (
    <Field>
      <FieldLabel>Variant Types</FieldLabel>

      <Combobox
        multiple
        autoHighlight
        items={productVariantOptions.map((item) => item.typeName)}
        onValueChange={(value) => {
          replace([]);
          setComboboxVariantTypeName(value as string[]);
        }}
      >
        <ComboboxChips ref={anchor} className="w-full">
          <ComboboxValue>
            {(values) => (
              <React.Fragment>
                {values.map((value: string) => (
                  <ComboboxChip key={value}>{value}</ComboboxChip>
                ))}
                <ComboboxChipsInput placeholder="Select a Variant Types" />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No Variant Type found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>
        Pick the dimensions you want to vary on.{" "}
      </FieldDescription>
    </Field>
  );
}
