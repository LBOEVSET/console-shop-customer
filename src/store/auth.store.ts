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
  verifyOtp: (code: string) => Promise<any> 
  resendOtp: () => Promise<any> 
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
  },

  verifyOtp: async (code: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify/otp`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })

    const data = await res.json()

    return {
      success: res.ok,
      message: data.message,
    }
  },

  resendOtp: async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/send/otp`, {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();

    return {
      success: res.ok,
      message: data.message,
    };
  },
}))
