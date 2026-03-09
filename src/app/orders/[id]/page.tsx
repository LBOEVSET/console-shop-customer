"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import api from "@/lib/api"

export default function OrderDetailPage() {
  const { id } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`)
      return res.data
    },
    enabled: !!id,
  })

  if (isLoading) {
    return <div className="py-20 text-center">Loading...</div>
  }

  if (!data) return null

  const image =
    data.item.product.media?.find((m: any) => m.type === "IMAGE")?.url ||
    "/placeholder.png"

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-10">
      
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Order Detail</h1>
        <p className="text-gray-500 text-sm">
          Order ID: {data.id}
        </p>

        <span className="inline-block mt-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
          {data.status}
        </span>
      </div>

      {/* ITEM CARD */}
      <div className="flex items-center gap-6 p-6 border rounded-2xl bg-white dark:bg-zinc-900 shadow-sm">
        
        {/* Image */}
        <div className="relative w-28 h-28 rounded-xl overflow-hidden">
          <Image
            src={image}
            alt={data.item.product.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          <h2 className="text-xl font-semibold">
            {data.item.product.title}
          </h2>

          <p className="text-sm text-gray-500">
            Quantity: {data.item.quantity}
          </p>

          <p className="text-sm text-gray-500">
            Price per item: ${Number(data.item.price).toFixed(2)}
          </p>
        </div>

        {/* Subtotal */}
        <div className="text-right">
          <p className="text-lg font-bold">
            $
            {(
              Number(data.item.price) * data.item.quantity
            ).toFixed(2)}
          </p>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="border rounded-2xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
        <h2 className="text-xl font-bold">Order Summary</h2>

        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${Number(data.subtotal).toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Discount</span>
          <span>${Number(data.discount).toFixed(2)}</span>
        </div>

        <div className="border-t pt-4 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${Number(data.total).toFixed(2)}</span>
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