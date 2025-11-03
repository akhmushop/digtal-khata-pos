import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { ProductHeader } from "../components/ProductHeader";
import { CartHeader } from "../components/CartHeader";
import { ProductList } from "../components/ProductList";
import CartItems from "../components/CartItems";
function HomePage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="w-5/8 ">
        <ProductHeader />
        <ProductList />
      </div>

      <div className="w-3/8">
        <CartHeader />
        <CartItems />
      </div>
    </div>
  );
}
export default HomePage;
