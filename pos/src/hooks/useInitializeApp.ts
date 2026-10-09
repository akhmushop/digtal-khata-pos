import { useEffect } from "react";
import { useCustomerStore } from "../store/useCustomerStore";
import { useSalesStore } from "../features/pos/stores/useSalesStore";
import useProductStore from "@/features/products/useProductStore";
import { usePurchasesStore } from "@/features/purchases/usePurchaseStore";

export function useInitializeApp() {
  const { getCustomers } = useCustomerStore();
  const { getSales } = useSalesStore();
  const { getPurchases, getPurchaseItems, getPurchasesReturnItems } =
    usePurchasesStore();
  const { getProductSelectOptions, getProductVariantOptions, getProducts } =
    useProductStore();
  useEffect(() => {
    getProducts();
    getSales();
    getCustomers();
    getPurchases();
    getPurchaseItems();
    getPurchasesReturnItems();
    getProductSelectOptions();
    getProductVariantOptions();
  }, []);
}
