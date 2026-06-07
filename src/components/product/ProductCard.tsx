"use client"

import Link from "next/link"
import Image from "next/image"
import { Product } from "@/types/product"
import AddToCartButton from "@/components/cart/AddToCartButton"
import { useCurrencyStore } from "@/store/currency.store"
import { getProductPrice } from "@/lib/getProductPrice"
import { useTrack } from "@/hooks/useTrack"
import { useAuthStore } from "@/store/auth.store"

const MAX_TAGS = 3

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuthStore()
  const { ref: trackRef, trackClick } = useTrack({
    entityType: "PRODUCT",
    entityId:   product.id,
    userId:     user?.id,
  })

  const imageRef = trackRef as React.RefObject<HTMLDivElement>

  const { region, currency } = useCurrencyStore()
  const priceData = getProductPrice(product, region)

  const image =
    product.media?.find((m) => m.type === "IMAGE")?.url ||
    "/placeholder.png"

  if (!priceData) return null

  const { hasDiscount, discountPercent, price, finalPrice } = priceData
  const sym = currency === "THB" ? "฿" : "$"

  const visibleCategories = product.categories?.slice(0, MAX_TAGS) ?? []
  const extraCount = (product.categories?.length ?? 0) - MAX_TAGS

  return (
    <div
      ref={trackRef}
      className="group flex flex-col bg-black border border-white/10
                 rounded-xl overflow-hidden
                 hover:border-cyan-400/60
                 hover:shadow-[0_0_24px_rgba(34,211,238,0.25)]
                 transition-all duration-300"
    >
      {/* ── Image ── */}
      <Link
        href={`/products/${product.slug ?? product.id}`}
        onClick={trackClick}
        className="relative block h-36 sm:h-48 w-full overflow-hidden bg-zinc-900 flex-shrink-0"
      >
        {hasDiscount && (
          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white
                          text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            -{discountPercent}%
          </div>
        )}
        <Image
          src={image}
          alt={product.title}
          ref={imageRef as any}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition duration-500"
        />
      </Link>

      {/* ── Body ── */}
      <Link
        href={`/products/${product.slug ?? product.id}`}
        onClick={trackClick}
        className="flex flex-col flex-1 p-3 sm:p-4 gap-2"
      >
        {/* Title */}
        <h3 className="font-bold text-sm sm:text-base text-white leading-snug
                       line-clamp-2 group-hover:text-cyan-300 transition min-h-[2.5rem]">
          {product.title}
        </h3>

        {/* Platform */}
        {product.platform?.name && (
          <p className="text-xs text-gray-500">{product.platform.name}</p>
        )}

        {/* Category tags — max 3, overflow badge */}
        {visibleCategories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {visibleCategories.map((cat) => (
              <span
                key={cat.id}
                className="px-2 py-0.5 text-[10px] bg-zinc-800 text-gray-400 rounded-full"
              >
                {cat.name}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] bg-zinc-700 text-gray-500 rounded-full">
                +{extraCount}
              </span>
            )}
          </div>
        )}

        {/* Price row */}
        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
          <div className="flex flex-col leading-none">
            {hasDiscount && (
              <span className="text-gray-500 line-through text-xs mb-0.5">
                {sym}{price.toFixed(2)}
              </span>
            )}
            <span className="text-base sm:text-xl font-extrabold
                             bg-gradient-to-r from-fuchsia-400 to-pink-500
                             bg-clip-text text-transparent">
              {sym}{finalPrice!.toFixed(2)}
            </span>
          </div>

          {product.stock > 0 ? (
            <span className="text-[10px] font-semibold text-emerald-400
                             bg-emerald-400/10 border border-emerald-400/20
                             px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
              In Stock
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-red-400
                             bg-red-400/10 border border-red-400/20
                             px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      {/* ── Add to Cart ── */}
      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <AddToCartButton
          productId={product.id}
          stock={product.stock}
          imageRef={imageRef}
        />
      </div>
    </div>
  )
}
