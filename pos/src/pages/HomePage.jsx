import React from "react";
import { Sidebar } from "../components/Sidebar";
import { ProductHeader } from "../components/ProductHeader";
import { CartHeader } from "../components/CartHeader";
import { ProductList } from "../components/ProductList";
function HomePage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="w-4/6 ">
        <ProductHeader />
        <ProductList />
      </div>

      <div className="w-2/6">
        <CartHeader />
      </div>
    </div>
  );
}
export default HomePage;
