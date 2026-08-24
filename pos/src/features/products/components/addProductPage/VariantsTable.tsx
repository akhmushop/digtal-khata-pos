import { useState } from "react";
import { GeneratedVariant, VariantRowProps } from "../../product.types";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { Square, SquareCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { isSameVariant } from "../../utils/is-same-variant";
import { createVariant } from "../../constants/form-defaults";
import { VariantTableRow } from "./VariantTableRow";

export function VariantsTable({
  form,
  append,
  remove,
  replace,
  allVariants,
}: VariantRowProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const variants = form.watch("variants") || [];
  const defaultIndex = variants.findIndex(
    (variant) => variant?.isDefault === true,
  );
  const handleDefaultChange = (value: string) => {
    const selectedIndex = Number(value);

    variants.forEach((_, index) => {
      form.setValue(`variants.${index}.isDefault`, index === selectedIndex);
    });

    const defaultVariant = variants.find(
      (variant) => variant.isDefault === true,
    );
    toast.add({
      description: (
        <span>
          Default variant updated{" "}
          {defaultVariant?.options?.map((option) => (
            <span key={option.typeId}>
              {option.typeName} {option.value}{" "}
            </span>
          ))}
        </span>
      ),
    });
  };
  const isAdded = (variant: GeneratedVariant) => {
    return variants.some((item) => isSameVariant(item, variant));
  };
  const handleAddVariant = (variant: GeneratedVariant) => {
    if (isAdded(variant)) {
      return;
    }
    const newVariant = createVariant(variant);
    if (variants.length === 0) {
      newVariant.isDefault = true;
    }
    append(newVariant, { shouldFocus: false });
  };
  const handleAddAllVariants = () => {
    // Use getValues for synchronous reading inside loops
    const currentVariants = form.getValues("variants") || [];
    let isFirst = currentVariants.length === 0;

    allVariants.forEach((variant) => {
      const alreadyExists = currentVariants.some((item) =>
        isSameVariant(item, variant),
      );

      if (!alreadyExists) {
        const newVariant = createVariant(variant);
        if (isFirst) {
          newVariant.isDefault = true;
          isFirst = false;
        }
        append(newVariant, { shouldFocus: false });
      }
    });
  };
  const handleSquareCheck = (variantIndex: number) => {
    const currentVariants = form.getValues("variants") || [];
    const wasDefault = currentVariants[variantIndex]?.isDefault;
    remove(variantIndex);

    if (wasDefault && currentVariants.length > 1) {
      let newDefaultIndex = variantIndex;
      if (variantIndex === currentVariants.length - 1) {
        newDefaultIndex = variantIndex - 1;
      }
      form.setValue(`variants.${newDefaultIndex}.isDefault`, true);
    }
  };
  const isAllAdded =
    allVariants.length > 0 && variants.length === allVariants.length;
  const isSomethingAdded =
    variants.length > 0 && variants.length !== allVariants.length;
  return allVariants.length !== 0 ? (
    <div className="border rounded">
      <RadioGroup
        className="contents"
        value={defaultIndex === -1 ? "" : String(defaultIndex)}
        onValueChange={handleDefaultChange}
      >
        <Table>
          <TableCaption>A list of Variations.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">Variant</TableHead>
              <TableHead className="w-[35%]">Sku</TableHead>
              <TableHead className="w-[35%]">Selling Price</TableHead>
              <TableHead className="w-[10%]">
                <Button
                  size="icon"
                  variant={
                    isAllAdded
                      ? "default"
                      : isSomethingAdded
                        ? "secondary"
                        : "ghost"
                  }
                  onClick={() => {
                    if (isAllAdded) {
                      replace([]);
                    } else {
                      handleAddAllVariants();
                    }
                  }}
                >
                  {isAllAdded || isSomethingAdded ? (
                    <SquareCheck className="text-blue-60" />
                  ) : (
                    <Square />
                  )}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allVariants.map((variant, index) => (
              <VariantTableRow
                key={variant.options
                  .map((option) => `${option.typeId}-${option.optionId}`)
                  .join("-")}
                variant={variant}
                form={form}
                remove={remove}
                expanded={expanded}
                setExpanded={setExpanded}
                onAddVariant={handleAddVariant}
                onRemoveVariant={handleSquareCheck}
              />
            ))}
          </TableBody>
        </Table>
      </RadioGroup>
    </div>
  ) : (
    <div className="h-15 w-full border border-gray border-dashed rounded flex items-center justify-center">
      <p>
        Select at least one variant type above to generate the variant matrix.
      </p>
    </div>
  );
}
