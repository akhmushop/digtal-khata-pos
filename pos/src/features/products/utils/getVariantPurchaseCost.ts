import type { ProductVariantType } from "@/features/products/product.schema";

export function getVariantPurchaseCost(variant: ProductVariantType): number {
  const cost = variant.purchaseCost ?? variant.purchasePrice;
  return typeof cost === "number" && Number.isFinite(cost) ? cost : 0;
}
