"use client"

import Link from "next/link"
import Image from "next/image"
import { Product } from "@/types/product"
import AddToCartButton from "@/components/cart/AddToCartButton"
import { useCurrencyStore } from "@/store/currency.store"
import { getProductPrice } from "@/lib/getProductPrice"
import { useTrack } from "@/hooks/useTrack"
import { useAuthStore } from "@/store/auth.store"

export default function ProductCard({
  product,
}: {
  product: Product
}) {
  const { user } = useAuthStore()
  const { ref: trackRef, trackClick } = useTrack({
    entityType: "PRODUCT",
    entityId:   product.id,
    userId:     user?.id,
  })

  // imageRef is the same element — forward both refs
  const imageRef = trackRef as React.RefObject<HTMLDivElement>

  const { region, currency } = useCurrencyStore()
  const priceData = getProductPrice(product, region)

  const image =
    product.media?.find((m) => m.type === "IMAGE")?.url ||
    "/placeholder.png"

  // fallback if no price for region
  if (!priceData) {
    return null
  }

  const {
    hasDiscount,
    discountPercent,
    price,
    salePrice,
    finalPrice,
  } = priceData

  return (
    <div
      ref={trackRef}
      className="group flex flex-col justify-between
                 bg-black border border-cyan-400/30
                 rounded-2xl overflow-hidden
                 transition-all duration-300
                 hover:border-cyan-400
                 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
    >
      {/* Clickable Area */}
      <Link href={`/products/${product.slug ?? product.id}`} className="flex-1" onClick={trackClick}>
        
        {/* Image */}
        <div
          ref={imageRef}
          className="relative h-56 w-full overflow-hidden"
        >
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              -{discountPercent}%
            </div>
          )}

          <Image
            src={image}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition duration-500"
          />
        </div>

        {/* Info */}
        <div className="p-5 space-y-3">
          <h3 className="font-bold text-lg text-white group-hover:text-cyan-300 transition">
            {product.title}
          </h3>

          <p className="text-sm text-gray-400">
            {product.platform?.name}
          </p>

          {product.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs">
              {product.categories.map((category) => (
                <span
                  key={category.id}
                  className="px-2 py-1 bg-zinc-800 rounded-full text-gray-300"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {/* Price + Stock */}
          <div className="flex items-center justify-between pt-2">
            
            {/* Price */}
            <div className="flex flex-col">
              {hasDiscount ? (
                <>
                  <span className="text-gray-400 line-through text-sm">
                    {currency} {price.toFixed(2)}
                  </span>

                  <span className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-400 to-pink-500 bg-clip-text text-transparent">
                    {currency} {finalPrice!.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-400 to-pink-500 bg-clip-text text-transparent">
                  {currency} {finalPrice!.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock */}
            {product.stock > 0 ? (
              <span className="text-emerald-400 text-sm font-medium">
                In Stock
              </span>
            ) : (
              <span className="text-red-500 text-sm font-medium">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Button Area */}
      <div className="px-5 pb-5">
        <AddToCartButton
          productId={product.id}
          stock={product.stock}
          imageRef={imageRef}
        />
      </div>
    </div>
  )
}