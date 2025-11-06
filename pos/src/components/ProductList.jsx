import React, {  } from "react";
import { posProducts } from "../data/products";

export function ProductList({addCartItems}) {
  return (
<div className="overflow-scroll h-[calc(100vh-4.25rem)] no-scrollbar bg-zuccini-50">
      <div className="grid grid-cols-5  gap-1 p-5     ">
      {posProducts.map((product) => {
        return (
          <div
          key={product.id}
          onClick={() => {
            addCartItems(product)
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
  );
}
