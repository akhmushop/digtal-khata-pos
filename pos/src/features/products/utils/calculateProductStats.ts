import { ProductType } from "../product.schema";

// features/products/utils.ts
export interface ProductStats {
  totalProducts: number;
  totalVariants: number;
  inventoryValue: number;
  retailValue: number;
  potentialMargin: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export function calculateProductStats(products: ProductType[]): ProductStats {
  const initial: ProductStats = {
    totalProducts: 0,
    totalVariants: 0,
    inventoryValue: 0,
    retailValue: 0,
    potentialMargin: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  };

  const stats = products.reduce((acc, product) => {
    acc.totalProducts += 1;
    acc.totalVariants += product.variants.length;

    for (const variant of product.variants) {
      const stock = variant.quantity ?? 0;
      const cost = variant.purchaseCost ?? 0;
      const selling = variant.sellingPrice ?? 0;

      acc.inventoryValue += cost * stock;
      acc.retailValue += selling * stock;

      if (stock === 0) {
        acc.outOfStockCount += 1;
      } else if (stock <= (variant.alertQuantity ?? 5)) {
        acc.lowStockCount += 1;
      }
    }

    return acc;
  }, initial);

  stats.potentialMargin = stats.retailValue - stats.inventoryValue;
  return stats;
}
