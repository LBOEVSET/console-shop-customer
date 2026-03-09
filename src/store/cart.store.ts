import { create } from "zustand"
import api from "@/lib/api"
import { initGuest } from "@/lib/guest"

export interface CartItem {
  productId: string
  quantity: number
  product: {
    id: string
    title: string
    price: string
    slug: string
    platform: {
        name: string
    }
    media: [
      {
        type: string
        url: string
      }
    ]
  }
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  fetchCart: () => Promise<void>
  addToCart: (productId: string, quantity: number) => Promise<void>
  updateCart: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  getTotalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  fetchCart: async () => {
    const res = await api.get("/cart")
    set({ items: res.data.items })
  },

  addToCart: async (productId, quantity) => {
    try {
      await api.post("/cart/add", { productId, quantity })
    } catch (err: any) {
      throw err
    }

    const res = await api.get("/cart")
    set({ items: res.data.items })
  },

  updateCart: async (productId, quantity) => {
    await api.patch("/cart/update", { productId, quantity })
    const res = await api.get("/cart")
    set({ items: res.data.items })
  },

  removeFromCart: async (productId) => {
    await api.delete(`/cart/remove/${productId}`)
    const res = await api.get("/cart")
    set({ items: res.data.items })
  },

  clearCart: async () => {
    await api.delete("/cart/clear")
    set({ items: [] })
  },
  
  getTotalItems: () => {
    return get().items.reduce(
      (sum, item) => sum + item.quantity,
      0
    )
  },

  totalPrice: () =>
    get().items.reduce(
      (sum, item) =>
        sum +
        Number(item.product?.price ?? 0) * (item.quantity ?? 0),
      0
    ),
}))
