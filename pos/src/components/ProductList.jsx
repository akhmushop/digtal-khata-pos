import React, { useState } from "react";
import { posProducts } from "../data/products";
import { cartItems } from "../data/cartItems";

export function ProductList() {
  return (
    <div className="grid grid-cols-5  gap-1 p-5   bg-gray-300  overflow-scroll h-[calc(100vh-4.25rem)] no-scrollbar   ">
      {posProducts.map((product , index) => {
        return (
          <div
          key={index}
            className="h-50  bg-amber-300 rounded-sm flex flex-col items-center justify-between py-2 cursor-pointer"
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
  );
}
