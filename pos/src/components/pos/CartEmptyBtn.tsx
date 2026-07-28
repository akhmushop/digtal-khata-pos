import React from "react";
import { useCartStore } from "../../store/useCartStore.js";
import { useProductStore } from "../../store/useProductStore.js";
import type { ClickEmptyToResetCartProps } from "../../types/cart.types.js";
export function ClickEmptyToResetCart({
  isOpen,
  setIsOpen,
  setEmptyCartCon,
}: ClickEmptyToResetCartProps) {
  const resetCart = useCartStore((state) => state.resetCart);
  const cart = useCartStore((state) => state.cart);
  const { restoreAllProductQuantityToCart } = useProductStore();
  const handleShowPopup = () => {
    setIsOpen(false);
    setTimeout(() => setEmptyCartCon(), 300);
  };
  const handleClearCart = () => {
    if (cart.length === 0) return alert("Your cart is already empty");
    cart.map((p) => {
      restoreAllProductQuantityToCart(p.id, p.soldQuantity);
    });
    resetCart();
    handleShowPopup();
  };
  return (
    <div
      onClick={handleShowPopup}
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
            onClick={handleClearCart}
            className="bg-red-400 hover:bg-red-500 cursor-pointer px-4 py-2 rounded transition-all duration-300 "
          >
            Yes
          </button>
          <button
            onClick={handleShowPopup}
            className="bg-red-400 hover:bg-red-500 cursor-pointer px-4 py-2 rounded transition-all duration-300 "
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
