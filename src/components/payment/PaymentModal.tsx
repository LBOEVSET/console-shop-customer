"use client"

import { useState } from "react"

type PaymentStatus = "IDLE" | "WAITING" | "SUCCESS" | "FAILED"
type PaymentMethod = "CARD" | "PROMPTPAY"

interface Props {
  open: boolean
  method: PaymentMethod
  status: PaymentStatus
  qrCode?: string | null
  cardLoading?: boolean
  onPayCard: (card: {
    name: string
    number: string
    expMonth: string
    expYear: string
    cvc: string
  }) => void
  onClose: () => void
}

export default function PaymentModal({
  open,
  method,
  status,
  qrCode,
  cardLoading,
  onPayCard,
  onClose
}: Props) {
  if (!open) return null
  const [cardHolderName, setCardHolderName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expMonth, setExpMonth] = useState("")
  const [expYear, setExpYear] = useState("")
  const [cvc, setCvc] = useState("")

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "") // remove non-digits
    const limited = digits.slice(0, 16) // max 16 digits

    // insert space every 4 digits
    const formatted = limited.replace(/(\d{4})(?=\d)/g, "$1 ")
    return formatted
  }

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "") // remove non-digits
    const limited = digits.slice(0, 4) // MMYY

    if (limited.length <= 2) return limited

    return `${limited.slice(0, 2)}/${limited.slice(2)}`
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-6">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          ✕
        </button>

        {/* ---------------- CARD FORM ---------------- */}
        {method === "CARD" && status === "IDLE" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center">
              Enter Card Details
            </h2>

            {/* Card Holder Name */}
            <input
              placeholder="Card Holder Name"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* Card Number */}
            <input
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) =>
                setCardNumber(formatCardNumber(e.target.value))
              }
              inputMode="numeric"
              autoComplete="cc-number"
              className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex gap-4">
              {/* Expiry */}
              <input
                placeholder="MM/YY"
                value={`${expMonth}${expYear ? "/" + expYear : ""}`}
                onChange={(e) => {
                  const formatted = formatExpiry(e.target.value)
                  const digits = formatted.replace("/", "")

                  const month = digits.slice(0, 2)
                  const year = digits.slice(2, 4)

                  setExpMonth(month)
                  setExpYear(year)
                }}
                inputMode="numeric"
                autoComplete="cc-exp"
                className="w-1/2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {/* CVC */}
              <input
                placeholder="CVC"
                value={cvc}
                onChange={(e) =>
                  setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                inputMode="numeric"
                autoComplete="cc-csc"
                className="w-1/2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={() =>
                onPayCard({
                  name: cardHolderName,
                  number: cardNumber.replace(/\s/g, ""), // remove spaces before sending
                  expMonth,
                  expYear,
                  cvc
                })
              }
              disabled={cardLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {cardLoading ? "Processing..." : "Pay Now"}
            </button>
          </div>
        )}

        {/* ---------------- WAITING ---------------- */}
        {status === "WAITING" && (
          <div className="space-y-6 text-center">
            <h2 className="text-xl font-bold">
              Processing Payment
            </h2>

            {method === "PROMPTPAY" && qrCode && (
              <img
                src={qrCode}
                className="w-64 mx-auto"
              />
            )}

            <div className="animate-pulse text-gray-500 text-sm">
              Please complete your payment...
            </div>
          </div>
        )}

        {/* ---------------- SUCCESS ---------------- */}
        {status === "SUCCESS" && (
          <div className="text-center space-y-4">
            <div className="text-green-600 text-5xl animate-bounce">
              ✔
            </div>
            <h2 className="text-xl font-bold text-green-600">
              Payment Successful!
            </h2>
          </div>
        )}

        {/* ---------------- FAILED ---------------- */}
        {status === "FAILED" && (
          <div className="text-center space-y-4">
            <div className="text-red-600 text-5xl">
              ✖
            </div>
            <h2 className="text-xl font-bold text-red-600">
              Payment Failed
            </h2>
          </div>
        )}
      </div>
    </div>
  )
}
