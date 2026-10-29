import { useEffect } from "react";
import { useCustomerStore } from "../store/useCustomerStore";
import { useSalesStore } from "../features/pos/stores/useSalesStore";
import useProductStore from "@/features/products/useProductStore";
import { usePurchasesStore } from "@/features/purchases/usePurchaseStore";

// `enabled` gates the startup data fetches on the session bootstrap: firing
// them without a restored token produces doomed 401s and redirect cascades.
export function useInitializeApp(enabled: boolean) {
  const { getCustomers } = useCustomerStore();
  const { getSales } = useSalesStore();
  const { getPurchases, getPurchaseItems, getPurchasesReturnItems } =
    usePurchasesStore();
  const { getProductSelectOptions, getProductVariantOptions, getProducts } =
    useProductStore();
  useEffect(() => {
    if (!enabled) return;
    getProducts();
    getSales();
    getCustomers();
    getPurchases();
    getPurchaseItems();
    getPurchasesReturnItems();
    getProductSelectOptions();
    getProductVariantOptions();
  }, [enabled]);
}
