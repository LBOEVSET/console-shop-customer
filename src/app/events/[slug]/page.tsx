"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import Link from "next/link"
import { CalendarDays, MapPin, ArrowLeft, Users } from "lucide-react"

export default function EventDetailPage() {
  const { slug } = useParams()

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", slug],
    queryFn: async () => {
      const res = await api.get(`/events/${slug}`)
      return res.data?.data ?? res.data
    },
    enabled: !!slug,
  })

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 space-y-6">
        <div className="h-10 w-32 bg-white/5 animate-pulse rounded-lg" />
        <div className="h-[440px] bg-white/5 animate-pulse rounded-2xl" />
        <div className="h-8 w-2/3 bg-white/5 animate-pulse rounded-lg" />
        <div className="h-4 w-full bg-white/5 animate-pulse rounded" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-32 text-gray-400">
        <p className="text-4xl mb-4">🎟️</p>
        <p>Event not found.</p>
        <Link href="/events" className="mt-4 inline-block text-purple-400 hover:text-purple-300 text-sm underline">
          ← Back to Events
        </Link>
      </div>
    )
  }

  const date    = new Date(event.date)
  const isPast  = date < new Date()
  const isFree  = event.price === 0
  const soldOut = event.stock === 0

  return (
    <main className="min-h-screen text-white">
      {/* Back */}
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <Link href="/events"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition">
          <ArrowLeft size={14} /> Back to Events
        </Link>
      </div>

      {/* Hero image */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="relative h-[400px] md:h-[480px] rounded-2xl overflow-hidden border border-white/10">
          {event.media?.[0]?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.media[0].url} alt={event.title}
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center text-7xl">🎮</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <span className="text-xs font-bold tracking-widest uppercase
              px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 border border-purple-500/30">
              {event.category}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-10">
        {/* Left: details */}
        <div className="md:col-span-2 space-y-6">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{event.title}</h1>
          <p className="text-gray-400 leading-relaxed">{event.description}</p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 text-sm">
              <CalendarDays size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">
                  {date.toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {date.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <MapPin size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-300">{event.venue}</p>
            </div>
            {!isFree && (
              <div className="flex items-start gap-3 text-sm">
                <Users size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300">
                  {event.stock > 0
                    ? <span className="text-green-400 font-semibold">{event.stock.toLocaleString()} tickets remaining</span>
                    : <span className="text-red-400 font-semibold">Sold out</span>}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: ticket box */}
        <div className="md:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/[0.04] p-6 space-y-5">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Ticket price</p>
              <p className="text-3xl font-extrabold">
                {isFree
                  ? <span className="text-green-400">Free</span>
                  : <span>฿{event.price.toLocaleString()}</span>}
              </p>
              {!isFree && <p className="text-xs text-gray-500 mt-0.5">per person</p>}
            </div>

            {isPast ? (
              <div className="w-full py-3 rounded-xl text-center text-sm font-semibold bg-white/5 text-gray-500">
                This event has ended
              </div>
            ) : soldOut ? (
              <div className="w-full py-3 rounded-xl text-center text-sm font-semibold bg-red-900/20 text-red-400 border border-red-800/30">
                Sold Out
              </div>
            ) : (
              <button
                className="w-full py-3 rounded-xl text-sm font-bold
                  bg-gradient-to-r from-purple-600 to-fuchsia-600
                  hover:from-purple-500 hover:to-fuchsia-500
                  text-white transition-all shadow-lg shadow-purple-900/30">
                {isFree ? "Register Now →" : "Buy Ticket →"}
              </button>
            )}

            <p className="text-[11px] text-gray-600 text-center">
              {isPast ? "" : "Tickets are non-refundable after purchase."}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
