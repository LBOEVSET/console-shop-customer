import { create } from "zustand"

interface CurrencyState {
  region: string
  currency: string
  setCurrency: (region: string, currency: string) => void
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  region: "US",
  currency: "USD",
  setCurrency: (region, currency) => set({ region, currency }),
}))
