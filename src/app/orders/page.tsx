"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import Link from "next/link"
import Image from "next/image"
import { Order } from "@/types/order"

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const res = await api.get("/orders/my")
      return res.data.data as Order[]
    }
  })

  if (isLoading) {
    return <div className="py-20 text-center">Loading...</div>
  }

  if (!data || data.length === 0) {
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

      {data.map((order) => {
        const isEventTicket = !order.item?.product
        const image = isEventTicket
          ? null
          : order.item?.product?.media?.find((m) => m.type === "IMAGE")?.url || null
        const title = isEventTicket ? order.item?.title : order.item?.product?.title

        return (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg transition"
          >
            {/* Image */}
            <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
              {isEventTicket || !image ? (
                <span className="text-3xl">{isEventTicket ? "🎟️" : "🎮"}</span>
              ) : (
                <Image src={image} alt={title || ""} fill className="object-cover" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <h2 className="text-base md:text-xl font-semibold truncate">{title}</h2>
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

            {/* Total */}
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-base md:text-lg font-bold text-indigo-600">
                ฿{Number(order.total).toFixed(2)}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
