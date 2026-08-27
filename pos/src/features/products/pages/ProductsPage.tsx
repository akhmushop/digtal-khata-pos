import AppLayout from "@/layouts/AppLayout.js";
import Sidebar from "../../../components/layout/Sidebar.js";
import AdvancedPOSTable from "../components/ProductsPage/Table.js";
function Products() {
  return (
      <div className="flex flex-col w-full">
        <AdvancedPOSTable />
      </div>
  );
}

export default Products;
