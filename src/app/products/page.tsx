"use client"

import { Suspense, useEffect, useRef, useCallback } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import api from "@/lib/api"
import { Product } from "@/types/product"
import ProductCard from "@/components/product/ProductCard"
import { SlidersHorizontal, Loader2 } from "lucide-react"

const PAGE_LIMIT = 24

function buildQuery(params: URLSearchParams, page: number) {
  const q = new URLSearchParams()
  q.set("limit", String(PAGE_LIMIT))
  q.set("page", String(page))
  const searchWord = params.get("searchWord")
  if (searchWord) q.set("searchWord", searchWord)
  const platform = params.get("platform")
  if (platform) q.set("platform", platform)
  params.getAll("categoryIds").forEach((id) => q.append("categoryIds", id))
  const minPrice = params.get("minPrice")
  if (minPrice) q.set("minPrice", minPrice)
  const maxPrice = params.get("maxPrice")
  if (maxPrice) q.set("maxPrice", maxPrice)
  return q.toString()
}

function ProductGrid() {
  const searchParams = useSearchParams()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<Product[]>({
    queryKey: ["products", searchParams.toString()],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const qs = buildQuery(searchParams, pageParam as number)
      const res = await api.get(`/products?${qs}`)
      return res.data.data ?? res.data
    },
    getNextPageParam: (lastPage, allPages) => {
      // If the last page returned a full batch, there may be more
      if (lastPage.length === PAGE_LIMIT) return allPages.length + 1
      return undefined
    },
  })

  // IntersectionObserver — fires fetchNextPage when sentinel scrolls into view
  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(onIntersect, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [onIntersect])

  const hasActiveFilters =
    searchParams.has("platform") ||
    searchParams.has("categoryIds") ||
    searchParams.has("minPrice") ||
    searchParams.has("maxPrice") ||
    searchParams.has("searchWord")

  const searchWord = searchParams.get("searchWord")
  const products = data?.pages.flat() ?? []

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-72 bg-white/5 animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <div className="text-center py-20 text-red-400">Failed to load products.</div>
  }

  if (!products.length) {
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

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="flex justify-center py-8">
        {isFetchingNextPage && (
          <Loader2 className="animate-spin text-fuchsia-400" size={28} />
        )}
        {!hasNextPage && products.length > 0 && (
          <p className="text-gray-600 text-sm font-mono">— end of results —</p>
        )}
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 bg-white/5 animate-pulse rounded-xl" />
          ))}
        </div>
      }>
        <ProductGrid />
      </Suspense>
    </div>
  )
}
