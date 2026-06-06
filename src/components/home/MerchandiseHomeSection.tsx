import Link from "next/link"
import { ShoppingBag } from "lucide-react"

interface Merch {
  id: string
  title: string
  slug: string
  description: string
  type: string
  price: number
  stock: number
  isActive: boolean
  media: { url: string }[]
}

const TYPE_LABELS: Record<string, string> = {
  APPAREL: "Apparel",
  ACCESSORY: "Accessories",
  COLLECTIBLE: "Collectibles",
  PERIPHERAL: "Peripherals",
  OTHER: "Other",
}

function MerchHomeCard({ item }: { item: Merch }) {
  const soldOut = item.stock === 0

  return (
    <Link
      href={`/merchandise/${item.slug}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden
        border border-white/10 hover:border-cyan-500/50
        bg-white/[0.03] hover:bg-white/[0.06]
        shadow-md hover:shadow-cyan-900/20
        transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-zinc-900 shrink-0">
        {item.media?.[0]?.url ? (
          <img
            src={item.media[0].url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-cyan-900/40 to-zinc-900">
            🛍️
          </div>
        )}

        {/* Top glow on hover */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-cyan-300 border border-cyan-500/20">
            {TYPE_LABELS[item.type] ?? item.type}
          </span>
        </div>

        {/* Sold out overlay */}
        {soldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-900/80 text-red-300 text-xs font-bold px-3 py-1 rounded-lg backdrop-blur-sm">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-cyan-200 transition-colors">
          {item.title}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2 flex-1">{item.description}</p>

        <div className="flex items-center justify-between pt-2 mt-auto border-t border-white/8">
          <span className="font-bold text-white text-sm">
            ฿{item.price.toLocaleString()}
          </span>
          <span className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all duration-300
            ${soldOut
              ? "bg-white/5 text-gray-500"
              : "bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 group-hover:bg-cyan-600 group-hover:text-white"}`}>
            {soldOut ? "Sold Out" : "Shop →"}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function MerchandiseHomeSection({ items }: { items: Merch[] }) {
  if (!items.length) return null

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase">Official Store</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            🛍️ Merchandise
          </h2>
        </div>

        <Link
          href="/merchandise"
          className="text-sm font-semibold text-cyan-400
          hover:text-fuchsia-400
          hover:tracking-wide
          transition-all duration-300 shrink-0"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {items.map((item) => (
          <MerchHomeCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
