import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { ProductHeader } from "../components/ProductHeader";
import { CartHeader } from "../components/CartHeader";
import { ProductList } from "../components/ProductList";
import CartItems from "../components/CartItems";
function HomePage() {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedItems = localStorage.getItem("cart");
      return storedItems ? JSON.parse(storedItems) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);
  const addCartItems = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: (p.qty || 1) + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };
  return (
    <div className="flex">
      <Sidebar />
      <div className="w-5/8 ">
        <ProductHeader />
        <ProductList addCartItems={addCartItems} />
      </div>

      <div className="w-3/8">
        <CartHeader />
        <CartItems cartItems={cartItems} />
      </div>
    </div>
  );
}
export default HomePage;
