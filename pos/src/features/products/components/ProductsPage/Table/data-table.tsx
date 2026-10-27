import {
  useTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { features, type DataTableFeatures } from "./data-table-features";
import { Fragment, useEffect, useState } from "react";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableViewOptions } from "./data-table-view-options";
import {
  ProductVariantType,
  type ProductType,
} from "@/features/products/product.schema";
import axios from "../../../../../api/axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Pencil, X } from "lucide-react";
import { isAxiosError } from "axios";

interface DataTableProps {
  columns: ColumnDef<DataTableFeatures, ProductType>[];
  data: ProductType[];
  getRowCanExpand: (row: Row<DataTableFeatures, ProductType>) => boolean;
}

export function DataTable({ columns, data, getRowCanExpand }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const table = useTable({
    features,
    data,
    columns,
    getRowCanExpand,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center py-4">
        <Input
          placeholder="Filter Products..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DataTableViewOptions table={table} />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      if (row.getCanExpand()) {
                        row.toggleExpanded();
                      }
                    }}
                    className={row.getCanExpand() ? "cursor-pointer" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        onClick={
                          cell.column.id === "select" ||
                          cell.column.id === "actions"
                            ? (event) => event.stopPropagation()
                            : undefined
                        }
                      >
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell
                        colSpan={row.getVisibleCells().length}
                        className="bg-muted/30 p-4"
                      >
                        <div className="ml-8">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Variant</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="text-center">
                                  Cost
                                </TableHead>
                                <TableHead className="text-center">
                                  Selling Price
                                </TableHead>
                                <TableHead className="text-center">
                                  Stock
                                </TableHead>
                                <TableHead>Serials</TableHead>
                              </TableRow>
                            </TableHeader>

                            <TableBody>
                              {row.original.variants?.map((variant) => (
                                <ProductVariantRow
                                  key={variant.id}
                                  variant={variant}
                                />
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <br></br>
      <DataTablePagination table={table} />
    </div>
  );
}
export function ProductVariantRow({
  variant,
}: {
  variant: ProductVariantType;
}) {
  const [available, setAvailable] = useState<string[]>([]);
  const [error, setError] = useState("");

  // load fresh data every time the dialog opens
  useEffect(() => {
    if (variant.id === undefined) return;
    setError("");
    axios
      .get(`variants/${variant.id}/serials`)
      .then((res) => setAvailable(res.data))
      .catch(() => setError("Could not load serial numbers"));
  }, [variant.id]);
  return (
    <TableRow key={variant.id}>
      <TableCell>
        {variant.options?.map((option) => option.value).join("-")}
      </TableCell>
      <TableCell>{variant.sku}</TableCell>
      <TableCell className="text-center">{variant.purchaseCost ?? 0}</TableCell>
      <TableCell className="text-center">৳{variant.sellingPrice}</TableCell>
      <TableCell className="text-center">{variant.quantity}</TableCell>
      <TableCell>
        {available.length > 0 ? (
          variant.id !== undefined ? (
            <ViewSerialsDialog available={available} variantId={variant.id} />
          ) : (
            "-"
          )
        ) : (
          "-"
        )}
      </TableCell>
    </TableRow>
  );
}
export function ViewSerialsDialog({
  available,
  variantId,
}: {
  available: string[];
  variantId: number;
}) {
  const [serials, setSerials] = useState(available);
  const [editingSerial, setEditingSerial] = useState<string | null>(null);
  const [serialDraft, setSerialDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSerials(available);
  }, [available]);

  const startEditing = (serial: string) => {
    setEditingSerial(serial);
    setSerialDraft(serial);
    setError("");
  };

  const cancelEditing = () => {
    setEditingSerial(null);
    setSerialDraft("");
    setError("");
  };

  const saveSerial = async () => {
    if (editingSerial === null || !serialDraft.trim()) {
      setError("Serial number is required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const { data } = await axios.patch<{ serialNumber: string }>(
        `variants/${variantId}/serials`,
        {
          currentSerial: editingSerial,
          serialNumber: serialDraft.trim(),
        },
      );
      const updatedSerial = data.serialNumber;
      setSerials((current) =>
        current.map((serial) =>
          serial === editingSerial ? updatedSerial : serial,
        ),
      );
      cancelEditing();
    } catch (err) {
      const responseMessage = isAxiosError<{ message?: string }>(err)
        ? err.response?.data.message
        : undefined;
      setError(
        responseMessage ??
          "Could not update serial number. It may already be in use.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <span className="cursor-pointer">{`${serials.length} view`}</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Serials List</DialogTitle>
          <ol className="max-h-[300px] overflow-y-auto space-y-1">
            {serials.map((serial, i) => (
              <li
                key={serial}
                className="flex justify-between items-center gap-2 p-2 rounded hover:bg-muted"
              >
                {editingSerial === serial ? (
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <Input
                      aria-label="Serial number"
                      value={serialDraft}
                      onChange={(event) => setSerialDraft(event.target.value)}
                      className="font-mono"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Save serial number"
                      disabled={saving || !serialDraft.trim()}
                      onClick={saveSerial}
                    >
                      <Check />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Cancel editing serial number"
                      disabled={saving}
                      onClick={cancelEditing}
                    >
                      <X />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-mono text-sm">
                      <span className="text-muted-foreground mr-2">
                        {(i + 1).toString().padStart(2, "0")}
                      </span>
                      {serial}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Available
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit serial ${serial}`}
                        onClick={() => startEditing(serial)}
                      >
                        <Pencil />
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ol>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
