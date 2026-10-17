import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";
import { SerialPickerDialog } from "@/features/pos/components/pos/SerialPickerDialog";
import { useCartStore } from "@/features/pos/stores/useCartStore";
import {
  ProductType,
  ProductVariantType,
} from "@/features/products/product.schema";
import { toast } from "../ui/toast";
export interface ProductCardProps {
  product: ProductType;
  handleAdd: (product: ProductType) => void;
  defaultVariant: ProductVariantType;
  type: "purchase" | "sale";
  onSerialClick?: (prod: ProductType) => void;
}
export function ProductCard({
  product,
  handleAdd,
  defaultVariant,
  type,
  onSerialClick,
}: ProductCardProps) {
  const totalQuantity = product.variants.reduce(
    (total, variant) => total + variant.quantity,
    0,
  );
  const outOfStock = totalQuantity <= 0;
  const isSerial = product.trackingType === "serial";
  const sellingPriceList = product.variants.map((v) => v.sellingPrice);

  return (
    <Card
      onClick={() => {
        if (product.hasVariants) return;
        if (type === "sale" && outOfStock) return;
        if (type === "sale" && isSerial) {
          if (!onSerialClick) {
            return;
          }
          onSerialClick(product);
          return;
        }
        handleAdd(product);
      }}
      className={`relative h-full select-none p-3 flex flex-col items-center justify-between gap-2 transition-colors`}
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
          TK:{" "}
          {product.hasVariants
            ? `${Math.min(...sellingPriceList)} - ${Math.max(...sellingPriceList)}`
            : product.variants[0]?.sellingPrice}
        </p>
        <p className="text-xs text-muted-foreground">Stock: {totalQuantity}</p>
      </div>
    </Card>
  );
}
