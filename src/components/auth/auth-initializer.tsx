"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/auth.store"
import { useCartStore } from "@/store/cart.store"
import api from "@/lib/api"

/**
 * Bootstraps the app with a single GET /profile/me request that returns
 * both the user profile and cart in one round trip — replacing the previous
 * two separate /profile and /cart calls that fired on every page load.
 */
export default function AuthInitializer() {
  const setUser    = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)
  const setItems   = useCartStore((s) => s.setItems)

  useEffect(() => {
    api.get("/profile/me")
      .then(res => {
        const { profile, cart } = res.data.data
        setUser(profile ?? null)
        setItems(cart?.items ?? [])
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return null
}
