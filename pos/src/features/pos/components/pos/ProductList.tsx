import React, { SetStateAction, useState } from "react";
import { ProductsTypes } from "@/features/products/products.types";
import { useCartStore } from "@/store/useCartStore";
import { PopupModal } from "./CartItems";
import useProductStore from "@/features/products/useProductStore";
import { ProductCard } from "../../../../components/common/ProductCard";
import { ShowVariants } from "../../../../components/common/ShowVariants";
import { RiHome9Fill } from "react-icons/ri";
import { Link } from "react-router";
interface ProductListProps {
  searchProducts: string;
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
export function ProductList({ searchProducts }: ProductListProps) {
  const { addToCart } = useCartStore();
  const { products } = useProductStore();
  console.log(products);
  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(searchProducts.toLowerCase() || ""),
  );
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

  return (
    <div className="h-[calc(100vh-4.25rem)]">
      <div className=" h-full overflow-scroll  no-scrollbar bg-zuccini-50">
        {/* product_show */}
        <div className="col-span-5">
          {/* products list  */}
          <div className="h-[calc(100vh-4.25rem)]">
            <div className=" h-full overflow-scroll  no-scrollbar bg-zuccini-50">
              <div className=" grid grid-cols-3  gap-1 p-5">
                {filteredProducts.map((product) => {
                  const defaultVariant = product.variants.find(
                    (variant) => variant.isDefault,
                  );
                  if (!defaultVariant) {
                    return;
                  }
                  return product.hasVariants ? (
                    <ShowVariants
                      key={product.id}
                      product={product}
                      handleAdd={addToCart}
                      defaultVariant={defaultVariant}
                    />
                  ) : (
                    <ProductCard
                      key={product.id}
                      product={product}
                      handleAdd={addToCart}
                      defaultVariant={defaultVariant}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
