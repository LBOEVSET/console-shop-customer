"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { Product } from "@/types/product"
import { useCartStore } from "@/store/cart.store"
import { useState, useRef } from "react"
import Image from "next/image"
import { flyToCart } from "@/lib/flyToCart"

export default function ProductDetailPage() {
  const { id } = useParams()
  const addToCart = useCartStore(state => state.addToCart)

  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, isError } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`)
      return res.data
    },
    enabled: !!id
  })

  if (isLoading) return <div className="text-center py-20 text-white">Loading...</div>
  if (isError || !data) return <div className="text-center py-20 text-red-400">Product not found</div>

  const images = data.media
    ?.filter((m) => m.type === "IMAGE")
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const mainImage = selectedImage || images?.[0]?.url

  const handleAddToCart = async () => {
    const img = imageRef.current?.querySelector("img") as HTMLImageElement | null
    const cartElement = document.getElementById("cart-icon")

    if (img && cartElement) {
      flyToCart(img, cartElement)
    }

    await addToCart(data.id, quantity)
  }

  return (
    <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-16 text-white">

      {/* Image Section */}
      <div className="space-y-6">
        <div
          ref={imageRef}
          className="relative h-[450px] w-full 
                     bg-black border border-cyan-400/30
                     rounded-2xl overflow-hidden
                     hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]
                     transition-all duration-500"
        >
          {mainImage && (
            <Image
              src={mainImage}
              alt={data.title}
              fill
              className="object-cover"
            />
          )}
        </div>

        <div className="flex gap-3">
          {images?.map((img) => (
            <div
              key={img.id}
              className={`relative h-20 w-20 rounded-lg overflow-hidden cursor-pointer border ${
                selectedImage === img.url
                  ? "border-cyan-400"
                  : "border-transparent"
              }`}
              onClick={() => setSelectedImage(img.url)}
            >
              <Image
                src={img.url}
                alt=""
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
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

        <div className="text-4xl font-extrabold bg-gradient-to-r 
                        from-fuchsia-400 via-pink-500 to-cyan-400
                        bg-clip-text text-transparent">
          ${Number(data.price).toFixed(2)}
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
