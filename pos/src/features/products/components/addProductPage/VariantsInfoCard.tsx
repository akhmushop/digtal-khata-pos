import { useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge.js";
import { ShoppingBag } from "lucide-react";
import { Controller } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { generateVariants } from "../../utils/generate-variants";
import { emptyVariant } from "../../constants/form-defaults";
import { MultipleVariantSelector } from "./MultipleVariantSelector";
import { VariantsTable } from "./VariantsTable";
import { ProductInfoInput } from "./ProductInfoInput";
import { AccordionCardProps } from "../../product.types";
import useProductStore from "../../useProductStore";
export function VariantsInfoCard({
  form,
  append,
  replace,
  remove,
  fields,
  isEditing = false,
}: AccordionCardProps) {
  const [comboboxVariantTypeName, setComboboxVariantTypeName] = useState<
    string[]
  >([]);
  const { productVariantOptions } = useProductStore();
  const hasVariants = form.watch("hasVariants");
  const variants = form.watch("variants") || [];
  const filtered = productVariantOptions.filter((option) =>
    comboboxVariantTypeName.includes(option.typeName),
  );
  const allVariants = isEditing
    ? variants.flatMap((variant) =>
        variant.options?.length ? [{ options: variant.options }] : [],
      )
    : generateVariants(filtered);
  const handleHasVariantsChange = (value: boolean) => {
    if (isEditing) {
      return;
    }
    form.setValue("hasVariants", value);

    if (value) {
      // Has variants → start with no variants
      replace([]);
    } else {
      // No variants → one default inventory item
      replace([emptyVariant]);
    }
  };
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="text-green-500" />
          Variants
        </CardTitle>
        <CardDescription>
          Toggle on if this product comes in multiple sizes, colors, or other
          options.
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          <Controller
            name="hasVariants"
            control={form.control}
            render={({ field }) => (
              <Switch
                id="has-variants"
                checked={field.value}
                disabled={isEditing}
                onCheckedChange={handleHasVariantsChange}
              />
            )}
          />
          <Label htmlFor="has-variants">Has Variants</Label>
        </CardAction>
      </CardHeader>
      <CardContent>
        {hasVariants ? (
          <div className="flex flex-col gap-5">
            {!isEditing && (
              <MultipleVariantSelector
                setComboboxVariantTypeName={setComboboxVariantTypeName}
                replace={replace}
              />
            )}
            {allVariants.length !== 0 && (
              <div className="flex justify-between">
                <div className="flex gap-5">
                  <p>
                    {isEditing ? "Existing Variants" : "Generated Variants"}
                    <Badge variant="outline"> {allVariants.length} </Badge>
                  </p>
                  <p>
                    {isEditing ? "Variants" : "Variant Added"}
                    <Badge variant="outline"> {variants.length} </Badge>
                  </p>
                </div>
                <p>
                  {isEditing
                    ? "Edit the default variant and variant pricing."
                    : "Click square icon to add a variant."}
                </p>
              </div>
            )}
            <VariantsTable
              fields={fields}
              form={form}
              append={append}
              remove={remove}
              replace={replace}
              comboboxVariantTypeName={comboboxVariantTypeName}
              allVariants={allVariants}
              isEditing={isEditing}
            />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductInfoInput
                form={form}
                variantIndex={0}
                canRemoveVariant={!isEditing}
              />
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
