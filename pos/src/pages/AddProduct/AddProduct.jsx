import React from "react";
import Sidebar from "../../components/Sidebar";
import DropdownModal from "../../components/common/Dropdown";
function AddProduct() {
  const label = "Status";
  const options = [
    { id: 1, name: "Active" },
    { id: 2, name: "Inactive" },
    { id: 3, name: "Alert" },
    { id: 4, name: "Out of Stock" },
  ];
  return (
    <div className="flex">
      <Sidebar />
      <DropdownModal options={options} label={label} />
      <DropdownModal options={options} label={label} />
    </div>
  );
}
export default AddProduct;
