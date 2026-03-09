import { create } from "zustand"
import api from "@/lib/api"

interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  fetchCart: () => Promise<void>
  addToCart: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
}

export const useCartStore = create<CartState>((set) => ({
  items: [],

  fetchCart: async () => {
    const res = await api.get("/cart")
    set({ items: res.data.items })
  },

  addToCart: async (productId, quantity) => {
    await api.post("/cart", { productId, quantity })
    const res = await api.get("/cart")
    set({ items: res.data.items })
  },

  removeFromCart: async (productId) => {
    await api.delete(`/cart/${productId}`)
    const res = await api.get("/cart")
    set({ items: res.data.items })
  }
}))
