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
      return res.data as Order[]
    }
  })

  if (isLoading) {
    return <div className="py-20 text-center">Loading...</div>
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">No orders yet</h1>
        <p className="text-gray-500 mt-2">
          Your purchases will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-8">
      <h1 className="text-3xl font-bold">My Orders</h1>

      {data.map((order) => {
        const image =
          order.item.product.media?.find(
            (m) => m.type === "IMAGE"
          )?.url || "/placeholder.png"

        return (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="flex items-center gap-6 p-6 rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg transition"
          >
            {/* Image */}
            <div className="relative w-28 h-28 rounded-xl overflow-hidden shrink-0">
              <Image
                src={image}
                alt={order.item.product.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-semibold">
                {order.item.product.title}
              </h2>

              <p className="text-sm text-gray-500">
                Order ID: {order.id}
              </p>

              <span
                className={`inline-block px-3 py-1 text-xs rounded-full font-semibold
                  ${
                    order.status === "PAID"
                      ? "bg-green-500/20 text-green-400"
                      : order.status === "FAILED"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }
                `}
              >
                {order.status}
              </span>
            </div>

            {/* Total */}
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-lg font-bold text-indigo-600">
                ${Number(order.total).toFixed(2)}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
