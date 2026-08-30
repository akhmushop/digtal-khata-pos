import { useEffect } from "react";
import { useCustomerStore } from "../store/useCustomerStore";
import { usePurchasesStore } from "../store/usePurchaseStore";
import { useSoldStore } from "../store/useSalesStore";
import useProductStore from "@/features/products/useProductStore";

export function useInitializeApp() {
  const { getCustomers } = useCustomerStore();
  const { getSoldProducts } = useSoldStore();
  const { getPurchases, getPurchaseItems, getPurchasesReturnItems } =
    usePurchasesStore();
  const { getProductSelectOptions, getProductVariantOptions } =
    useProductStore();
  useEffect(() => {
    getSoldProducts();
    getCustomers();
    getPurchases();
    getPurchaseItems();
    getPurchasesReturnItems();
    getProductSelectOptions();
    getProductVariantOptions();
  }, []);
}
