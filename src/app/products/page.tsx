"use client"

import { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import api from "@/lib/api"
import { Product } from "@/types/product"
import ProductCard from "@/components/product/ProductCard"
import { SlidersHorizontal } from "lucide-react"

function buildQuery(params: URLSearchParams) {
  const q = new URLSearchParams()
  q.set("limit", "24")
  const page = params.get("page")
  if (page && page !== "1") q.set("page", page)
  const searchWord = params.get("searchWord")
  if (searchWord) q.set("searchWord", searchWord)
  const platformId = params.get("platformId")
  if (platformId) q.set("platformId", platformId)
  params.getAll("categoryIds").forEach((id) => q.append("categoryIds", id))
  const minPrice = params.get("minPrice")
  if (minPrice) q.set("minPrice", minPrice)
  const maxPrice = params.get("maxPrice")
  if (maxPrice) q.set("maxPrice", maxPrice)
  return q.toString()
}

function ProductGrid() {
  const searchParams = useSearchParams()

  const { data: products, isLoading, isError } = useQuery<Product[]>({
    queryKey: ["products", searchParams.toString()],
    queryFn: async () => {
      const qs = buildQuery(searchParams)
      const res = await api.get(`/products?${qs}`)
      return res.data.data ?? res.data
    },
  })

  const hasActiveFilters =
    searchParams.has("platformId") ||
    searchParams.has("categoryIds") ||
    searchParams.has("minPrice") ||
    searchParams.has("maxPrice") ||
    searchParams.has("searchWord")

  const searchWord = searchParams.get("searchWord")

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-80 bg-white/5 animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <div className="text-center py-20 text-red-400">Failed to load products.</div>
  }

  if (!products?.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-gray-500">
        <SlidersHorizontal size={48} strokeWidth={1} />
        <p className="text-lg font-medium">
          {hasActiveFilters ? "No products match your filters." : "No products available."}
        </p>
        {hasActiveFilters && (
          <p className="text-sm text-gray-500">Try adjusting the filters in the header.</p>
        )}
      </div>
    )
  }

  return (
    <>
      {searchWord && (
        <p className="text-center text-sm text-gray-500">
          Results for &ldquo;<span className="text-white">{searchWord}</span>&rdquo;
        </p>
      )}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  )
}

export default function ProductsPage() {
  return (
    <div className="relative text-white pt-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          🎮 Game Library
        </h1>
        <p className="text-gray-400">Discover the latest drops &amp; legendary classics.</p>
      </div>

      <Suspense fallback={
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-80 bg-white/5 animate-pulse rounded-xl" />
          ))}
        </div>
      }>
        <ProductGrid />
      </Suspense>
    </div>
  )
}
