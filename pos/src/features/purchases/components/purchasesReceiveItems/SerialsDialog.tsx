import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PurchasesItems } from "../../purchase.types";
import { UseFormReturn } from "react-hook-form";
import { ReceiveItemsFormValues } from "../../schemas/receiveItem.schema";

export function SerialsDialog({
  item,
  form,
  index,
}: {
  item: PurchasesItems;
  form: UseFormReturn<ReceiveItemsFormValues>;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  // 1. Watch how many items the user is receiving right now
  const receiveNow = Number(form.watch(`items.${index}.receiveNow`)) || 0;

  // 2. Watch the current serial numbers array
  const serials = form.watch(`items.${index}.serialNumbers`) || [];

  // 3. Create an array of exactly 'receiveNow' length to map over
  // e.g., if receiveNow is 5, this creates [0, 1, 2, 3, 4]
  const inputSlots = Array.from({ length: receiveNow }, (_, i) => i);
  const serialError =
    form.formState.errors.items?.[index]?.serialNumbers?.message;
  const handleOnChange = (i: number, value: string) => {
    // 4. Copy the current serials array
    const updatedSerials = [...serials];
    // 5. Update the specific index
    updatedSerials[i] = value;
    // 6. Save back to the main form
    form.setValue(`items.${index}.serialNumbers`, updatedSerials, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="hover:cursor-pointer">{item.trackingType}</Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Serial Numbers</DialogTitle>
          <DialogDescription>
            Product Name: {item.productName} <br />
            Please enter {receiveNow} serial number(s).
          </DialogDescription>
        </DialogHeader>
        {serialError && (
          <p className="text-sm font-medium text-destructive bg-red-50 border border-red-200 p-2 rounded-md">
            {serialError as string}
          </p>
        )}
        <div className="max-h-[400px] overflow-y-auto space-y-3 py-2">
          {receiveNow === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Receive quantity is 0.
            </p>
          ) : (
            inputSlots.map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Label className="w-8 text-right text-muted-foreground">
                  {i + 1}.
                </Label>
                <Input
                  type="text"
                  placeholder={`Scan or type serial #${i + 1}`}
                  value={serials[i] || ""} // Read from form state
                  onChange={(e) => handleOnChange(i, e.target.value)}
                />
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline">
                Done
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
