"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import api from "@/lib/api"
import { useCurrencyStore } from "@/store/currency.store"

export default function OrderDetailPage() {
  const { id } = useParams()
  const { currency } = useCurrencyStore()

  // Orders are stored in USD; convert to THB for display when needed
  const fmt = (usdAmount: number) => {
    if (currency === "THB") return `฿${(usdAmount * 35).toFixed(2)}`
    return `$${usdAmount.toFixed(2)}`
  }

  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })

  if (isLoading) {
    return <div className="py-20 text-center">Loading...</div>
  }

  if (!data) return null

  const items: any[] = data.items ?? []

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-10">

      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Order Detail</h1>
        <p className="text-gray-500 text-sm">Order ID: {data.id}</p>
        <span className="inline-block mt-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
          {data.status}
        </span>
      </div>

      {/* ITEM CARDS */}
      <div className="space-y-4">
        {items.map((item: any) => {
          const isEventTicket = !item.product
          const image = isEventTicket
            ? null
            : item.product?.media?.[0]?.url || null
          const itemTitle = isEventTicket ? item.title : item.product?.title

          return (
            <div
              key={item.id}
              className="flex items-center gap-6 p-6 border rounded-2xl bg-white dark:bg-zinc-900 shadow-sm"
            >
              {/* Image */}
              <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                {isEventTicket || !image ? (
                  <span className="text-4xl">{isEventTicket ? "🎟️" : "🎮"}</span>
                ) : (
                  <Image src={image} alt={itemTitle || ""} fill className="object-cover" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-semibold">{itemTitle}</h2>
                {isEventTicket && (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-xs font-medium">
                    Event Ticket
                  </span>
                )}
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                <p className="text-sm text-gray-500">
                  Price per item: {fmt(Number(item.price))}
                </p>
              </div>

              {/* Subtotal */}
              <div className="text-right">
                <p className="text-lg font-bold">
                  {fmt(Number(item.price) * item.quantity)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* SUMMARY */}
      <div className="border rounded-2xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
        <h2 className="text-xl font-bold">Order Summary</h2>

        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{fmt(Number(data.subtotal))}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Discount</span>
          <span>{fmt(Number(data.discount))}</span>
        </div>

        <div className="border-t pt-4 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{fmt(Number(data.total))}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <span>Payment Method</span>
          <span>{data.paymentMethod}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <span>Payment Status</span>
          <span>{data.payment?.status}</span>
        </div>
      </div>
    </div>
  )
}
