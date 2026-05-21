import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { ProductHeader } from "../../components/pos/ProductHeader";
import { CartHeader } from "../../components/pos/CartHeader";
import { ProductList } from "../../components/pos/ProductList";
import CartItems from "../../components/pos/CartItems";
function Pos({
  handleOnchange,
  customerInfo,
  handleAddCustomer,
  setCustomerInfo,
  initialCustomerInfo,
}) {
  const [search, setSearch] = useState("");
  const initialInputValue = {
    name: "",
    phone: "",
    address: "",
  };
  const [inputValue, setInputValue] = useState(initialInputValue);
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
