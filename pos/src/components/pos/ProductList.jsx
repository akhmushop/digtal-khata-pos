import React, { useState } from "react";
import { useProductStore } from "../../store/product-store";
// const storedData = JSON.parse(localStorage.getItem("posProducts"))
//  const valuation = storedData.reduce(
//     (total, item) => total + item.price * item.quantity,
//     0
//   );
//   const alertQuantity = storedData.filter((item)=> item.alertQuantity >= item.quantity)
// console.log(alertQuantity)
export function ProductList({ addCartItems, search }) {
  const product = useProductStore((state) => state.product);
  const filtered = product.filter((item) =>
    item.productName.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="h-[calc(100vh-4.25rem)]">
      <div className=" h-full overflow-scroll  no-scrollbar bg-zuccini-50">
        <div className=" grid grid-cols-5  gap-1 p-5     ">
          {filtered.map((product) => {
            return (
              <div
                key={product.barcode}
                onClick={() => {
                  addCartItems(product);
                }}
                className="h-50  bg-zuccini-300 rounded-sm flex flex-col items-center justify-between py-2 cursor-pointer "
              >
                <img className="h-20 rounded-sm " src={product.image} alt="" />
                <h2 className="">{product.name}</h2>
                <p className=" ">{product.category}</p>
                <h1 className=" ">TK: {product.price}</h1>
                <p className=" ">Stock: {product.stock}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
