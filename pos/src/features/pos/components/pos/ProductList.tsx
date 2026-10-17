import { useCartStore } from "@/features/pos/stores/useCartStore";
import useProductStore from "@/features/products/useProductStore";
import { ProductCard } from "../../../../components/common/ProductCard";
import { ShowVariants } from "../../../../components/common/ShowVariants";
import { useState } from "react";
import { SerialPickerDialog } from "./SerialPickerDialog";
import { ProductType } from "@/features/products/product.schema";

export function ProductList({ searchProducts }: { searchProducts: string }) {
  const { addToCart } = useCartStore();
  const { products } = useProductStore();
  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(searchProducts.toLowerCase() || ""),
  );
  const [activeSerialProduct, setActiveSerialProduct] =
    useState<ProductType | null>(null);
  return (
    <div className="h-[calc(100vh-4.25rem)]">
      <div className=" h-full overflow-scroll  no-scrollbar ">
        {/* product_show */}
        <div className="col-span-5">
          {/* products list  */}
          <div className="h-[calc(100vh-4.25rem)]">
            <div className=" h-full overflow-scroll  no-scrollbar ">
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
                      type="sale"
                      key={product.id}
                      product={product}
                      handleAdd={addToCart}
                      defaultVariant={defaultVariant}
                    />
                  ) : (
                    <ProductCard
                      type="sale"
                      key={product.id}
                      product={product}
                      handleAdd={addToCart}
                      defaultVariant={defaultVariant}
                      onSerialClick={(prod) => setActiveSerialProduct(prod)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 2. Render the Dialog ONLY ONCE at the bottom! */}
      {activeSerialProduct && (
        <SerialPickerDialog
          variantId={activeSerialProduct.variants.find((v) => v.isDefault)?.id}
          selected={
            useCartStore
              .getState()
              .cart.find((p) => p.id === activeSerialProduct.id)
              ?.serialNumbers ?? []
          }
          serialDialogOpen={!!activeSerialProduct} // True because product exists
          setSerialDialogOpen={(open) => {
            if (!open) setActiveSerialProduct(null);
          }} // Clear product on close
          onConfirm={(serials) => {
            const variantId = activeSerialProduct.variants.find(
              (v) => v.isDefault,
            )?.id;
            // Assuming addSerialItem is from your useCartStore
            useCartStore
              .getState()
              .addSerialItem(activeSerialProduct, variantId, serials);
            setActiveSerialProduct(null); // Close dialog after confirm
          }}
        />
      )}
    </div>
  );
}
