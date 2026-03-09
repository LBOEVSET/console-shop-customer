"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/auth.store"

interface Props {
  onSuccess: () => void
  onClose: () => void
}

export default function LoginModal({ onSuccess, onClose }: Props) {
  const { login } = useAuthStore()

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await login({ identifier, password })

      if (!res.success) {
        setError(res.message)
        return
      }

      onSuccess()
    } catch {
      setError("Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] animate-fadeIn">
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-6 animate-scaleIn">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-gray-500 text-sm">
            Please login to continue checkout
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            onClick={onClose}
            className="w-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 text-sm transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
