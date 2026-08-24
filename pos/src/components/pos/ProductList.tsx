import React, { SetStateAction, useState } from "react";
import { useCartStore } from "../../store/useCartStore.js";
import { PopupModal } from "./CartItems.js";
import { ProductsTypes } from "../../types/products.types.js";
import { useProductStore } from "@/features/products/usedashboardProductStore.js";
interface ProductListProps {
  search: string;
}
interface selectVariationType {
  color: string;
  size: string;
}
interface cartItemType {
  productId: number;
  variantId: number;
  productName: string;
  sellingPrice: number;
  image: string;
  quantity: number;
}
const getAvailableSizes = (product: ProductsTypes, value: string) => {
  return product.variants
    .filter((variant) => {
      if (!variant.options) {
        return;
      }
      return variant.options.some(
        (o) => o.type === "color" && o.value === value,
      );
    })
    .map((variant) => {
      if (!variant.options) {
        return;
      }
      return variant.options.find((o) => o.type === "size")?.value;
    })
    .filter(Boolean);
};
const getColors = (product: ProductsTypes) => {
  return [
    ...new Set(
      product.variants
        .map((v) => {
          if (!v.options) {
            return;
          }
          return v.options.find((o) => o.type === "color")?.value;
        })
        .filter(Boolean),
    ),
  ];
};
const getVariationInfo = (
  product: ProductsTypes,
  color: string,
  size: string,
) => {
  return product?.variants.find((v) => {
    if (!v.options) {
      return;
    }
    return (
      v.options.some((o) => o.type === "color" && o.value === color) &&
      v.options.some((o) => o.type === "size" && o.value === size)
    );
  });
};
export function ProductList({ search }: ProductListProps) {
  const { addToCart } = useCartStore();
  const { products, removeProductQuantity } = useProductStore();
  // const filtered = products.filter((item) =>
  //   item.productName.toLowerCase().includes(search.toLowerCase() || ""),
  // );
  const [isOpen, setIsOpen] = useState(false);
  const [isVariationOpen, setIsVariationOpen] = useState(false);
  const [selectVariationProduct, SetSelectVariationProduct] =
    useState<ProductsTypes | null>(null);
  const handelClose = () => {
    setTimeout(() => setIsVariationOpen(false), 300);
    setIsOpen(false);
  };

  const [selectVariation, setSelectVariation] = useState<selectVariationType>({
    color: "",
    size: "",
  });

  const handleSelectProduct = (product: ProductsTypes) => {
    SetSelectVariationProduct(product);
    const colors = getColors(product);
    const firstColor = colors[0] ?? "";
    const availableSizes = getAvailableSizes(product, firstColor);
    setSelectVariation({
      color: firstColor,
      size: availableSizes[0] ?? "",
    });
  };
  return (
    <div className="h-[calc(100vh-4.25rem)]">
      <div className=" h-full overflow-scroll  no-scrollbar bg-zuccini-50">
        <div className=" grid grid-cols-4  gap-1 p-5">
          {products.map((product) => {
            const variationInfo = product.variants?.[0];

            if (!variationInfo) {
              return;
            }
            return (
              <div
                key={product.id}
                onClick={() => {
                  if (product.hasVariants) {
                    setIsOpen(false);
                    setIsVariationOpen(true);
                    setTimeout(() => setIsOpen(true), 30);
                    handleSelectProduct(product);
                    return;
                  }
                  if (variationInfo.quantity <= 0) return;
                  addToCart(product);
                  removeProductQuantity(product.id);
                }}
                className={`select-none relative h-60 bg-zuccini-300 rounded-sm flex flex-col items-center justify-between py-2 
  ${
    variationInfo.quantity <= 0
      ? "cursor-not-allowed opacity-60"
      : "cursor-pointer"
  }`}
              >
                {variationInfo.quantity <= 0 && (
                  <div className="absolute inset-0 bg-black/50 rounded-sm flex items-center justify-center text-white text-xl">
                    Stock Out
                  </div>
                )}
                <img className="h-20 rounded-sm " src={product.image} alt="" />
                <h2 className="text-center">{product.productName}</h2>
                <p className=" ">{product.category}</p>
                <h1 className=" ">TK: {variationInfo.selling_price}</h1>
                <p className=" ">Stock: {variationInfo.quantity}</p>
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
          selectVariation={selectVariation}
          setSelectVariation={setSelectVariation}
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
  selectVariation,
  setSelectVariation,
}: {
  isOpen: boolean;
  handelClose: () => void;
  selectVariationProduct: ProductsTypes | null;
  addToCart: (product: ProductsTypes) => void;
  removeProductQuantity: (id: number) => void;
  selectVariation: selectVariationType;
  setSelectVariation: React.Dispatch<SetStateAction<selectVariationType>>;
}) {
  if (!selectVariationProduct) {
    return;
  }
  const colors = getColors(selectVariationProduct);
  const sizes = [
    ...new Set(
      selectVariationProduct.variants
        .map((v) => {
          if (!v.options) {
            return;
          }
          return v.options.find((o) => o.type === "size")?.value;
        })
        .filter(Boolean),
    ),
  ];

  const variationInfo = getVariationInfo(
    selectVariationProduct,
    selectVariation.color,
    selectVariation.size,
  );

  const handleOnchange = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const { name, ariaLabel } = e.target;
    const value = ariaLabel ?? "";
    if (name === "color") {
      const availableSizes = getAvailableSizes(selectVariationProduct, value);
      setSelectVariation({
        color: value,
        size: availableSizes[0] ?? "",
      });
      return;
    }
    if (name === "size") {
      setSelectVariation((prev) => ({
        ...prev,
        size: value,
      }));
    }
  };
  if (!variationInfo) {
    return;
  }
  const {
    productName,
    id: productId,
    image: productImage,
  } = selectVariationProduct;
  const {
    id: variantId,
    selling_price: sellingPrice,
    image: variantImage,
  } = variationInfo;
  const cartItem: cartItemType = {
    productId,
    variantId,
    productName: `${productName} ${selectVariation.color} ${selectVariation.size}`,
    sellingPrice,
    image: variantImage ?? productImage,
    quantity: 1,
  };
  console.log(cartItem);
  const handleAddToCart = () => {
    if (!selectVariationProduct) return;
    if (variationInfo.quantity <= 0) return;
    addToCart(cartItem);
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
              src={variationInfo?.image ?? selectVariationProduct?.image}
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
                  {variationInfo?.selling_price} Taka
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
                {sizes.map((s, i) => {
                  if (!s) {
                    return;
                  }
                  const variant = getVariationInfo(
                    selectVariationProduct,
                    selectVariation.color,
                    s,
                  );
                  return (
                    <input
                      disabled={!variant || variant.quantity === 0}
                      onChange={handleOnchange}
                      key={i}
                      className="join-item btn"
                      type="radio"
                      name="size"
                      aria-label={s}
                      checked={selectVariation.size === s}
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
