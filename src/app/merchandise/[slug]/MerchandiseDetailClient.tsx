"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import Link from "next/link"
import { ArrowLeft, ShoppingCart } from "lucide-react"

const TYPE_LABELS: Record<string, string> = {
  APPAREL:     "Apparel",
  ACCESSORY:   "Accessories",
  COLLECTIBLE: "Collectibles",
  PERIPHERAL:  "Peripherals",
  OTHER:       "Other",
}

export default function MerchandiseDetailClient() {
  const { slug } = useParams()

  const { data: item, isLoading } = useQuery({
    queryKey: ["merch", slug],
    queryFn: async () => {
      const res = await api.get(`/merchandise/${slug}`)
      return res.data?.data ?? res.data
    },
    enabled: !!slug,
  })

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 space-y-6">
        <div className="h-10 w-32 bg-white/5 animate-pulse rounded-lg" />
        <div className="grid md:grid-cols-2 gap-10">
          <div className="h-96 bg-white/5 animate-pulse rounded-2xl" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-6 bg-white/5 animate-pulse rounded" style={{ width: `${80 - i * 10}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="text-center py-32 text-gray-400">
        <p className="text-4xl mb-4">🛍️</p>
        <p>Item not found.</p>
        <Link href="/merchandise" className="mt-4 inline-block text-purple-400 hover:text-purple-300 text-sm underline">
          ← Back to Merchandise
        </Link>
      </div>
    )
  }

  const soldOut = item.stock === 0

  return (
    <main className="min-h-screen text-white">
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <Link href="/merchandise"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition">
          <ArrowLeft size={14} /> Back to Merchandise
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-12 items-start">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 h-96">
          {item.media?.[0]?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.media[0].url} alt={item.title}
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl">🛍️</div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-full
              bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
              {TYPE_LABELS[item.type] ?? item.type}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold leading-tight">{item.title}</h1>
          <p className="text-gray-400 leading-relaxed">{item.description}</p>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Price</p>
            <p className="text-3xl font-extrabold">฿{item.price.toLocaleString()}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Availability</p>
            {soldOut
              ? <p className="text-red-400 font-semibold">Out of stock</p>
              : <p className="text-green-400 font-semibold">{item.stock} in stock</p>}
          </div>

          <button disabled={soldOut}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
              ${soldOut
                ? "bg-white/5 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-900/30"}`}>
            <ShoppingCart size={16} />
            {soldOut ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </main>
  )
}
