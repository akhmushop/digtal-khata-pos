import type { ProductType } from "../product.schema";

export type ProductStockState = "in-stock" | "low-stock" | "out-of-stock";

export function getProductStockState(
  product: ProductType,
): ProductStockState {
  const variants = product.variants ?? [];
  if (variants.length === 0 || variants.every((variant) => variant.quantity <= 0)) {
    return "out-of-stock";
  }

  if (
    variants.some(
      (variant) =>
        variant.quantity > 0 &&
        variant.quantity <= (variant.alertQuantity ?? 5),
    )
  ) {
    return "low-stock";
  }

  return "in-stock";
}
