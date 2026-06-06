"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import api from "@/lib/api"
import PaymentModal from "@/components/payment/PaymentModal"
import { Check, Star, Zap, Crown, Gamepad2, X } from "lucide-react"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: string
  name: string
  slug: string
  priceUsd: number
  durationDays: number
  description: string
  color: string
  badgeIcon: string
}

type PaymentMethod = "CARD" | "PROMPTPAY"
type PaymentStatus = "IDLE" | "WAITING" | "SUCCESS" | "FAILED"

// ─── Plan features ────────────────────────────────────────────────────────────

const PLAN_FEATURES: Record<string, string[]> = {
  normal: [
    "Access to all games",
    "Standard checkout",
    "Community support",
    "Bronze → Platinum tier progression",
  ],
  vip: [
    "Everything in Normal",
    "⭐ VIP badge on profile",
    "Early access to new releases",
    "5% discount on all orders",
    "Priority support",
    "Exclusive VIP-only deals",
  ],
  prestige: [
    "Everything in VIP",
    "💎 Prestige badge on profile",
    "10% discount on all orders",
    "Dedicated support agent",
    "Access to beta features",
    "Prestige-exclusive bundles",
    "Free gift every month",
  ],
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  normal:   <Gamepad2 size={28} />,
  vip:      <Star size={28} />,
  prestige: <Crown size={28} />,
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  isCurrent,
  isSelected,
  onSelect,
}: {
  plan: Plan
  isCurrent: boolean
  isSelected: boolean
  onSelect: () => void
}) {
  const isPopular = plan.slug === "vip"
  const isFree    = plan.priceUsd === 0
  const features  = PLAN_FEATURES[plan.slug] ?? []

  return (
    <div
      className={`relative flex flex-col rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden
        ${isSelected
          ? "border-2 scale-[1.02]"
          : "border border-white/10 hover:border-white/25"}
        ${isCurrent ? "opacity-80" : ""}`}
      style={isSelected ? { borderColor: plan.color, boxShadow: `0 0 30px ${plan.color}30` } : {}}
      onClick={isFree || isCurrent ? undefined : onSelect}
    >
      {/* Popular ribbon */}
      {isPopular && (
        <div
          className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: plan.color, color: "#000" }}
        >
          MOST POPULAR
        </div>
      )}

      {/* Current badge */}
      {isCurrent && (
        <div className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white/60">
          CURRENT PLAN
        </div>
      )}

      {/* Header */}
      <div
        className="px-6 pt-8 pb-6"
        style={{ background: `linear-gradient(135deg, ${plan.color}18 0%, transparent 100%)` }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: plan.color + "22", color: plan.color }}
          >
            {PLAN_ICONS[plan.slug]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{plan.badgeIcon}</span>
              <h3 className="text-lg font-bold">{plan.name}</h3>
            </div>
            <p className="text-xs text-gray-400">{plan.description}</p>
          </div>
        </div>

        <div className="flex items-end gap-1">
          {isFree ? (
            <span className="text-3xl font-black text-white">Free</span>
          ) : (
            <>
              <span className="text-3xl font-black text-white">${plan.priceUsd}</span>
              <span className="text-sm text-gray-400 mb-1">/month</span>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="flex-1 px-6 pb-6 space-y-2.5">
        {features.map((f) => (
          <div key={f} className="flex items-start gap-2.5">
            <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
            <span className="text-sm text-gray-300">{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        {isFree || isCurrent ? (
          <div
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-center border border-white/10 text-gray-500"
          >
            {isCurrent ? "Active plan" : "Current (free)"}
          </div>
        ) : (
          <button
            onClick={onSelect}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
            style={isSelected
              ? { background: plan.color, color: "#000" }
              : { background: plan.color + "22", color: plan.color, border: `1px solid ${plan.color}44` }
            }
          >
            {isSelected ? "✓ Selected" : `Get ${plan.name}`}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

declare global { interface Window { Omise: any } }

export default function MembershipPage() {
  const { user, fetchProfile } = useAuthStore()
  const router = useRouter()

  const [plans,        setPlans]        = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [payMethod,    setPayMethod]    = useState<PaymentMethod>("PROMPTPAY")
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  // Payment modal state
  const [orderId,       setOrderId]       = useState<string | null>(null)
  const [qrCode,        setQrCode]        = useState<string | null>(null)
  const [showModal,     setShowModal]     = useState(false)
  const [payStatus,     setPayStatus]     = useState<PaymentStatus>("IDLE")
  const [cardLoading,   setCardLoading]   = useState(false)

  const omisePublicKey = process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY ?? ""

  // Current plan from profile
  const currentPlanSlug = (user as any)?.subscription?.plan?.slug ?? "normal"

  useEffect(() => {
    api.get("/subscription/plans").then(r => {
      const data: Plan[] = r.data?.data ?? r.data
      setPlans(data)
    })
  }, [])

  // ── Poll order status after checkout ────────────────────────────────────────
  useEffect(() => {
    if (!orderId || payStatus !== "WAITING") return
    const interval = setInterval(async () => {
      try {
        const r = await api.get(`/orders/${orderId}`)
        const status = r.data?.data?.status ?? r.data?.status
        if (status === "PAID") {
          await activateSubscription(orderId)
        } else if (status === "FAILED") {
          setPayStatus("FAILED")
        }
      } catch {}
    }, 3000)
    return () => clearInterval(interval)
  }, [orderId, payStatus])

  const activateSubscription = async (oid: string) => {
    try {
      await api.post("/subscription/activate", { orderId: oid })
      await fetchProfile()
      setPayStatus("SUCCESS")
      setTimeout(() => {
        setShowModal(false)
        router.push("/profile")
      }, 2000)
    } catch {
      setPayStatus("FAILED")
    }
  }

  // ── Checkout ─────────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (!user) { router.push("/login"); return }
    if (!selectedPlan) return
    setLoading(true)
    setError(null)
    try {
      const r = await api.post("/subscription/checkout", {
        planId: selectedPlan.id,
        paymentMethod: payMethod,
      })
      const oid = r.data?.data?.orderId ?? r.data?.orderId
      setOrderId(oid)

      if (payMethod === "PROMPTPAY") {
        const ppRes = await api.post("/payments/promptpay", { orderId: oid })
        const qr = ppRes.data?.data?.qrCode ?? ppRes.data?.qrCode
        setQrCode(qr)
        setPayStatus("WAITING")
      } else {
        setPayStatus("IDLE")
      }
      setShowModal(true)
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Checkout failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ── Card payment ─────────────────────────────────────────────────────────────
  const handleCardPayment = async (card: { name: string; number: string; expMonth: string; expYear: string; cvc: string }) => {
    if (!orderId) return
    setCardLoading(true)
    setError(null)
    try {
      if (!window.Omise) { setError("Payment system not loaded"); return }
      window.Omise.setPublicKey(omisePublicKey)
      window.Omise.createToken("card", {
        name:              card.name,
        number:            card.number,
        expiration_month:  card.expMonth,
        expiration_year:   card.expYear,
        security_code:     card.cvc,
      }, async (_: number, response: any) => {
        if (response.object === "error") {
          setError(response.message)
          setCardLoading(false)
          return
        }
        try {
          await api.post("/payments/card", { orderId, token: response.id })
          await activateSubscription(orderId)
        } catch (e: any) {
          setError(e.response?.data?.message ?? "Card payment failed")
          setPayStatus("FAILED")
        } finally {
          setCardLoading(false)
        }
      })
    } catch {
      setCardLoading(false)
    }
  }

  const paidPlans = plans.filter(p => p.priceUsd > 0)

  return (
    <>
      {/* Omise.js */}
      <script src="https://cdn.omise.co/omise.js" async />

      <div className="min-h-screen text-white">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-indigo-900/20 to-transparent pointer-events-none" />
          <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-12 text-center">
            <div className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 mb-6">
              <Zap size={14} /> Level Up Your Gaming
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
              ArcadeZenter Membership
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Get exclusive discounts, early access, and premium perks. Cancel anytime.
            </p>
          </div>
        </div>

        {/* ── Plan cards ────────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={plan.slug === currentPlanSlug}
                isSelected={selectedPlan?.id === plan.id}
                onSelect={() => setSelectedPlan(plan)}
              />
            ))}
          </div>
        </div>

        {/* ── Checkout panel ────────────────────────────────────────────────── */}
        {selectedPlan && (
          <div className="max-w-5xl mx-auto px-4 pb-16">
            <div
              className="rounded-2xl border p-6 space-y-5"
              style={{ borderColor: selectedPlan.color + "44", background: selectedPlan.color + "0a" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg">
                    {selectedPlan.badgeIcon} {selectedPlan.name} — ${selectedPlan.priceUsd}/month
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    You will be charged ฿{selectedPlan.priceUsd * 35} THB for {selectedPlan.durationDays} days of access.
                  </p>
                </div>
                <button onClick={() => setSelectedPlan(null)} className="text-gray-500 hover:text-white transition">
                  <X size={18} />
                </button>
              </div>

              {/* Payment method */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Method</p>
                <div className="flex gap-3">
                  {(["PROMPTPAY", "CARD"] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPayMethod(m)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition
                        ${payMethod === m
                          ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                          : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"}`}
                    >
                      {m === "PROMPTPAY" ? "📱 PromptPay" : "💳 Credit Card"}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                  {error}
                </p>
              )}

              {!user ? (
                <Link
                  href="/login"
                  className="block w-full py-3 rounded-xl text-sm font-bold text-center"
                  style={{ background: selectedPlan.color, color: "#000" }}
                >
                  Sign in to Subscribe
                </Link>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                  style={{ background: selectedPlan.color, color: "#000" }}
                >
                  {loading
                    ? <div className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                    : `Subscribe to ${selectedPlan.name} — $${selectedPlan.priceUsd}/mo`}
                </button>
              )}

              <p className="text-xs text-gray-500 text-center">
                Secure payment via Omise. You can cancel by contacting support.
              </p>
            </div>
          </div>
        )}

        {/* ── Comparison table ──────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 pb-24">
          <h2 className="text-xl font-bold text-center mb-8 text-gray-200">Full Comparison</h2>
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-4 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <span>Feature</span>
              {plans.map(p => (
                <span key={p.id} className="text-center" style={{ color: p.color }}>{p.badgeIcon} {p.name}</span>
              ))}
            </div>
            {[
              ["Access to all games",           true,  true,  true],
              ["Profile badge",                  false, "⭐ VIP", "💎 Prestige"],
              ["Order discount",                 false, "5%",  "10%"],
              ["Early access",                   false, true,  true],
              ["Priority support",               false, true,  true],
              ["Dedicated support agent",        false, false, true],
              ["Beta features",                  false, false, true],
              ["Monthly free gift",              false, false, true],
            ].map(([label, ...vals], idx) => (
              <div key={idx} className={`grid grid-cols-4 px-6 py-3.5 text-sm ${idx % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                <span className="text-gray-300">{label as string}</span>
                {vals.map((v, i) => (
                  <div key={i} className="flex justify-center items-center">
                    {v === true  ? <Check size={15} className="text-green-400" /> :
                     v === false ? <X size={13} className="text-gray-600" /> :
                     <span className="text-xs font-semibold text-gray-200">{v as string}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <PaymentModal
        open={showModal}
        method={payMethod}
        status={payStatus}
        qrCode={qrCode}
        cardLoading={cardLoading}
        onPayCard={handleCardPayment}
        onClose={() => {
          if (payStatus !== "WAITING") setShowModal(false)
        }}
      />
    </>
  )
}
