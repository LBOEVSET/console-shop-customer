"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/auth.store"

export default function AuthInitializer() {
  const fetchProfile = useAuthStore((s) => s.fetchProfile)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return null
}
