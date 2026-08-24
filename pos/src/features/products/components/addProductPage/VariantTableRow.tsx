import { Fragment } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InputField } from "./InputField";
import { ProductInfoInput } from "./ProductInfoInput";
import { Label } from "@/components/ui/label";
import { ChevronDown, Square, SquareCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { GeneratedVariant, VariantTableRowProps } from "../../product.types";
import { isSameVariant } from "../../utils/is-same-variant";
export function VariantTableRow({
  variant,
  form,
  remove,
  expanded,
  setExpanded,
  onAddVariant,
  onRemoveVariant,
}: VariantTableRowProps) {
  const variants = form.watch("variants") || [];
  const variantIndex = variants.findIndex((item) =>
    isSameVariant(item, variant),
  );
  const added = variantIndex !== -1;
  const isDefault = added && form.watch(`variants.${variantIndex}.isDefault`);
  const id = variant.options
    .map((option) => `${option.typeId}-${option.optionId}`)
    .join("-");
  const radioId = `radio-${id}`;
  const getVariantLabel = (variant: GeneratedVariant) => {
    return variant.options.map((option) => option.value).join(" / ");
  };
  return (
    <Fragment>
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-3">
            {added && (
              <RadioGroupItem value={String(variantIndex)} id={radioId} />
            )}
            {getVariantLabel(variant)}
            {isDefault && <Label htmlFor={radioId}>Default</Label>}
          </div>
        </TableCell>
        <TableCell>
          {added ? (
            <InputField
              placeholder="auto-generated if blank"
              type="text"
              name={`variants.${variantIndex}.sku`}
              form={form}
            />
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell>
          {added ? (
            <InputField
              placeholder="0.00"
              type="number"
              name={`variants.${variantIndex}.sellingPrice`}
              form={form}
            />
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </TableCell>

        <TableCell>
          <div className="flex">
            {added ? (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setExpanded(null);
                  onRemoveVariant(variantIndex);
                }}
              >
                <SquareCheck />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  onAddVariant(variant);
                }}
              >
                <Square />
              </Button>
            )}
            <Tooltip>
              <TooltipTrigger
                render={
                  <span>
                    <Button
                      onClick={() => {
                        if (!added) return;
                        setExpanded(expanded === id ? null : id);
                      }}
                      variant="ghost"
                      size="icon"
                      className={!added ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <ChevronDown
                        className={`cursor-pointer size-5 transition-transform duration-300  ${expanded === id ? "rotate-180" : "rotate-0"}`}
                      />
                    </Button>
                  </span>
                }
              />
              <TooltipContent>
                {added ? <p>Expand / Collapse</p> : <p>Add variant first</p>}
              </TooltipContent>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>
      {expanded === id && added && (
        <TableRow key={`${id}-${added}`}>
          <TableCell className="py-5" colSpan={5}>
            <ProductInfoInput
              form={form}
              variantIndex={variantIndex}
              remove={remove}
            />
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}
