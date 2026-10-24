import { useEffect, useMemo, useState } from "react";
import AdvancedPOSTable from "../components/ProductsPage/Table.js";
import { DataTable } from "../components/ProductsPage/Table/data-table.js";
import { columns } from "../components/ProductsPage/Table/columns.js";
import useProductStore from "../useProductStore.js";
import { ProductType } from "../product.schema.js";
import { calculateProductStats } from "../utils/calculateProductStats.js";

export function Products() {
  const { products } = useProductStore();
  const stats = useMemo(() => calculateProductStats(products), [products]);
  return (
    <div>
      <AdvancedPOSTable stats={stats} />
      <div className="container mx-auto py-10">
        <DataTable
          columns={columns}
          data={products}
          getRowCanExpand={(row) => row.original.hasVariants}
        />
      </div>
    </div>
  );
}

export default Products;
