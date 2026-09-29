import React, { useState } from "react";
import Sidebar from "../../components/layout/Sidebar.js";
import { ProductHeader } from "@/features/pos/components/pos/ProductHeader.js";
import { ProductList } from "@/features/pos/components/pos/ProductList.js";
import { CartHeader } from "@/features/pos/components/pos/CartHeader.js";
import CartItems from "@/features/pos/components/pos/CartItems.js";
function Pos({}) {
  const [searchProducts, setSearchProducts] = useState("");

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-5/8">
        <ProductHeader setSearchProducts={setSearchProducts} />
        <ProductList searchProducts={searchProducts} />
      </div>

      <div className="w-3/8">
        <CartHeader />
        <CartItems />
      </div>
    </div>
  );
}
export default Pos;
