import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";
import { ProductCardProps } from "../../purchase.types";

export function ProductCard({ product, handleAddPurchase, defaultVariant }:ProductCardProps) {
  const outOfStock = defaultVariant.quantity <= 0;

  return (
    <Card
      onClick={() => {
        if (product.hasVariants) return;
        handleAddPurchase(product);
      }}
      className={`relative select-none p-3 flex flex-col items-center justify-between gap-2 transition-colors`}
    >
      {outOfStock && (
        <div className="absolute inset-0 z-10 bg-black/50 rounded-xl flex items-center justify-center text-white text-lg font-medium">
          Stock Out
        </div>
      )}

      <AspectRatio ratio={1} className="w-full">
        <img
          className="h-full w-full object-contain rounded-md"
          src={
            product.imageUrl ??
            "https://www.startech.com.bd/image/cache/catalog/ceiling-fan/qulik/windora/windora-01-500x500.webp"
          }
          alt={product.name}
        />
      </AspectRatio>

      <div className="w-full text-center space-y-1">
        <h2 className="text-sm font-medium truncate">{product.name}</h2>

        <p className="text-xs">{product.categoryId}</p>

        <p className="text-base font-semibold">
          TK: {defaultVariant.sellingPrice}
        </p>
        <p className="text-xs text-muted-foreground">
          Stock: {defaultVariant.quantity}
        </p>
      </div>
    </Card>
  );
}
