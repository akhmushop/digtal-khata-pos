import { useCartStore } from "@/store/useCartStore";
import useProductStore from "@/features/products/useProductStore";
import { ProductCard } from "../../../../components/common/ProductCard";
import { ShowVariants } from "../../../../components/common/ShowVariants";

export function ProductList({ searchProducts }: { searchProducts: string }) {
  const { addToCart } = useCartStore();
  const { products } = useProductStore();
  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(searchProducts.toLowerCase() || ""),
  );

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
