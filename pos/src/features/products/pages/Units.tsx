import { EntityListLayout } from "@/components/common/EntityListLayout";
import { UnitsDialog } from "../components/Units/UnitsDialog";
import { UnitsTable } from "../components/Units/UnitsTable";

export function Units() {
  return (
    <EntityListLayout
      title="Units"
      description="Manage measurement units used by your products."
      action={<UnitsDialog />}
    >
      <UnitsTable />
    </EntityListLayout>
  );
}
