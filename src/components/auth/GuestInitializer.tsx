"use client"

import { useEffect } from "react"

export default function GuestInitializer() {
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/guest/init`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {})
  }, [])

  return null
}
