"use client"

import Link from "next/link"
import Image from "next/image"
import { Product } from "@/types/product"
import AddToCartButton from "@/components/cart/AddToCartButton"
import { useRef } from "react"

export default function ProductCard({
  product,
}: {
  product: Product
}) {
  const imageRef = useRef<HTMLDivElement>(null)

  const image =
    product.media?.find((m) => m.type === "IMAGE")?.url ||
    "/placeholder.png"

  return (
    <div
      className="group flex flex-col justify-between
                 bg-black border border-cyan-400/30 
                 rounded-2xl overflow-hidden
                 transition-all duration-300
                 hover:border-cyan-400
                 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
    >
      {/* Clickable Area */}
      <Link href={`/products/${product.id}`} className="flex-1">
        {/* Image */}
        <div
          ref={imageRef}   // ✅ ATTACHED HERE
          className="relative h-56 w-full overflow-hidden"
        >
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
            <span
              className="text-2xl font-extrabold bg-gradient-to-r 
                         from-fuchsia-400 to-pink-500
                         bg-clip-text text-transparent"
            >
              ${Number(product.price).toFixed(2)}
            </span>

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
          imageRef={imageRef}   // ✅ PASS REF
        />
      </div>
    </div>
  )
}
