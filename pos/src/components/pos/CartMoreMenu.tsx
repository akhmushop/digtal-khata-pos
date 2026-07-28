import React from "react";
import type { ClickToShowMoreProps } from "../../types/cart.types.js";

export function ClickToShowMore({
  showMore,
  setHoldConfirm,
  setIsOpen,
  setShowMoreFalse,
  setShowHoldItems,
}: ClickToShowMoreProps) {
  return (
    <div
      className={`absolute bg-gray-400 h-40 w-40 bottom-0 right-8 rounded transition-all  duration-300 transform origin-bottom-left ${
        !showMore
          ? "opacity-0 scale-90 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      <div className="flex flex-col items-center justify-around gap-1 h-full ">
        <div
          onClick={() => {
            setIsOpen(false);
            setHoldConfirm();
            setTimeout(() => setIsOpen(true), 30);
            setShowMoreFalse();
          }}
          className="bg-red-100 h-full w-full flex items-center justify-center cursor-pointer hover:bg-red-50 transition-all duration-200"
        >
          <h3>HOLD</h3>
        </div>
        <div
          onClick={() => {
            setShowHoldItems();
            setTimeout(() => setIsOpen(true), 30);
            setShowMoreFalse();
          }}
          className="bg-red-100 h-full w-full flex items-center justify-center cursor-pointer hover:bg-red-50 transition-all duration-200"
        >
          <h3>HOLD ITEMS</h3>
        </div>
        <div className="bg-red-100 h-full w-full flex items-center justify-center cursor-pointer hover:bg-red-50 transition-all duration-200">
          <h3>GROUP ITEMS</h3>
        </div>
        <div className="bg-red-100 h-full w-full flex items-center justify-center cursor-pointer hover:bg-red-50 transition-all duration-200">
          <h3>QUOTATION</h3>
        </div>
      </div>
    </div>
  );
}
