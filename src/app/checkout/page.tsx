"use client"

import { useCartStore } from "@/store/cart.store"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/auth.store"
import LoginModal from "../../components/auth/LoginModal"
import PaymentModal from "../../components/payment/PaymentModal"

type PaymentMethod = "CARD" | "PROMPTPAY"

export default function CheckoutPage() {
  const { items, clearCart, fetchCart } = useCartStore()
  const { user, fetchProfile } = useAuthStore()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("PROMPTPAY")

  const [orderId, setOrderId] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [paymentStatus, setPaymentStatus] =
    useState<"IDLE" | "WAITING" | "SUCCESS" | "FAILED">("IDLE")

  const [cardLoading, setCardLoading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [pendingCheckout, setPendingCheckout] = useState(false)

  const [cardHolderName, setCardHolderName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expMonth, setExpMonth] = useState("")
  const [expYear, setExpYear] = useState("")
  const [cvc, setCvc] = useState("")
  const omisePublicKey = process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY || "";

  const totalPrice = items.reduce(
    (sum, item) =>
      sum + Number(item.product?.price ?? 0) * item.quantity,
    0
  )

  /* -------------------------------- */
  /* CREATE ORDER                     */
  /* -------------------------------- */
  const handleCheckout = async () => {
    if (!user) {
      setShowLoginModal(true)
      return
    }

    if (items.length === 0) {
      setError("Your cart is empty.")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Step 1: Create the order. Backend always returns { orderId } regardless
      // of payment method — Omise charges are handled by the payment gateway.
      const orderRes = await api.post("/orders/checkout", {
        promoCode: promoCode || undefined,
        paymentMethod
      })
      const { orderId } = orderRes.data.data
      setOrderId(orderId)

      if (paymentMethod === "PROMPTPAY") {
        // Step 2 (PromptPay): Ask payment gateway to create the Omise charge
        // and return the QR code URL.
        const ppRes = await api.post("/payments/promptpay", { orderId })
        const { qrCode } = ppRes.data.data
        setQrCode(qrCode)
        setPaymentStatus("WAITING")
      } else {
        // Step 2 (Card): Payment modal collects card details and calls
        // /payments/card with the Omise token.
        setPaymentStatus("IDLE")
      }

      setShowModal(true)

    } catch (err: any) {
      setError(err.response?.data?.message || "Checkout failed")
    } finally {
      setLoading(false)
    }
  }

  /* -------------------------------- */
  /* POLL ORDER STATUS                */
  /* -------------------------------- */
  useEffect(() => {
    if (!orderId || paymentStatus !== "WAITING") return

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/orders/${orderId}`)

        if (res.data.data.status === "PAID") {
          setPaymentStatus("SUCCESS")
          clearCart()

          setTimeout(() => {
            setShowModal(false)
            router.push(`/orders/${orderId}`)
          }, 1500)
        }

        if (res.data.data.status === "FAILED") {
          setPaymentStatus("FAILED")
        }
      } catch {}
    }, 3000)

    return () => clearInterval(interval)
  }, [orderId, paymentStatus])

  /* -------------------------------- */
  /* HANDLE CARD PAYMENT              */
  /* -------------------------------- */
  const handleCardPayment = async (card: {
    name: string
    number: string
    expMonth: string
    expYear: string
    cvc: string
  }) => {
    if (!orderId) return

    if (!card.number || !card.expMonth || !card.expYear || !card.cvc) {
      setError("Please fill all card fields")
      return
    }

    try {
      setCardLoading(true)
      setError(null)

      if (!window.Omise) {
        setError("Payment system not loaded")
        return
      }

      window.Omise.setPublicKey(omisePublicKey)

      window.Omise.createToken(
        "card",
        {
          name: card.name,
          number: card.number,
          expiration_month: card.expMonth,
          expiration_year: card.expYear,
          security_code: card.cvc
        },
        async (_statusCode: number, response: any) => {
          if (response.object === "error") {
            setPaymentStatus("FAILED")
            setError(response.message)
            setCardLoading(false)
            return
          }

          const token = response.id

          const res = await api.post("/payments/card", {
            orderId,
            token
          })

          if (res.data.data.success) {
            setPaymentStatus("SUCCESS")
            clearCart()

            setTimeout(() => {
              setShowModal(false)
              router.push(`/orders/${orderId}`)
            }, 1500)
          }

          setCardLoading(false)
        }
      )
    } catch (err: any) {
      setPaymentStatus("FAILED")
      setError(err.response?.data?.message || "Card payment failed")
      setCardLoading(false)
    }
  }

  /* -------------------------------- */
  /* LOGIN MODAL SUCCESS HANDLER      */
  /* -------------------------------- */
  // Cannot call handleCheckout() directly here — it closes over the stale
  // `user` value (null before login). Instead, set a flag and let the effect
  // below fire after the component re-renders with the updated user.
  const handleLoginSuccess = async () => {
    await fetchProfile()
    await fetchCart()
    setShowLoginModal(false)
    setPendingCheckout(true)
  }

  useEffect(() => {
    if (pendingCheckout && user) {
      setPendingCheckout(false)
      handleCheckout()
    }
  }, [pendingCheckout, user])

  return (
    <div className="max-w-2xl mx-auto space-y-6 relative">
      <h1 className="text-2xl font-bold">Checkout</h1>

      {/* CART SUMMARY */}
      <div className="space-y-4 border p-4 rounded">
        {items.map(item => (
          <div key={item.productId} className="flex justify-between">
            <p>{item.product?.title} × {item.quantity}</p>
            <p>
              ${(Number(item.product?.price ?? 0) * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}

        <hr />
        <p className="font-bold text-right">
          Total: ${totalPrice.toFixed(2)}
        </p>
      </div>

      {/* PAYMENT METHOD */}
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={paymentMethod === "CARD"}
            onChange={() => setPaymentMethod("CARD")}
          />
          Credit Card
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={paymentMethod === "PROMPTPAY"}
            onChange={() => setPaymentMethod("PROMPTPAY")}
          />
          PromptPay (QR)
        </label>
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-3 rounded w-full"
      >
        {loading ? "Processing..." : "Confirm Payment"}
      </button>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <LoginModal
          onSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* PAYMENT MODAL */}
      <PaymentModal
        open={showModal}
        method={paymentMethod}
        status={paymentStatus}
        qrCode={qrCode}
        cardLoading={cardLoading}
        onPayCard={handleCardPayment}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}
