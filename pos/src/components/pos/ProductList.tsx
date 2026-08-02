import React, { useState } from "react";
import { useProductStore } from "../../store/useProductStore.js";
import { useCartStore } from "../../store/useCartStore.js";
import { PopupModal } from "./CartItems.js";
import { ProductsTypes } from "../../types/products.types.js";
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
  const [isOpen, setIsOpen] = useState(false);
  const [isVariationOpen, setIsVariationOpen] = useState(false);
  const [selectVariationProduct, SetSelectVariationProduct] =
    useState<ProductsTypes | null>(null);
  const handelClose = () => {
    setTimeout(() => setIsVariationOpen(false), 300);
    setIsOpen(false);
  };

  return (
    <div className="h-[calc(100vh-4.25rem)]">
      <div className=" h-full overflow-scroll  no-scrollbar bg-zuccini-50">
        <div className=" grid grid-cols-4  gap-1 p-5">
          {filtered.map((product) => {
            return (
              <div
                key={product.id}
                onClick={() => {
                  if (product.variations) {
                    setIsOpen(false);
                    setIsVariationOpen(true);
                    setTimeout(() => setIsOpen(true), 30);
                    SetSelectVariationProduct(product);
                    console.log("Product has variations:", product.variations);
                    return;
                  }
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
      {isVariationOpen && (
        <ShowProductVariations
          isOpen={isOpen}
          handelClose={handelClose}
          selectVariationProduct={selectVariationProduct}
          addToCart={addToCart}
          removeProductQuantity={removeProductQuantity}
        />
      )}
    </div>
  );
}
function ShowProductVariations({
  isOpen,
  handelClose,
  selectVariationProduct,
  addToCart,
  removeProductQuantity,
}: {
  isOpen: boolean;
  handelClose: () => void;
  selectVariationProduct: ProductsTypes | null;
  addToCart: (product: ProductsTypes) => void;
  removeProductQuantity: (id: number) => void;
}) {
  const variation = [
    { id: 1, size: "US 8", color: "Black", quantity: 0 },
    { id: 2, size: "US 9", color: "Black", quantity: 30 },
    { id: 3, size: "US 10", color: "Black", quantity: 30 },
    { id: 4, size: "US 11", color: "Black", quantity: 30 },
    { id: 5, size: "US 8", color: "White", quantity: 0 },
    { id: 6, size: "US 9", color: "White", quantity: 0 },
    { id: 7, size: "US 10", color: "White", quantity: 30 },
    { id: 8, size: "US 11", color: "White", quantity: 30 },
  ];
  const colors = [...new Set(variation.map((v) => v.color))];
  const size = [...new Set(variation.map((v) => v.size))];
  interface selectVariationType {
    color: string | undefined;
    size: string | undefined;
  }
  const [selectVariation, setSelectVariation] = useState<selectVariationType>({
    color: colors[0],
    size: "",
  });
  const handleOnchange = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const { name, ariaLabel } = e.target;
    const value = ariaLabel ?? undefined;
    setSelectVariation((prev) => {
      if (name === "color") {
        return {
          ...prev,
          color: value,
        };
      } else if (name === "size") {
        return {
          ...prev,
          size: value,
        };
      }
      return prev;
    });
  };
  const handleAddToCart = () => {
    if (!selectVariationProduct) return;
    if (selectVariationProduct.quantity <= 0) return;
    addToCart(selectVariationProduct);
    removeProductQuantity(selectVariationProduct.id);
    handelClose();
  };
  return (
    <PopupModal
      isOpen={isOpen}
      className="h-120 w-200"
      handelClose={handelClose}
    >
      <div className="flex flex-col h-full justify-between p-5">
        <div className="w-full flex justify-between items-center">
          <span className="text-black-200 text-lg font-bold">
            Product has variations. Please select a variation.
          </span>
          <button className="btn btn-active" onClick={handelClose}>
            Close
          </button>
        </div>
        <div className="h-full w-full flex gap-5 ">
          <div className=" w-3/6 py-5">
            <img
              className="h-full rounded-sm"
              src={selectVariationProduct?.image}
              alt=""
            />
          </div>
          <div className="w-3/6 flex flex-col justify-between gap-5 py-5">
            <span className="text-black-200 text-lg font-bold">{`${selectVariationProduct?.productName} ${selectVariation.color} ${selectVariation.size}`}</span>
            <div className="flex flex-col justify-start gap-5">
              <div>
                <span className="text-black-200 text-lg font-bold">
                  Price:{" "}
                </span>
                <span className="text-black-200 text-3xl font-bold">
                  {selectVariationProduct?.price} Taka
                </span>
              </div>

              <span>Select Color</span>
              <div className="join">
                {colors.map((c, i) => {
                  return (
                    <input
                      onChange={handleOnchange}
                      key={i}
                      className="join-item btn"
                      type="radio"
                      name="color"
                      checked={selectVariation.color === c}
                      aria-label={c}
                    />
                  );
                })}
              </div>
              <span>Select Size</span>
              <div className="join">
                {size.map((c, i) => {
                  const variant = variation.find(
                    (v) => v.color === selectVariation.color && v.size === c,
                  );
                  return (
                    <input
                      disabled={!variant || variant.quantity === 0}
                      onChange={handleOnchange}
                      key={i}
                      className="join-item btn"
                      type="radio"
                      name="size"
                      aria-label={c}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-between">
          <button className="btn btn-active btn-warning" onClick={handelClose}>
            Cancel
          </button>
          <button
            className="btn btn-active btn-success"
            onClick={handleAddToCart}
          >
            Add
          </button>
        </div>
      </div>
    </PopupModal>
  );
}
