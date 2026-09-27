import { useEffect } from "react";
import { useCustomerStore } from "../store/useCustomerStore";
import { useSoldStore } from "../store/useSalesStore";
import useProductStore from "@/features/products/useProductStore";
import { usePurchasesStore } from "@/features/purchases/usePurchaseStore";

export function useInitializeApp() {
  const { getCustomers } = useCustomerStore();
  const { getSoldProducts } = useSoldStore();
  const { getPurchases, getPurchaseItems, getPurchasesReturnItems } =
    usePurchasesStore();
  const { getProductSelectOptions, getProductVariantOptions, getProducts } =
    useProductStore();
  useEffect(() => {
    getProducts();
    getSoldProducts();
    getCustomers();
    getPurchases();
    getPurchaseItems();
    getPurchasesReturnItems();
    getProductSelectOptions();
    getProductVariantOptions();
  }, []);
}
