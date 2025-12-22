import React from "react";
export function ClickEmptyToResetCart({
  isOpen,
  setIsOpen,
  setEmptyCartCon,
  resetCart,
  cartItems,
}) {
  return (
    <div
      onClick={() => {
        setIsOpen();
        setTimeout(() => setEmptyCartCon(), 300);
      }}
      className={`fixed flex items-center justify-center inset-0 bg-black/80 backdrop-blur-sm z-50  transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 "
      } `}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={` h-40 w-70 bg-zuccini-50 flex flex-col items-center justify-center  transition-transform duration-300 rounded ${
          isOpen ? "scale-100 " : "scale-90"
        }`}
      >
        <h1 className="text-xl mb-5">Do you want to clear this cart?</h1>
        <div className="flex  w-full justify-center gap-3">
          <button
            onClick={() => {
              if (cartItems.length === 0)
                return alert("Your cart is already empty");
              resetCart();
              setIsOpen();
              setTimeout(() => setEmptyCartCon(), 300);
            }}
            className="bg-red-400 hover:bg-red-500 cursor-pointer px-4 py-2 rounded transition-all duration-300 "
          >
            Yes
          </button>
          <button
            onClick={() => {
              setIsOpen();
              setTimeout(() => setEmptyCartCon(), 300);
            }}
            className="bg-red-400 hover:bg-red-500 cursor-pointer px-4 py-2 rounded transition-all duration-300 "
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

