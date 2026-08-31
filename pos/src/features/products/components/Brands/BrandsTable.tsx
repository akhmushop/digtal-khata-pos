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
export function BrandsTable() {
  const { productSelectOptions } = useProductStore();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Brand</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {productSelectOptions.brands.map((brand) => (
          <TableRow key={brand.value}>
            <TableCell className="font-medium">{brand.label}</TableCell>
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
