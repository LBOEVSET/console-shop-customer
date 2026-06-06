"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { LogIn, X } from "lucide-react"

export default function SessionExpiredBanner() {
  const params = useSearchParams()
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (params.get("session") === "expired") {
      setShow(true)
      // Clean the URL without triggering a navigation
      const url = new URL(window.location.href)
      url.searchParams.delete("session")
      window.history.replaceState({}, "", url.toString())
    }
  }, [params])

  if (!show) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3
      px-5 py-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 backdrop-blur
      text-yellow-300 text-sm font-medium shadow-lg animate-fade-in">
      <LogIn size={16} className="flex-shrink-0" />
      <span>Your session expired. Please sign in again.</span>
      <button onClick={() => setShow(false)} className="ml-2 hover:text-white transition">
        <X size={14} />
      </button>
    </div>
  )
}
