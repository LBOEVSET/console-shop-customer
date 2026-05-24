"use client"

import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode, useState, useEffect } from "react"
import { useCartStore } from "@/store/cart.store"

/**
 * Fetches the cart on every app mount / hard refresh so the navbar badge
 * always reflects the real cart count — not just when the /cart page is open.
 */
function CartInitializer() {
  const fetchCart = useCartStore((state) => state.fetchCart)

  useEffect(() => {
    fetchCart().catch(() => {
      // Silently ignore — guest session may still be initialising
    })
  }, [fetchCart])

  return null
}

export default function AppProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <CartInitializer />
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  )
}
