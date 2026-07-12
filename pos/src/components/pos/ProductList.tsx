import React from "react";
import { useProductStore } from "../../store/product-store.js";
import { useCartStore } from "../../store/cart-store.js";
interface ProductListProps {
  search: string;
}
export function ProductList({ search }: ProductListProps) {
  // const getProducts = useProductStore((state) => state.getProducts);
  // const product = useProductStore((state) => state.product);
  // const removeProductQty = useProductStore((state) => state.removeProductQty);
  const { addToCart } = useCartStore();
  const { products, removeProductQuantity } = useProductStore();
  const filtered = products.filter((item) =>
    item.productName.toLowerCase().includes(search.toLowerCase() || ""),
  );

  return (
    <div className="h-[calc(100vh-4.25rem)]">
      <div className=" h-full overflow-scroll  no-scrollbar bg-zuccini-50">
        <div className=" grid grid-cols-4  gap-1 p-5">
          {filtered.map((product) => {
            return (
              <div
                key={product.id}
                onClick={() => {
                  if (product.quantity <= 0) return;
                  addToCart(product);
                  removeProductQuantity(product.id);
                }}
                className={`select-none relative h-60 bg-zuccini-300 rounded-sm flex flex-col items-center justify-between py-2 
  ${
    product.quantity <= 0 ? "cursor-not-allowed opacity-60" : "cursor-pointer"
  }`}
              >
                {product.quantity <= 0 && (
                  <div className="absolute inset-0 bg-black/50 rounded-sm flex items-center justify-center text-white text-xl">
                    Stock Out
                  </div>
                )}
                <img className="h-20 rounded-sm " src={product.image} alt="" />
                <h2 className="text-center">{product.productName}</h2>
                <p className=" ">{product.category}</p>
                <h1 className=" ">TK: {product.price}</h1>
                <p className=" ">Stock: {product.quantity}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
