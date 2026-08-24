import { useEffect } from "react";
import { useCustomerStore } from "../store/useCustomerStore";
import { usePurchasesStore } from "../store/usePurchaseStore";
import { useSoldStore } from "../store/useSalesStore";
import { useProductStore } from "@/features/products/usedashboardProductStore";

export function useInitializeApp() {
  const { getCustomers } = useCustomerStore();
  const { getProducts } = useProductStore();
  const { getSoldProducts } = useSoldStore();
  const { getPurchases, getPurchaseItems, getPurchasesReturnItems } =
    usePurchasesStore();
  useEffect(() => {
    getProducts();
    getSoldProducts();
    getCustomers();
    getPurchases();
    getPurchaseItems();
    getPurchasesReturnItems();
  }, []);
}
