import { createColumnHelper } from "@tanstack/react-table";

import { type DataTableFeatures } from "./data-table-features";
import { Minus, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./data-table-column-header";
import { ProductType } from "@/features/products/product.schema";
import { useEffect, useState } from "react";
import axios from "../../../../../api/axios";
import { ViewSerialsDialog } from "./data-table";
import { Link } from "react-router";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, ProductType>();

export const columns = columnHelper.columns([
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <img
          className="w-10"
          src={row.original.imageUrl || undefined}
          alt={row.original.name}
        />
        <div className="min-w-0">
          <div className="font-medium truncate">{row.original.name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {row.original.hasVariants
              ? `${row.original.variants.length} variants`
              : (row.original.variants[0]?.sku ?? "—")}
          </div>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor("variants", {
    id: "stock",
    header: () => <div>Stock</div>,
    cell: ({ row }) => {
      const [available, setAvailable] = useState<string[]>([]);
      const [error, setError] = useState("");
      const product = row.original;
      const variantId = product.variants[0]?.id;
      // load fresh data every time the dialog opens
      useEffect(() => {
        if (product.hasVariants && product.trackingType !== "serial") return;
        if (variantId === undefined) return;
        setError("");
        axios
          .get(`variants/${variantId}/serials`)
          .then((res) => setAvailable(res.data))
          .catch(() => setError("Could not load serial numbers"));
      }, [product.hasVariants, product.trackingType, variantId]);
      const totalQuantity = product.variants.reduce(
        (total, variant) => total + variant.quantity,
        0,
      );
      return (
        <div className="flex flex-col">
          <span>{product.status}</span>
          <span>
            {totalQuantity} Units
            {!product.hasVariants &&
            product.trackingType === "serial" &&
            variantId !== undefined ? (
              <>
                {" & "}
                <ViewSerialsDialog
                  available={available}
                  variantId={variantId}
                />
                {" Serials"}
              </>
            ) : (
              ""
            )}
          </span>
        </div>
      );
    },
  }),
  columnHelper.accessor("variants", {
    id: "cost",
    header: () => <div className="text-right">Cost</div>,
    cell: ({ row }) => {
      const product = row.original;
      const purchasePriceList = product.variants.map(
        (v) => v.purchaseCost ?? 0,
      );
      return (
        <div className="text-right font-medium">
          {product.hasVariants
            ? `${Math.min(...purchasePriceList)} - ${Math.max(...purchasePriceList)}`
            : (product.variants[0]?.purchaseCost ?? 0)}
        </div>
      );
    },
  }),
  columnHelper.accessor("variants", {
    id: "price",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const product = row.original;
      const sellingPriceList = product.variants.map((v) => v.sellingPrice);
      return (
        <div className="text-right font-medium">
          {product.hasVariants
            ? `${Math.min(...sellingPriceList)} - ${Math.max(...sellingPriceList)}`
            : product.variants[0]?.sellingPrice}
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }
            />

            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <Link to={`/product/${row.original.id}/edit`}>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                </Link>

                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  }),
]);
