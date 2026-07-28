import React, { useState } from "react";
import Sidebar from "../../components/layout/Sidebar.js";
import { ProductHeader } from "../../components/pos/ProductHeader.jsx";
import { CartHeader } from "../../components/pos/CartHeader.js";
import { ProductList } from "../../components/pos/ProductList.js";
import CartItems from "../../components/pos/CartItems.jsx";
function Pos({}) {
  const [search, setSearch] = useState("");

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-5/8">
        <ProductHeader setSearch={setSearch} />
        <ProductList search={search} />
      </div>

      <div className="w-3/8">
        <CartHeader />
        <CartItems />
      </div>
    </div>
  );
}
export default Pos;
