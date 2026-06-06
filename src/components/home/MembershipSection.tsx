import Link from "next/link"
import { Check, Zap } from "lucide-react"

const PLANS = [
  {
    name: "Normal",
    slug: "normal",
    price: 0,
    color: "#64748b",
    icon: "🎮",
    highlight: false,
    perks: ["All games", "Standard checkout", "Community support"],
  },
  {
    name: "VIP",
    slug: "vip",
    price: 10,
    color: "#eab308",
    icon: "⭐",
    highlight: true,
    perks: ["5% discount on all orders", "Early access to new releases", "Priority support", "Exclusive deals"],
  },
  {
    name: "Prestige",
    slug: "prestige",
    price: 20,
    color: "#a855f7",
    icon: "💎",
    highlight: false,
    perks: ["10% discount on all orders", "Dedicated support agent", "Beta features", "Monthly free gift"],
  },
]

export default function MembershipSection() {
  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-8 py-20">

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px]
          bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative text-center mb-12">
        <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full
          bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 mb-4">
          <Zap size={11} /> MEMBERSHIP PLANS
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
          Level Up Your Experience
        </h2>
        <p className="text-gray-400 max-w-md mx-auto text-sm">
          Join VIP or Prestige and unlock exclusive discounts, early access, and premium perks.
        </p>
      </div>

      {/* Cards */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {PLANS.map((plan) => (
          <div
            key={plan.slug}
            className={`relative rounded-2xl border p-6 flex flex-col transition-all duration-200
              ${plan.highlight
                ? "border-yellow-500/40 bg-yellow-500/5 shadow-xl shadow-yellow-500/5"
                : "border-white/8 bg-white/[0.03] hover:border-white/15"}`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold
                px-3 py-1 rounded-full bg-yellow-500 text-black tracking-wide">
                MOST POPULAR
              </div>
            )}

            {/* Title */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{plan.icon}</span>
              <div>
                <h3 className="font-bold text-white">{plan.name}</h3>
                <p className="text-xs" style={{ color: plan.color }}>
                  {plan.price === 0 ? "Free forever" : `$${plan.price} / month`}
                </p>
              </div>
              {plan.price > 0 && (
                <span
                  className="ml-auto text-2xl font-black"
                  style={{ color: plan.color }}
                >
                  ${plan.price}
                </span>
              )}
            </div>

            {/* Perks */}
            <ul className="space-y-2 flex-1 mb-5">
              {plan.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2 text-sm text-gray-300">
                  <Check size={13} style={{ color: plan.color, flexShrink: 0 }} />
                  {perk}
                </li>
              ))}
            </ul>

            {/* CTA */}
            {plan.price === 0 ? (
              <div className="text-xs text-center text-gray-600 py-2.5 border border-white/5 rounded-xl">
                Default plan
              </div>
            ) : (
              <Link
                href={`/membership?plan=${plan.slug}`}
                className="block text-center py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105"
                style={{ background: plan.color + "22", color: plan.color, border: `1px solid ${plan.color}44` }}
              >
                Get {plan.name} →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="text-center">
        <Link
          href="/membership"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full
            bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold
            hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25"
        >
          <Zap size={15} /> Compare all plans
        </Link>
      </div>
    </section>
  )
}
