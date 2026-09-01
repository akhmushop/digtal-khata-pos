import { EntityListLayout } from "@/components/common/EntityListLayout";
import { UnitsTable } from "@/features/products/components/Units/UnitsTable";
import { SupplierDialog } from "../components/suppliers/SuppliersDialog";
import { SuppliersTable } from "../components/suppliers/SuppliersTable";

export function Suppliers() {
  return (
    <EntityListLayout
      title="Suppliers"
      description="Manage suppliers and purchasing contacts."
      action={<SupplierDialog />}
    >
      <SuppliersTable />
    </EntityListLayout>
  );
}
