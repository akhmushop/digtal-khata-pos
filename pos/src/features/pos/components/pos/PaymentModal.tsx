import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Controller,
  FieldValues,
  UseFormReturn,
  useWatch,
} from "react-hook-form";

export function PaymentModal({
  subTotal,
  vat,
  form,
}: {
  subTotal: number;
  vat: number;
  form: UseFormReturn<FieldValues, any, FieldValues>;
}) {
  const paymentMethod = useWatch({
    control: form.control,
    name: "paymentMethod",
  });
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button className="w-full">
            PAY - {(subTotal + vat).toFixed(2)}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-xl w-full">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
          <DialogDescription>Total Due : {subTotal}</DialogDescription>
        </DialogHeader>
        {/* left side */}
        <div className="flex gap-5">
          <PaymentMethod form={form} />
          {/* right side */}
          <div className="flex flex-col gap-5">
            {paymentMethod === "cash" && (
              <CashPayment finalTotal={subTotal + vat} form={form} />
            )}
            {paymentMethod === "bangla_qr" && (
              <DigitalCashPayment paymentInstruction="Bangla QR:01870707900" />
            )}
            {paymentMethod === "card" && (
              <DigitalCashPayment paymentInstruction="Insert / tap card on POS terminal" />
            )}
            {paymentMethod === "split" && <SplitPayment />}
            {paymentMethod === "due" && <Due />}
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button form="cart-form" type="submit">
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function CashPayment({
  finalTotal,
  form,
}: {
  finalTotal: number;
  form: UseFormReturn<FieldValues, any, FieldValues>;
}) {
  const cashReceived = useWatch({
    control: form.control,
    name: "cashReceive",
  });
  const stillOwed = Math.max(0, finalTotal - (Number(cashReceived) || 0));
  const CashPaymentShortcuts = [
    { label: "Exact", value: finalTotal },
    { label: "100", value: 100 },
    { label: "200", value: 200 },
    { label: "300", value: 300 },
    { label: "500", value: 500 },
    { label: "1000", value: 1000 },
  ];
  return (
    <>
      <Controller
        name="cashReceive"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Cash Receive</FieldLabel>
            <Input
              id={field.name}
              type="number"
              {...field}
              value={field.value ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                const numVal = val === "" ? undefined : Number(val);
                field.onChange(numVal);
              }}
              placeholder="0.00"
            />
          </Field>
        )}
      />
      <div className="flex flex-wrap gap-3">
        {CashPaymentShortcuts.map((shortcut) => (
          <Button
            key={shortcut.value}
            type="button" // Important! Prevents form submit
            variant="outline"
            size="lg"
            onClick={() => {
              // Clicking "100" instantly puts 100 in the cashReceive input!
              form.setValue("cashReceive", shortcut.value);
            }}
          >
            {shortcut.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center">
          <span>Still owed</span>
          <span className="text-xl font-bold">{stillOwed.toFixed(2)}</span>
        </CardContent>
      </Card>
    </>
  );
}
function DigitalCashPayment({
  paymentInstruction,
}: {
  paymentInstruction: string;
}) {
  return (
    <>
      <Card>
        <CardContent className="flex flex-col">
          <span>Send To</span>
          <span>{paymentInstruction}</span>
        </CardContent>
      </Card>
      <Field>
        <FieldLabel htmlFor="input-field-username">
          Transaction ID (last 6+ chars)
        </FieldLabel>
        <Input
          id="input-field-username"
          type="text"
          placeholder="e.g.9AD98ADFAF"
        />
      </Field>
      <Card>
        <CardContent className="flex flex-col">
          <span>Amount to charge digitally:</span>
          <span>80</span>
        </CardContent>
      </Card>
    </>
  );
}
function PaymentMethod({
  form,
}: {
  form: UseFormReturn<FieldValues, any, FieldValues>;
}) {
  const paymentMethodOptions = [
    { label: "Cash", value: "cash" },
    { label: "Bangla QR", value: "bangla_qr" },
    { label: "Card", value: "card" },
    { label: "Due", value: "due" },
    { label: "Split", value: "split" },
  ];
  return (
    <div className="flex flex-col gap-3">
      <span>Select method</span>
      <Controller
        name="paymentMethod"
        control={form.control}
        render={({ field }) => (
          <ToggleGroup
            value={field.value ? [field.value] : []}
            onValueChange={(value) => {
              const selectedValue = value[0];

              field.onChange(selectedValue ? selectedValue : null);
            }}
            size="lg"
            variant="outline"
            className="grid grid-cols-2 max-h-50"
          >
            {paymentMethodOptions.map((method) => (
              <ToggleGroupItem
                key={method.value}
                value={method.value}
                className="col-span-1 data-pressed:bg-primary data-pressed:text-primary-foreground"
              >
                {method.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      />
    </div>
  );
}
function SplitPayment() {
  return (
    <>
      <Card>
        <CardContent className="flex flex-col">
          <span>Split Payment</span>
          <div className="flex">
            <span>Total: ৳25.00</span>
            <span> Remaining: ৳25.00</span>
          </div>
        </CardContent>
      </Card>
      <Field>
        <FieldLabel htmlFor="input-field-username">Cash part</FieldLabel>
        <Input id="input-field-username" type="number" placeholder="0.00" />
      </Field>
      <div className="flex flex-col gap-3">
        <span>Digital method</span>
        <ToggleGroup
          size="lg"
          variant="outline"
          className="flex flex-wrap gap-3 "
        >
          <ToggleGroupItem value="a">Bangla QR</ToggleGroupItem>
          <ToggleGroupItem value="b">Card</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <Field>
        <FieldLabel htmlFor="input-field-username">Digital part</FieldLabel>
        <div className="flex items-center gap-3">
          <Input id="input-field-username" type="number" placeholder="0.00" />
          <Button>Fill digital</Button>
        </div>
      </Field>

      <Field>
        <FieldLabel htmlFor="input-field-username">
          Transaction ID (optional)
        </FieldLabel>
        <Input
          id="input-field-username"
          type="text"
          placeholder="for the digital part"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="input-field-username">Due part</FieldLabel>
        <div className="flex items-center gap-3">
          <Input id="input-field-username" type="number" placeholder="0.00" />
          <Button>Fill Due</Button>
        </div>
      </Field>
      <Card>
        <CardContent className="flex flex-col">
          <div className="flex justify-between">
            <span>Cash</span>
            <span>৳25.00</span>
          </div>
          <div className="flex justify-between">
            <span>Bangle QR</span>
            <span>৳25.00</span>
          </div>
          <div className="flex justify-between">
            <span>Due</span>
            <span>৳25.00</span>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
function Due() {
  return (
    <div>
      <Card>
        <CardContent>
          <DialogHeader>
            <DialogTitle>Recording as Due (Baki)</DialogTitle>
            <DialogDescription>
              ৳45.00 will be added to Walk-in Customer's outstanding ledger.
            </DialogDescription>
          </DialogHeader>

          <span>Customer phone: 4852748</span>
        </CardContent>
      </Card>
    </div>
  );
}
