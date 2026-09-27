import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BatchSchemaTypeOutput } from "../../schemas/batch.schema";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BatchListTable({
  batchList,
  handleRemoveBatch,
}: {
  batchList: BatchSchemaTypeOutput[];
  handleRemoveBatch: (batchIndex: number) => void;
}) {
  const totalQuantity = batchList.reduce(
    (sum, batch) => sum + batch.quantity,
    0,
  );
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Batch Number</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>M/E</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {batchList.map((batch, batchIndex) => (
          <TableRow key={batch.batchNumber}>
            <TableCell className="font-medium">{batch.batchNumber}</TableCell>
            <TableCell>{batch.quantity}</TableCell>
            <TableCell>
              {new Date(batch.manufacturedDate).toLocaleDateString()} -{" "}
              {new Date(batch.expiryDate).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-red-500 hover:text-red-600"
                onClick={() => handleRemoveBatch(batchIndex)}
              >
                <Trash className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total Quantity</TableCell>
          <TableCell className="text-right">{totalQuantity}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
