"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { Product } from "@/types/product"
import ProductCard from "@/components/product/ProductCard"

export default function ProductsPage() {
  const { data, isLoading, isError } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products")
      return res.data
    }
  })

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load products.
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        No products available.
      </div>
    )
  }

  return (
    <div className="relative text-white pt-16 space-y-12">

      {/* Page Title */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r 
                      from-fuchsia-400 via-purple-400 to-cyan-400
                      bg-clip-text text-transparent">
          🎮 Game Library
        </h1>

        <p className="text-gray-400">
          Discover the latest drops & legendary classics.
        </p>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {data.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </div>
  )
}
