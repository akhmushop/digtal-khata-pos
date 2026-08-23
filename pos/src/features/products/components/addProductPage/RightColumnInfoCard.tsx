import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Grid } from "lucide-react";
import useAddProductStore from "../../useAddProductStore";
import { InputFile } from "./InputFile";
import {
  inventorySources,
  productStatus,
  trackingType,
} from "../../constants/form-status";
import { SelectOptions } from "./SelectOptions";
import { InventorySourceSelector } from "./InventorySourceSelector";
import { UseFormReturn } from "react-hook-form";
import { AddProductFormInput } from "../../product.schema";

export function RightColumnInfoCard({
  form,
}: {
  form: UseFormReturn<AddProductFormInput>;
}) {
  const { addProductsSelectOptions } = useAddProductStore();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid className="text-purple-600" />
          More Information
        </CardTitle>
        <CardDescription> Additional product details</CardDescription>
      </CardHeader>
      <CardContent>
          {/* image */}
          <InputFile
            urlName={`imageUrl`}
            fileName={`imageFile`}
            form={form}
            label="Default Image"
          />
          {/* Tracking Type */}
          <SelectOptions
            options={trackingType}
            label="Tracking Type"
            form={form}
            name="trackingType"
          />
          {/* status */}
          <SelectOptions
            options={productStatus}
            label="Status"
            form={form}
            name="status"
          />
          {/* inventoryOptions */}
          <InventorySourceSelector
            form={form}
            inventoryOptions={inventorySources}
          />
          {/* Supplier */}
          <SelectOptions
            options={addProductsSelectOptions.suppliers}
            label="Select a supplier"
            form={form}
            name="supplierId"
          />
          {/* Brand */}
          <SelectOptions
            options={addProductsSelectOptions.brands}
            label="Brand"
            form={form}
            name="brandId"
          />
          {/* Categories */}
          <SelectOptions
            options={addProductsSelectOptions.categories}
            label="Categories"
            form={form}
            name="categoryId"
          />
          {/* Tags */}
          {/* <InputField
              placeholder="Add tags separated by commas"
              label="Tags"
              type="text"
              name="tags"
              form={form}
            /> */}
      </CardContent>
    </Card>
  );
}
