"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/auth.store"
import { useRouter } from "next/navigation"

export default function VerifyOtpPage() {
  const verifyOtp = useAuthStore((s) => s.verifyOtp)
  const resendOtp = useAuthStore((s) => s.resendOtp)
  const router = useRouter()

  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [popup, setPopup] = useState<string | null>(null)

  const [cooldown, setCooldown] = useState(60)

  // countdown timer
  useEffect(() => {
    if (cooldown === 0) return

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldown])

  const handleVerify = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await verifyOtp(code)

      if (!res.success) {
        setError(res.message)
        return
      }

      setPopup("OTP verified! Logging you in...")

      setTimeout(() => {
        router.refresh()
        router.replace("/")
      }, 1500)

    } catch {
      setError("Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      const res = await resendOtp()

      if (!res.success) {
        setError(res.message)
        return
      }

      setPopup("OTP sent again")
      setCooldown(60)

    } catch {
      setError("Failed to resend OTP")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-zinc-900 p-10 rounded-2xl space-y-6 w-[400px]">

        <h1 className="text-2xl font-bold text-white text-center">
          Verify OTP
        </h1>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter OTP"
          className="w-full p-3 rounded-lg bg-zinc-800 text-white"
        />

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 rounded-lg text-white"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        {/* Resend OTP */}
        <div className="text-center text-sm text-gray-400">
          {cooldown > 0 ? (
            <span>Resend OTP in {cooldown}s</span>
          ) : (
            <button
              onClick={handleResend}
              className="text-indigo-400 hover:text-indigo-300"
            >
              Resend OTP
            </button>
          )}
        </div>

      </div>

      {popup && (
        <div className="fixed top-6 right-6 px-6 py-3 bg-green-600 text-white rounded-xl shadow-lg">
          {popup}
        </div>
      )}
    </div>
  )
}
