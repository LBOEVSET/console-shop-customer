"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { Product, ProductMedia } from "@/types/product"
import { useCartStore } from "@/store/cart.store"
import { useState, useRef } from "react"
import Image from "next/image"
import { flyToCart } from "@/lib/flyToCart"
import { useCurrencyStore } from "@/store/currency.store"
import { getProductPrice } from "@/lib/getProductPrice"
import { Play } from "lucide-react"

// ─── helpers ──────────────────────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match?.[1] ?? null
}

function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

function getYouTubeEmbed(url: string): string | null {
  const id = getYouTubeId(url)
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null
}

// ─── media viewer ─────────────────────────────────────────────────────────────

type Selected = { type: "image"; url: string } | { type: "video"; url: string }

function MediaViewer({ selected, title, imageRef }: {
  selected: Selected
  title: string
  imageRef: React.RefObject<HTMLDivElement>
}) {
  if (selected.type === "video") {
    const embedUrl = getYouTubeEmbed(selected.url)
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-cyan-400/30 bg-black">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <video src={selected.url} controls className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>
    )
  }

  return (
    <div
      ref={imageRef}
      className="relative h-[450px] w-full bg-black border border-cyan-400/30 rounded-2xl overflow-hidden
                 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-all duration-500"
    >
      <Image src={selected.url} alt={title} fill className="object-cover" />
    </div>
  )
}

// ─── thumbnail strip ──────────────────────────────────────────────────────────

function MediaThumb({ item, isActive, onClick }: {
  item: ProductMedia
  isActive: boolean
  onClick: () => void
}) {
  const isVideo = item.type === "VIDEO"
  const thumbUrl = isVideo ? (getYouTubeThumbnail(item.url) ?? null) : item.url

  return (
    <div
      onClick={onClick}
      className={`relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all
        ${isActive ? "border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.5)]" : "border-transparent hover:border-white/30"}`}
    >
      {thumbUrl ? (
        <Image src={thumbUrl} alt="" fill className="object-cover" />
      ) : (
        <div className="w-full h-full bg-white/10 flex items-center justify-center">
          <Play size={20} className="text-white/60" />
        </div>
      )}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play size={14} className="text-white fill-white ml-0.5" />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function ProductDetailClient() {
  const { slug } = useParams()
  const addToCart = useCartStore(state => state.addToCart)

  const [quantity, setQuantity] = useState(1)
  const [selected, setSelected] = useState<Selected | null>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  const { currency } = useCurrencyStore()

  const { data, isLoading, isError } = useQuery<Product>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await api.get(`/products/${slug}`)
      return res.data.data
    },
    enabled: !!slug
  })

  if (isLoading) return <div className="text-center py-20 text-white">Loading...</div>
  if (isError || !data) return <div className="text-center py-20 text-red-400">Product not found</div>

  // Sort all media by sortOrder
  const allMedia = [...(data.media ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
  const videos = allMedia.filter(m => m.type === "VIDEO")
  const images = allMedia.filter(m => m.type === "IMAGE")

  // Default: first video if exists, else first image
  const defaultSelected: Selected | null =
    videos[0] ? { type: "video", url: videos[0].url } :
    images[0] ? { type: "image", url: images[0].url } :
    null

  const activeSelected = selected ?? defaultSelected

  const priceInfo = getProductPrice(data, currency)
  const basePrice = Number(data.prices?.[0]?.price ?? data.price ?? 0)
  const salePriceRaw = Number(data.prices?.[0]?.salePrice ?? data.salePrice ?? 0)
  const hasFallbackDiscount = salePriceRaw > 0 && salePriceRaw < basePrice
  const displayPrice = priceInfo?.finalPrice ?? (hasFallbackDiscount ? salePriceRaw : basePrice)
  const displayOriginalPrice = priceInfo?.hasDiscount
    ? priceInfo.price
    : (hasFallbackDiscount ? basePrice : null)
  const hasDiscount = priceInfo?.hasDiscount || hasFallbackDiscount

  const handleAddToCart = async () => {
    const img = imageRef.current?.querySelector("img") as HTMLImageElement | null
    const cartElement = document.getElementById("cart-icon")
    if (img && cartElement) flyToCart(img, cartElement)
    await addToCart(data.id, quantity)
  }

  return (
    <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-16 text-white">

      {/* Media Section */}
      <div className="space-y-4">
        {/* Main viewer */}
        {activeSelected ? (
          <MediaViewer
            selected={activeSelected}
            title={data.title}
            imageRef={imageRef as React.RefObject<HTMLDivElement>}
          />
        ) : (
          <div className="relative h-[450px] w-full bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
            <span className="text-6xl">🎮</span>
          </div>
        )}

        {/* Thumbnail strip — only show if more than 1 media item */}
        {allMedia.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {allMedia.map(item => (
              <MediaThumb
                key={item.id}
                item={item}
                isActive={activeSelected?.url === item.url}
                onClick={() => setSelected(
                  item.type === "VIDEO"
                    ? { type: "video", url: item.url }
                    : { type: "image", url: item.url }
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="space-y-8">

        <h1 className="text-5xl font-extrabold 
                       bg-gradient-to-r from-fuchsia-400 to-cyan-400
                       bg-clip-text text-transparent">
          {data.title}
        </h1>

        <div className="flex flex-wrap gap-3">
          <span className="px-4 py-2 bg-zinc-900 border border-cyan-400/30 rounded-full">
            {data.platform.name}
          </span>

          {data.categories.map(category => (
            <span
              key={category.id}
              className="px-4 py-2 bg-zinc-900 border border-fuchsia-400/30 rounded-full"
            >
              {category.name}
            </span>
          ))}
        </div>

        <p className="text-gray-400 leading-relaxed">
          {data.description}
        </p>

        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-extrabold bg-gradient-to-r
                          from-fuchsia-400 via-pink-500 to-cyan-400
                          bg-clip-text text-transparent">
            ${displayPrice.toFixed(2)}
          </span>
          {displayOriginalPrice && (
            <span className="text-xl text-gray-500 line-through">
              ${Number(displayOriginalPrice).toFixed(2)}
            </span>
          )}
          {hasDiscount && priceInfo?.discountPercent && (
            <span className="text-sm font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
              -{priceInfo.discountPercent}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <input
            type="number"
            min={1}
            max={data.stock}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-24 bg-zinc-900 border border-cyan-400/30 rounded-lg p-2 text-white"
          />
        </div>

        <button
          onClick={handleAddToCart}
          disabled={data.stock === 0}
          className="w-full py-4 text-lg font-bold
                     rounded-xl
                     bg-gradient-to-r from-fuchsia-500 to-purple-600
                     hover:scale-105
                     hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]
                     transition-all duration-300
                     disabled:opacity-50"
        >
          🛒 Add to Cart
        </button>

      </div>
    </div>
  )
}
