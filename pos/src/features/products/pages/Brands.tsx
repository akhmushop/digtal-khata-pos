import { BrandsTable } from "../components/Brands/BrandsTable";
import { BrandsDialog } from "../components/Brands/BrandsDialog";
import { EntityListLayout } from "@/components/common/EntityListLayout";

export function Brands() {
  return (
    <EntityListLayout
      title="Brands"
      description="Manage brands used by your products."
      action={<BrandsDialog />}
    >
      <BrandsTable />
    </EntityListLayout>
  );
}
