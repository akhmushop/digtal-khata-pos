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
export function SuppliersTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Supplier</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Samsung</TableCell>
          <TableCell>0189646556</TableCell>
          <TableCell>ab@ab.com</TableCell>
          <TableCell>Active</TableCell>
          <TableCell className="text-right">
            <MoreHorizontal />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
