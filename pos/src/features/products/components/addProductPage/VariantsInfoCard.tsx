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
import useAddProductStore from "../../useAddProductStore";
import { generateVariants } from "../../utils/generate-variants";
import { emptyVariant } from "../../constants/form-defaults";
import { MultipleVariantSelector } from "./MultipleVariantSelector";
import { VariantsTable } from "./VariantsTable";
import { ProductInfoInput } from "./ProductInfoInput";
import { AccordionCardProps } from "../../addProduct.types";
export function VariantsInfoCard({
  form,
  append,
  replace,
  remove,
}: AccordionCardProps) {
  const [comboboxVariantTypeName, setComboboxVariantTypeName] = useState<
    string[]
  >([]);
  const { addProductVariantOptions } = useAddProductStore();
  const filtered = addProductVariantOptions.filter((option) =>
    comboboxVariantTypeName.includes(option.typeName),
  );
  const allVariants = generateVariants(filtered);
  const handleHasVariantsChange = (value: boolean) => {
    form.setValue("hasVariants", value);

    if (value) {
      // Has variants → start with no variants
      replace([]);
    } else {
      // No variants → one default inventory item
      replace([emptyVariant]);
    }
  };
  const hasVariants = form.watch("hasVariants");
  const variants = form.watch("variants") || [];
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
            <MultipleVariantSelector
              setComboboxVariantTypeName={setComboboxVariantTypeName}
              replace={replace}
            />
            {allVariants.length !== 0 && (
              <div className="flex justify-between">
                <div className="flex gap-5">
                  <p>
                    Generated Variants
                    <Badge variant="outline"> {allVariants.length} </Badge>
                  </p>
                  <p>
                    Variant Added
                    <Badge variant="outline"> {variants.length} </Badge>
                  </p>
                </div>
                <p>Click Square Icon to Add Variant</p>
              </div>
            )}
            <VariantsTable
              form={form}
              append={append}
              remove={remove}
              replace={replace}
              comboboxVariantTypeName={comboboxVariantTypeName}
              allVariants={allVariants}
            />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductInfoInput form={form} variantIndex={0} />
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
