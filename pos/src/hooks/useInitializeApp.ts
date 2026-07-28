import { useEffect } from "react";
import { useCustomerStore } from "../store/customer-store";
import { useProductStore } from "../store/product-store";
import { usePurchasesStore } from "../store/purchases-store";
import { useSoldStore } from "../store/sold-store";

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
