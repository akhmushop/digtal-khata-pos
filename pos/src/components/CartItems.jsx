import React from "react";
import { MdOutlineAddCircleOutline, MdDeleteOutline } from "react-icons/md";
import { FiMinusCircle } from "react-icons/fi";
export default function CartItems({cartItems = []}) {
  return (
    <div className="overflow-scroll h-[calc(100vh-4.25rem)] no-scrollbar">
      {cartItems.map((items) => {
        return (
          <div
            key={items.id}
            className="h-20 m-2 bg-amber-100 rounded-xl flex items-center "
          >
            <div className="flex items-center w-full justify-between">
              <img className="h-20  rounded-xl " src={items.image} alt="" />
              <div className="flex-1 pl-5">
                <h1>{items.name}</h1>
                <p>
                  {items.price} * {items.qty} = {items.price * items.qty}
                </p>
              </div>
              <div className="flex text-2xl gap-x-4 items-center pr-5  ">
                <FiMinusCircle />
                <span className="">{items.qty}</span>
                <MdOutlineAddCircleOutline />
                <MdDeleteOutline />
              </div>
            </div>
          </div>
        );
      })}

      {/* cartCalculation */}
      <div className="p-5">
        <div className="flex justify-between py-2 border-b">
          <h4>Total Items</h4>
          <h4>Qty: 6</h4>
        </div>
        <div className="flex justify-between py-2 border-b">
          <h4>Subtotal</h4>
          <h4>TK: 9000</h4>
        </div>
        <div>
          <h3 className="py-2  w-full flex item">Charges & Taxes</h3>
        </div>
        <div className="flex justify-between py-2 border-b">
          <h4>VAT: 5%</h4>
          <h4>TK: 10</h4>
        </div>
        <div>
          <button className="flex justify-center py-2 border-b w-full">
            ADD CHARGE
          </button>
        </div>
        <div className="flex justify-between py-2 border-b">
          <h4>Total Charges</h4>
          <h4>TK: 10</h4>
        </div>
        <div className="flex justify-between py-2 border-b">
          <h1>FINAL TOTAL</h1>
          <h1>TK: 9010</h1>
        </div>
        <div className="grid grid-cols-2 py-2 ">
          <button>EMPTY</button>
          <button>MORE</button>
          <button className="col-span-2">PAYMENTS</button>
          <button className="col-span-2">CASH TK: 9010</button>
        </div>
      </div>
    </div>
  );
}
