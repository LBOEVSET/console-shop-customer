"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import Link from "next/link"
import { useState } from "react"
import { ShoppingBag } from "lucide-react"
import Pagination from "@/components/ui/Pagination"

const PAGE_SIZE = 12

interface Merch {
  id: string; title: string; slug: string; description: string; type: string
  price: number; stock: number; isActive: boolean; media: { url: string }[]
}

const TYPE_LABELS: Record<string, string> = {
  APPAREL: "Apparel", ACCESSORY: "Accessories", COLLECTIBLE: "Collectibles", PERIPHERAL: "Peripherals", OTHER: "Other",
}

function MerchCard({ item }: { item: Merch }) {
  const soldOut = item.stock === 0
  return (
    <Link href={`/merchandise/${item.slug}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden border border-white/10
        bg-white/[0.03] hover:bg-white/[0.06] hover:border-purple-500/40
        transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20">
      <div className="relative h-52 overflow-hidden bg-white/5">
        {item.media?.[0]?.url
          ? <img src={item.media[0].url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">🛍️</div>}
        {soldOut && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="bg-red-900/80 text-red-300 text-xs font-bold px-3 py-1 rounded-lg backdrop-blur-sm">Sold Out</span></div>}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-black/60 text-cyan-300 border border-cyan-500/20 backdrop-blur-sm">{TYPE_LABELS[item.type] ?? item.type}</span>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-4 gap-3">
        <h3 className="font-bold text-white text-sm leading-snug group-hover:text-purple-300 transition line-clamp-2">{item.title}</h3>
        <p className="text-xs text-gray-400 line-clamp-2 flex-1">{item.description}</p>
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-white/8">
          <span className="font-bold text-white">฿{item.price.toLocaleString()}</span>
          <span className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${soldOut ? "bg-white/5 text-gray-500" : "bg-purple-600/20 text-purple-300 border border-purple-500/30 group-hover:bg-purple-600 group-hover:text-white"}`}>
            {soldOut ? "Sold Out" : "View →"}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function MerchandisePage() {
  const [activeType, setActiveType] = useState<string>("ALL")
  const [page, setPage] = useState(1)

  const { data: res, isLoading, isError } = useQuery({
    queryKey: ["merchandise", page, activeType],
    queryFn: async () => {
      const q = new URLSearchParams()
      q.set("page", String(page))
      q.set("limit", String(PAGE_SIZE))
      if (activeType !== "ALL") q.set("type", activeType)
      const r = await api.get(`/merchandise?${q}`)
      return r.data?.data ?? r.data
    },
    placeholderData: (prev: any) => prev,
  })

  const items: Merch[] = res?.data ?? []
  const totalPages: number = res?.totalPages ?? 1

  const handleTypeChange = (t: string) => { setActiveType(t); setPage(1) }
  const handlePage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }) }

  const types = ["ALL", "APPAREL", "ACCESSORY", "COLLECTIBLE", "PERIPHERAL", "OTHER"]

  return (
    <main className="min-h-screen text-white">
      <div className="relative overflow-hidden py-24 px-8 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(6,182,212,0.12),transparent)]" />
        <p className="text-xs font-bold tracking-[0.3em] text-cyan-400 uppercase mb-4">Official Store</p>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-cyan-400 via-purple-300 to-fuchsia-400 bg-clip-text text-transparent">Merchandise</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">Apparel, collectibles, peripherals — wear your passion.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex flex-wrap gap-2 mb-10">
          {types.map(t => (
            <button key={t} onClick={() => handleTypeChange(t)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${activeType === t ? "bg-purple-600/25 border-purple-500/50 text-purple-300" : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/25"}`}>
              {t === "ALL" ? "All" : (TYPE_LABELS[t] ?? t)}
            </button>
          ))}
        </div>

        {isLoading && <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-72 bg-white/5 animate-pulse rounded-2xl" />)}</div>}
        {isError && <div className="text-center py-20 text-red-400">Failed to load merchandise.</div>}

        {!isLoading && !isError && (
          <>
            {items.length === 0
              ? <div className="text-center py-20 text-gray-500 space-y-3"><ShoppingBag size={48} className="mx-auto opacity-20" /><p>No items available{activeType !== "ALL" ? " in this category" : ""}.</p></div>
              : <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{items.map(m => <MerchCard key={m.id} item={m} />)}</div>}
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePage} className="mt-10" />
          </>
        )}
      </div>
    </main>
  )
}
