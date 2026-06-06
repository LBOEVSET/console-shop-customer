"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Order } from "@/types/order"
import Pagination from "@/components/ui/Pagination"
import { useAuthStore } from "@/store/auth.store"
import { useCurrencyStore } from "@/store/currency.store"
import { useRouter } from "next/navigation"

const PAGE_SIZE = 10

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const { user, loading: authLoading } = useAuthStore()
  const { currency } = useCurrencyStore()
  const router = useRouter()

  // Orders are stored in USD; convert to THB for display when needed
  const fmt = (usdAmount: number) => {
    if (currency === "THB") return `฿${(usdAmount * 35).toFixed(2)}`
    return `$${usdAmount.toFixed(2)}`
  }

  const { data: res, isLoading, isError } = useQuery({
    queryKey: ["my-orders", page],
    queryFn: async () => {
      const q = new URLSearchParams()
      q.set("page", String(page))
      q.set("limit", String(PAGE_SIZE))
      const r = await api.get(`/orders/my?${q}`)
      return r.data.data ?? r.data
    },
    enabled: !!user,
    placeholderData: (prev: any) => prev,
  })

  // Still resolving auth state
  if (authLoading) {
    return <div className="py-20 text-center text-gray-400">Loading...</div>
  }

  // Not logged in
  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold">Sign in to view your orders</h1>
        <p className="text-gray-500">Your purchase history will appear here once you log in.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Go to Home
        </button>
      </div>
    )
  }

  if (isLoading) {
    return <div className="py-20 text-center text-gray-400">Loading...</div>
  }

  if (isError) {
    return (
      <div className="py-20 text-center space-y-2">
        <h1 className="text-2xl font-bold text-red-500">Failed to load orders</h1>
        <p className="text-gray-500">Please try refreshing the page.</p>
      </div>
    )
  }

  const orders: Order[] = res?.data ?? []
  const totalPages: number = res?.totalPages ?? 1

  if (!orders.length && page === 1) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">No orders yet</h1>
        <p className="text-gray-500 mt-2">Your purchases will appear here.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-8">
      <h1 className="text-3xl font-bold">My Orders</h1>

      {orders.map((order) => {
        const firstItem = order.items?.[0] ?? order.item
        const isEventTicket = !firstItem?.product
        const image = isEventTicket
          ? null
          : firstItem?.product?.media?.find((m) => m.type === "IMAGE")?.url || null
        const title = isEventTicket ? firstItem?.title : firstItem?.product?.title
        const itemCount = order.items?.length ?? 1

        return (
          <Link key={order.id} href={`/orders/${order.id}`}
            className="flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg transition">
            <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
              {isEventTicket || !image
                ? <span className="text-3xl">{isEventTicket ? "🎟️" : "🎮"}</span>
                : <Image src={image} alt={title || ""} fill className="object-cover" />}
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <h2 className="text-base md:text-xl font-semibold truncate">
                {title}
                {itemCount > 1 && (
                  <span className="ml-2 text-sm font-normal text-gray-400">+{itemCount - 1} more</span>
                )}
              </h2>
              {isEventTicket && (
                <span className="inline-block px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-xs font-medium">
                  Event Ticket
                </span>
              )}
              <p className="text-xs md:text-sm text-gray-500 truncate">ID: {order.id}</p>
              <span className={`inline-block px-3 py-1 text-xs rounded-full font-semibold
                ${order.status === "PAID" ? "bg-green-500/20 text-green-400"
                  : order.status === "FAILED" ? "bg-red-500/20 text-red-400"
                  : "bg-yellow-500/20 text-yellow-400"}`}>
                {order.status}
              </span>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-base md:text-lg font-bold text-indigo-600">{fmt(Number(order.total))}</p>
            </div>
          </Link>
        )
      })}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
