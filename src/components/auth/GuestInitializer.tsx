"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/auth.store"

/**
 * GuestInitializer — client-side companion to the server-side middleware.
 *
 * The middleware (middleware.ts) handles guest init for every SSR request,
 * so by the time this component runs the browser already has the httpOnly
 * cookies. This component exists as a safety net for edge cases where the
 * client-side JS loads without a prior SSR pass (e.g. hard navigations in
 * some SPA transitions).
 *
 * Guards applied:
 *  1. sessionStorage flag — only fires once per browser tab session so
 *     navigating between pages never triggers duplicate guest sessions.
 *  2. Auth check — skips entirely when the user is already logged in.
 */
export default function GuestInitializer() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  useEffect(() => {
    // Wait until the auth state is resolved before deciding
    if (loading) return

    // Logged-in users already have real auth cookies — no guest init needed
    if (user) return

    // Only run once per browser session — prevents a fresh guest token
    // being created on every client-side navigation
    const SESSION_KEY = "guestInitialized"
    if (sessionStorage.getItem(SESSION_KEY)) return

    sessionStorage.setItem(SESSION_KEY, "1")

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/guest/init`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {})
  }, [loading, user])

  return null
}
