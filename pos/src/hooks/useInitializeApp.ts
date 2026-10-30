import { useEffect } from "react";
import { useCustomerStore } from "../store/useCustomerStore";
import { useSalesStore } from "../features/pos/stores/useSalesStore";
import useProductStore from "@/features/products/useProductStore";
import { usePurchasesStore } from "@/features/purchases/usePurchaseStore";
import { getActiveBusinessId, getSessionUser } from "@/api/axios";
import { useHoldCartStore } from "@/features/pos/stores/useCartStore";
import { useReceiptSettingsStore } from "@/features/pos/stores/useReceiptSettingsStore";

const LAST_SESSION_KEY = "ezpos-last-session";

/**
 * POS terminals are shared. Held carts and receipt settings are persisted in
 * localStorage with global keys, so before the app renders we check whether
 * the previous localStorage session belonged to a different user/business
 * and clear them — otherwise the next cashier can list, restore, or destroy
 * the previous cashier's held basket.
 */
function enforceSessionScope(): void {
  const user = getSessionUser();
  const businessId = getActiveBusinessId();
  const currentScope = user?.id != null ? `u${user.id}` : `b${businessId}`;
  let previousScope: string | null = null;
  try {
    previousScope = localStorage.getItem(LAST_SESSION_KEY);
    localStorage.setItem(LAST_SESSION_KEY, currentScope);
  } catch {
    return; // localStorage unavailable — nothing persisted, nothing to leak.
  }
  if (previousScope !== null && previousScope !== currentScope) {
    useHoldCartStore.getState().clearHoldCarts();
    useReceiptSettingsStore.getState().resetSettings();
  }
}

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
    enforceSessionScope();
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
