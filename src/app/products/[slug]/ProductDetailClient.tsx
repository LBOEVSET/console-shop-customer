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

/** Extract Steam app ID from store URLs like https://store.steampowered.com/app/1551360 */
function getSteamAppId(url: string): string | null {
  const match = url.match(/store\.steampowered\.com\/app\/(\d+)/)
  return match?.[1] ?? null
}

/** True if the URL looks like a direct video file */
function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)
}

type VideoKind =
  | { kind: "youtube"; embedUrl: string }
  | { kind: "steam";   appId: string; storeUrl: string }
  | { kind: "direct";  src: string }
  | { kind: "unknown"; url: string }

function classifyVideo(url: string): VideoKind {
  const ytId = getYouTubeId(url)
  if (ytId) return { kind: "youtube", embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0` }

  const steamId = getSteamAppId(url)
  if (steamId) return { kind: "steam", appId: steamId, storeUrl: url }

  if (isDirectVideo(url)) return { kind: "direct", src: url }

  return { kind: "unknown", url }
}

// ─── media viewer ─────────────────────────────────────────────────────────────

type Selected = { type: "image"; url: string } | { type: "video"; url: string }

function MediaViewer({ selected, title, imageRef }: {
  selected: Selected
  title: string
  imageRef: React.RefObject<HTMLDivElement>
}) {
  if (selected.type === "video") {
    const video = classifyVideo(selected.url)

    if (video.kind === "youtube") {
      return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-cyan-400/30 bg-black">
          <iframe
            src={video.embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      )
    }

    if (video.kind === "steam") {
      // Steam blocks iframe embedding — show poster + open-on-Steam button
      const posterUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${video.appId}/header.jpg`
      return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-cyan-400/30 bg-black flex items-center justify-center">
          {/* blurred poster */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={posterUrl} alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm scale-105" />
          <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Play size={28} className="text-white fill-white ml-1" />
            </div>
            <p className="text-white text-sm font-medium">Watch trailer on Steam</p>
            <a
              href={video.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-lg bg-[#1b2838] hover:bg-[#2a475e] text-white text-sm font-semibold
                border border-[#4c6b8a] transition-colors flex items-center gap-2">
              {/* Steam logo */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.187.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0z"/>
              </svg>
              Open on Steam
            </a>
          </div>
        </div>
      )
    }

    if (video.kind === "direct") {
      return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-cyan-400/30 bg-black">
          <video src={video.src} controls className="absolute inset-0 w-full h-full" />
        </div>
      )
    }

    // Unknown URL — show a generic "watch" link
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-cyan-400/30 bg-black flex items-center justify-center">
        <a href={video.url} target="_blank" rel="noopener noreferrer"
          className="flex flex-col items-center gap-3 text-gray-300 hover:text-white transition">
          <Play size={40} className="opacity-60" />
          <span className="text-sm">Watch video</span>
        </a>
      </div>
    )
  }

  return (
    <div
      ref={imageRef}
      data-product-image="true"
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
  const thumbUrl = isVideo
    ? (() => {
        const ytThumb = getYouTubeThumbnail(item.url)
        if (ytThumb) return ytThumb
        const steamId = getSteamAppId(item.url)
        if (steamId) return `https://cdn.akamai.steamstatic.com/steam/apps/${steamId}/header.jpg`
        return null
      })()
    : item.url

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

  const { currency, region } = useCurrencyStore()

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

  const priceInfo = getProductPrice(data, region)
  const basePrice = Number(data.prices?.[0]?.price ?? data.price ?? 0)
  const salePriceRaw = Number(data.prices?.[0]?.salePrice ?? data.salePrice ?? 0)
  const hasFallbackDiscount = salePriceRaw > 0 && salePriceRaw < basePrice
  const displayPrice = priceInfo?.finalPrice ?? (hasFallbackDiscount ? salePriceRaw : basePrice)
  const displayOriginalPrice = priceInfo?.hasDiscount
    ? priceInfo.price
    : (hasFallbackDiscount ? basePrice : null)
  const hasDiscount = priceInfo?.hasDiscount || hasFallbackDiscount

  const handleAddToCart = async () => {
    // Prefer the main image viewer; fall back to the first product image thumbnail
    // (imageRef is null when a video is currently displayed in the main viewer)
    let img = imageRef.current?.querySelector("img") as HTMLImageElement | null
    if (!img) {
      img = document.querySelector("[data-product-image] img") as HTMLImageElement | null
    }
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
            {allMedia.map((item, idx) => (
              // Mark the first IMAGE thumbnail as the cart animation source fallback
              <div key={item.id} {...(item.type === "IMAGE" && idx === allMedia.findIndex(m => m.type === "IMAGE") ? { "data-product-image": "true" } : {})}>
                <MediaThumb
                  item={item}
                  isActive={activeSelected?.url === item.url}
                  onClick={() => setSelected(
                    item.type === "VIDEO"
                      ? { type: "video", url: item.url }
                      : { type: "image", url: item.url }
                  )}
                />
              </div>
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
            {currency === "THB" ? "฿" : "$"}{displayPrice.toFixed(2)}
          </span>
          {displayOriginalPrice && (
            <span className="text-xl text-gray-500 line-through">
              {currency === "THB" ? "฿" : "$"}{Number(displayOriginalPrice).toFixed(2)}
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
