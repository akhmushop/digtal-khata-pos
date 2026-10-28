import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AddCustomer } from "@/features/Contacts/pages/Customer";
import { useCustomerStore } from "@/store/useCustomerStore";
import React, { useState, useRef, useEffect } from "react";
import { Controller, FieldValues, UseFormReturn } from "react-hook-form";
import {
  RiCloseLargeFill,
  RiArrowDropDownFill,
  RiUserAddFill,
} from "react-icons/ri";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CartSchemaType } from "../../schemas/cart.schema";
export function CartHeader({ form }: { form: UseFormReturn<CartSchemaType> }) {
  const {
    customerInfo,
    handleOnchange,
    resetCustomerInfo,
    handleAddCustomer,
    resetShowCustomerInfo,
  } = useCustomerStore();
  const [isOpenCustomerModal, setIsOpenCustomerModal] = useState(false);
  const [checked, setChecked] = useState(true);

  return (
    <>
      <Card>
        <CardContent className="gap-4 grid grid-cols-12">
          <div className="col-span-3">
            <SaleDatePicker form={form} />
          </div>
          <div className="col-span-9 flex gap-4">
            <CustomerInputAndSearch form={form} />
            <Button
              variant="secondary"
              onClick={() => {
                setIsOpenCustomerModal(true);
              }}
            >
              <UserPlus />
            </Button>
          </div>
        </CardContent>
      </Card>
      {isOpenCustomerModal && (
        <AddCustomer
          handleOnchange={handleOnchange}
          customerInfo={customerInfo}
          handleAddCustomer={handleAddCustomer}
          setIsOpenCustomerModal={setIsOpenCustomerModal}
          resetCustomerInfo={resetCustomerInfo}
        />
      )}
    </>
  );
}
export function CustomerInputAndSearch({
  form,
}: {
  form: UseFormReturn<CartSchemaType>;
}) {
  const { customers, setShowCustomerInfo } = useCustomerStore();

  const customersValue = customers.map((customer) => ({
    label: customer.name,
    value: customer.id,
  }));

  return (
    <Controller
      name="customerId"
      control={form.control}
      render={({ field }) => {
        const selectedCustomer =
          customersValue.find((customer) => customer.value === field.value) ??
          null;

        return (
          <Combobox
            items={customersValue}
            value={selectedCustomer}
            onValueChange={(customer) => {
              if (!customer) {
                field.onChange(null);
                setShowCustomerInfo(null);
                return;
              }

              field.onChange(customer.value);

              const originalCustomer = customers.find(
                (c) => c.id === customer.value,
              );

              setShowCustomerInfo(originalCustomer ?? null);
            }}
            itemToStringValue={(customer) => customer.label}
          >
            <ComboboxInput
              className="w-full"
              placeholder="Select a customer"
              showClear
            />

            <ComboboxContent>
              <ComboboxEmpty>No customer found.</ComboboxEmpty>

              <ComboboxList>
                {(customer) => (
                  <ComboboxItem key={customer.value} value={customer}>
                    {customer.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        );
      }}
    />
  );
}
export function SaleDatePicker({
  form,
}: {
  form: UseFormReturn<CartSchemaType>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Controller
      name="saleDate"
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  id={field.name}
                  className="justify-start font-normal"
                >
                  {field.value
                    ? new Date(field.value).toLocaleDateString()
                    : "Select date"}
                </Button>
              }
            />
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                defaultMonth={field.value ? new Date(field.value) : new Date()}
                captionLayout="dropdown"
                onSelect={(date) => {
                  field.onChange(date);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          {fieldState.error && (
            <FieldError>{fieldState.error.message}</FieldError>
          )}
        </Field>
      )}
    />
  );
}
