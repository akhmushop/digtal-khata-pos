import Sidebar from "../../../components/layout/Sidebar.js";
import AdvancedPOSTable from "../components/ProductsPage/Table.js";
function AddProduct() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col w-full">
        <AdvancedPOSTable />
      </div>
    </div>
  );
}

export default AddProduct;
