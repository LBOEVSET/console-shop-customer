import { create } from "zustand"
import api from "@/lib/api"
import { useCartStore } from "@/store/cart.store"

interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  phone?: string
  profileImage?: string
  backgroundImage?: string
  status: number
}

interface AuthState {
  user: User | null
  loading: boolean
  fetchProfile: () => Promise<void>
  register: (data: any) => Promise<{ success: boolean; message: string }>
  login: (data: any) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
}


export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  fetchProfile: async () => {
    try {
      const res = await api.get("/profile")
      set({ user: res.data, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },

  login: async (data) => {
    try {
      await api.post("/auth/login", data)

      const profile = await api.get("/profile")

      set({ user: profile.data })
      await useCartStore.getState().fetchCart()

      return {
        success: true,
        message: "Login successful"
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed"
      }
    }
  },

  register: async (data) => {
    try {
      await api.post("/auth/register", data)

      // small delay to ensure cookies applied
      await new Promise(resolve => setTimeout(resolve, 100))

      const profile = await api.get("/profile")

      set({ user: profile.data })

      return {
        success: true,
        message: "Account created successfully"
      }

    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Register failed"
      }
    }
  },

  logout: async () => {
    await api.post("/auth/logout")
    set({ user: null })
  }
}))
