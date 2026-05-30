"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/auth.store"
import Link from "next/link"
import { ArrowLeft, CalendarDays, MapPin, Minus, Plus } from "lucide-react"
import PaymentModal from "@/components/payment/PaymentModal"

type PaymentMethod = "CARD" | "PROMPTPAY"

export default function EventCheckoutPage() {
  const { slug } = useParams()
  const router    = useRouter()
  const { user }  = useAuthStore()

  const [quantity,       setQuantity]       = useState(1)
  const [paymentMethod,  setPaymentMethod]  = useState<PaymentMethod>("PROMPTPAY")
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState<string | null>(null)
  const [orderId,        setOrderId]        = useState<string | null>(null)
  const [qrCode,         setQrCode]         = useState<string | null>(null)
  const [showModal,      setShowModal]      = useState(false)
  const [paymentStatus,  setPaymentStatus]  = useState<"IDLE" | "WAITING" | "SUCCESS" | "FAILED">("IDLE")
  const [cardLoading,    setCardLoading]    = useState(false)

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", slug],
    queryFn: async () => {
      const res = await api.get(`/events/${slug}`)
      return res.data?.data ?? res.data
    },
    enabled: !!slug,
  })

  const isFree  = event?.price === 0
  const total   = event ? Number(event.price) * quantity : 0

  const handleCheckout = async () => {
    if (!user) { router.push(`/login?redirect=/events/${slug}/checkout`); return }

    try {
      setLoading(true)
      setError(null)

      const res = await api.post("/orders/event-checkout", {
        eventId: event.id,
        quantity,
        paymentMethod,
      })

      const data = res.data?.data ?? res.data
      setOrderId(data.orderId)
      setShowModal(true)

      if (paymentMethod === "PROMPTPAY") {
        setPaymentStatus("WAITING")
        setQrCode(data.qrCode)
      } else {
        setPaymentStatus("IDLE")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Checkout failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 space-y-4">
        <div className="h-8 w-48 bg-white/5 animate-pulse rounded-lg" />
        <div className="h-48 bg-white/5 animate-pulse rounded-2xl" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-32 text-gray-400">
        <p>Event not found.</p>
        <Link href="/events" className="mt-4 inline-block text-purple-400 text-sm underline">← Back to Events</Link>
      </div>
    )
  }

  const date = new Date(event.date)

  return (
    <main className="min-h-screen text-white">
      <div className="max-w-2xl mx-auto px-4 md:px-6 pt-10 pb-20">

        {/* Back */}
        <Link href={`/events/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition mb-8">
          <ArrowLeft size={14} /> Back to Event
        </Link>

        <h1 className="text-2xl md:text-3xl font-extrabold mb-8">Ticket Checkout</h1>

        {/* Event summary */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 mb-6 flex gap-4">
          {event.media?.[0]?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.media[0].url} alt={event.title}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center text-3xl flex-shrink-0">🎮</div>
          )}
          <div className="space-y-1.5 min-w-0">
            <p className="font-bold text-white leading-tight">{event.title}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <CalendarDays size={12} />
              {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </div>
            {event.venue && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <MapPin size={12} /> {event.venue}
              </div>
            )}
          </div>
        </div>

        {/* Quantity */}
        {!isFree && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 mb-6">
            <p className="text-sm font-semibold mb-4">Number of Tickets</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center
                  hover:bg-white/10 transition text-gray-300">
                <Minus size={14} />
              </button>
              <span className="text-xl font-bold w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(event.stock, q + 1))}
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center
                  hover:bg-white/10 transition text-gray-300">
                <Plus size={14} />
              </button>
              <span className="text-xs text-gray-500 ml-2">{event.stock} remaining</span>
            </div>
          </div>
        )}

        {/* Payment method */}
        {!isFree && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 mb-6">
            <p className="text-sm font-semibold mb-4">Payment Method</p>
            <div className="grid grid-cols-2 gap-3">
              {(["PROMPTPAY", "CARD"] as PaymentMethod[]).map(m => (
                <button key={m} type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`py-3 rounded-xl border text-sm font-medium transition
                    ${paymentMethod === m
                      ? "border-purple-500 bg-purple-500/10 text-purple-300"
                      : "border-white/15 text-gray-400 hover:border-white/30"}`}>
                  {m === "PROMPTPAY" ? "PromptPay" : "Credit Card"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Order summary */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 mb-6 space-y-3">
          <p className="text-sm font-semibold">Order Summary</p>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Ticket × {quantity}</span>
            <span>{isFree ? "Free" : `฿${(Number(event.price) * quantity).toLocaleString()}`}</span>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-purple-300">{isFree ? "Free" : `฿${total.toLocaleString()}`}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-900/20 border border-red-800/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold text-sm
            bg-gradient-to-r from-purple-600 to-fuchsia-600
            hover:from-purple-500 hover:to-fuchsia-500
            disabled:opacity-50 disabled:cursor-not-allowed
            text-white transition-all shadow-lg shadow-purple-900/30">
          {loading ? "Processing…" : isFree ? "Register Now" : `Pay ฿${total.toLocaleString()}`}
        </button>

        <p className="text-xs text-gray-600 text-center mt-3">
          Tickets are non-refundable after purchase.
        </p>
      </div>

      {showModal && (
        <PaymentModal
          open={showModal}
          method={paymentMethod}
          status={paymentStatus}
          qrCode={qrCode}
          cardLoading={cardLoading}
          onPayCard={async (card) => {
            try {
              setCardLoading(true)
              if (!(window as any).Omise) {
                setPaymentStatus("FAILED"); return
              }
              const omisePublicKey = process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY || ""
              ;(window as any).Omise.setPublicKey(omisePublicKey)
              ;(window as any).Omise.createToken("card", {
                name: card.name,
                number: card.number,
                expiration_month: card.expMonth,
                expiration_year: card.expYear,
                security_code: card.cvc,
              }, async (_statusCode: number, response: any) => {
                if (response.object === "error") {
                  setPaymentStatus("FAILED"); setCardLoading(false); return
                }
                try {
                  await api.post("/payments/card", { orderId, token: response.id })
                  setPaymentStatus("SUCCESS")
                  setTimeout(() => { setShowModal(false); router.push(`/orders/${orderId}`) }, 1500)
                } catch {
                  setPaymentStatus("FAILED")
                } finally {
                  setCardLoading(false)
                }
              })
            } catch {
              setPaymentStatus("FAILED")
              setCardLoading(false)
            }
          }}
          onClose={() => setShowModal(false)}
        />
      )}

    </main>
  )
}
