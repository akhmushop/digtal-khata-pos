import React, { useState } from "react";
import Sidebar from "../../components/Sidebar.js";
import { ProductHeader } from "../../components/pos/ProductHeader.jsx";
import { CartHeader } from "../../components/pos/CartHeader.js";
import { ProductList } from "../../components/pos/ProductList.js";
import CartItems from "../../components/pos/CartItems.jsx";
function Pos({
  handleOnchange,
  customerInfo,
  handleAddCustomer,
  setCustomerInfo,
  initialCustomerInfo,
  inputValue,
  setInputValue,
  initialInputValue,
}) {
  const [search, setSearch] = useState("");

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-5/8">
        <ProductHeader setSearch={setSearch} />
        <ProductList search={search} />
      </div>

      <div className="w-3/8">
        <CartHeader
          customerInfo={customerInfo}
          handleOnchange={handleOnchange}
          handleAddCustomer={handleAddCustomer}
          setCustomerInfo={setCustomerInfo}
          initialCustomerInfo={initialCustomerInfo}
          inputValue={inputValue}
          setInputValue={setInputValue}
          initialInputValue={initialInputValue}
        />
        <CartItems inputValue={inputValue} setInputValue={setInputValue} />
      </div>
    </div>
  );
}
export default Pos;
