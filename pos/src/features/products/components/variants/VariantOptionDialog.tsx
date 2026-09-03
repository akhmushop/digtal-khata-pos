import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import { useState } from "react";
import useProductStore from "../../useProductStore";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash2 } from "lucide-react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Spinner } from "@/components/ui/spinner";

import { createEntityPromiseToast } from "@/lib/toast-utils";
import {
  variantOptionSchema,
  VariantOptionSchemaType,
} from "../../schemas/variant.schema";
import { VariantOptionGroup } from "../../product.types";
import { Input } from "@/components/ui/input";

export function VariantOptionDialog({
  activeVariant,
}: {
  activeVariant: VariantOptionGroup;
}) {
  const { productVariantOptions } = useProductStore();
  const [inputError, setInputError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [optionInput, setOptionInput] = useState("");
  const form = useForm<VariantOptionSchemaType>({
    resolver: zodResolver(variantOptionSchema),
    defaultValues: {
      variantOptionName: [],
      variantTypeId: activeVariant.typeId,
    },
  });
  const { createVariantOption } = useProductStore();
  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
      setOptionInput("");
    }
  }
  async function onSubmit(data: VariantOptionSchemaType) {
    console.log(data);
    await createEntityPromiseToast({
      data,
      apiCall: createVariantOption,
      entityName: "Variant Option",
      displayName:
        data.variantOptionName.length > 0
          ? (data.variantOptionName[0] ?? "Variant option")
          : "Multiple Options",
    });
    form.reset();
    setOptionInput("");
  }
  const isSubmitting = form.formState.isSubmitting;
  const options = form.watch("variantOptionName") || [];
  const errors = form.formState.errors.variantOptionName;
  const handleAddOption = () => {
    if (!optionInput.trim()) {
      setInputError("Option name cannot be empty");
      return;
    }
    setInputError(null);
    if (optionInput.trim()) {
      form.setValue("variantOptionName", [...options, optionInput.trim()], {
        shouldValidate: true,
      });
      setOptionInput("");
    }
  };
  const handleRemoveOption = (indexToRemove: number) => {
    form.setValue(
      "variantOptionName",
      options.filter((_, index) => index !== indexToRemove),
      { shouldValidate: true },
    );
  };
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form id="option-form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTrigger
          render={
            <Button variant="outline">
              <Plus />
              Add Option
            </Button>
          }
        />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Option</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col">
            <span>Variant Type</span>
            <span className="text-xl">{activeVariant.typeName}</span>
          </div>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div
                className="flex items-center justify-between"
                key={`${option}-${index}`}
              >
                <span>{option}</span>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleRemoveOption(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
          <Field>
            <FieldLabel>
              {errors && <FieldError errors={[errors]} />}
              {inputError && (
                <p className="text-sm font-medium text-destructive mt-1">
                  {inputError}
                </p>
              )}
            </FieldLabel>
            <div className="flex gap-3 items-center justify-center">
              <Input
                value={optionInput}
                onChange={(event) => {
                  setOptionInput(event.target.value);
                  if (inputError) setInputError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
                placeholder="Type option and press Enter"
                type="text"
              />
              <Button
                type="button"
                onClick={() => {
                  handleAddOption();
                }}
                variant="outline"
              >
                <Plus />
              </Button>
            </div>
          </Field>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />

            <Button disabled={isSubmitting} form="option-form" type="submit">
              {isSubmitting ? (
                <>
                  <Spinner /> Creating
                </>
              ) : (
                <>
                  <Save />
                  Add Option
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
