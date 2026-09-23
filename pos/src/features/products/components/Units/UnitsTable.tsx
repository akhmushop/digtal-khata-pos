import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import useProductStore from "../../useProductStore";
export function UnitsTable() {
  const { productSelectOptions } = useProductStore();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Units</TableHead>
          <TableHead>Abbreviation</TableHead>
          <TableHead>Products</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {productSelectOptions.units.map((unit) => (
          <TableRow key={unit.value}>
            <TableCell className="font-medium">{unit.label}</TableCell>
            <TableCell>25</TableCell>
            <TableCell>Active</TableCell>
            <TableCell className="text-right">
              <MoreHorizontal />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
