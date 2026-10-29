import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReceiptSettings, PaperWidth } from "../types/receipt.types.js";

const DEFAULT_SETTINGS: ReceiptSettings = {
  shopName: "ezPos Store",
  tagline: "Point of Sale & Retail Management",
  phone: "+880 1870-707900",
  address: "House 12, Road 4, Dhanmondi, Dhaka",
  logoUrl: null,
  paperWidth: "80mm",
  autoPrintOnSale: false,
  showCustomerInfo: true,
  headerMessage: "CASH RECEIPT / TAX INVOICE",
  footerMessage: "Thank you for shopping with us!",
  returnPolicy: "Exchange within 7 days with valid receipt. Items must be unworn and in original packaging.",
  cashierName: "Cashier",
};

interface ReceiptSettingsStore {
  settings: ReceiptSettings;
  updateSettings: (partial: Partial<ReceiptSettings>) => void;
  setPaperWidth: (width: PaperWidth) => void;
  resetSettings: () => void;
}

export const useReceiptSettingsStore = create<ReceiptSettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),
      setPaperWidth: (paperWidth) =>
        set((state) => ({
          settings: { ...state.settings, paperWidth },
        })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: "ezpos-receipt-settings",
    },
  ),
);

