"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import Link from "next/link"
import { useState } from "react"
import { CalendarDays, MapPin, Ticket } from "lucide-react"
import Pagination from "@/components/ui/Pagination"

const PAGE_SIZE = 12

interface Event {
  id: string; title: string; slug: string; description: string; category: string
  date: string; venue: string; price: number; stock: number; isActive: boolean
  media: { url: string }[]
}

function EventCard({ event }: { event: Event }) {
  const date = new Date(event.date)
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase()
  const day = date.getDate()
  const isPast = date < new Date()
  const isFree = event.price === 0

  return (
    <Link href={`/events/${event.slug}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden border border-white/10
        bg-white/[0.03] hover:bg-white/[0.06] hover:border-purple-500/40
        transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20">
      <div className="relative h-48 overflow-hidden bg-white/5">
        {event.media?.[0]?.url
          ? <img src={event.media[0].url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">🎮</div>}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-center min-w-[52px]">
          <p className="text-[10px] font-bold text-purple-400 tracking-widest">{month}</p>
          <p className="text-2xl font-extrabold text-white leading-none">{day}</p>
        </div>
        {isPast && <div className="absolute top-3 right-3 bg-gray-800/80 text-gray-400 text-xs font-semibold px-2 py-1 rounded-lg backdrop-blur-sm">Past</div>}
        {!isPast && event.stock === 0 && <div className="absolute top-3 right-3 bg-red-900/80 text-red-300 text-xs font-semibold px-2 py-1 rounded-lg backdrop-blur-sm">Sold Out</div>}
      </div>
      <div className="flex flex-col flex-1 p-5 gap-3">
        <span className="self-start text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">{event.category}</span>
        <h3 className="font-bold text-white text-base leading-snug group-hover:text-purple-300 transition line-clamp-2">{event.title}</h3>
        <p className="text-xs text-gray-400 line-clamp-2 flex-1">{event.description}</p>
        <div className="flex flex-col gap-1.5 mt-auto pt-3 border-t border-white/8">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <CalendarDays size={12} className="text-purple-400 flex-shrink-0" />
            {date.toLocaleString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin size={12} className="text-cyan-400 flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="font-bold text-white text-sm">{isFree ? <span className="text-green-400">Free</span> : `฿${event.price.toLocaleString()}`}</span>
          <span className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${isPast || event.stock === 0 ? "bg-white/5 text-gray-500 cursor-not-allowed" : "bg-purple-600/20 text-purple-300 border border-purple-500/30 group-hover:bg-purple-600 group-hover:text-white"}`}>
            {isPast ? "Ended" : event.stock === 0 ? "Sold Out" : "Get Tickets →"}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function EventsPage() {
  const [page, setPage] = useState(1)

  const { data: res, isLoading, isError } = useQuery({
    queryKey: ["events", page],
    queryFn: async () => {
      const q = new URLSearchParams()
      q.set("page", String(page))
      q.set("limit", String(PAGE_SIZE))
      const r = await api.get(`/events?${q}`)
      return r.data?.data ?? r.data
    },
    placeholderData: (prev: any) => prev,
  })

  const events: Event[] = res?.data ?? []
  const totalPages: number = res?.totalPages ?? 1
  const now = new Date()
  const upcoming = events.filter(e => new Date(e.date) >= now)
  const past = events.filter(e => new Date(e.date) < now)

  const handlePage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }) }

  return (
    <main className="min-h-screen text-white">
      <div className="relative overflow-hidden py-24 px-8 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(139,92,246,0.18),transparent)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <p className="text-xs font-bold tracking-[0.3em] text-purple-400 uppercase mb-4">Events &amp; Tickets</p>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">Gaming Events</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">Expos, tournaments, showcases — grab your ticket before they sell out.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24 space-y-16">
        {isLoading && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-80 bg-white/5 animate-pulse rounded-2xl" />)}</div>}
        {isError && <div className="text-center py-20 text-red-400">Failed to load events.</div>}

        {!isLoading && !isError && (
          <>
            {upcoming.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Ticket size={18} className="text-purple-400" />
                  <h2 className="text-xl font-bold">Upcoming Events</h2>
                  <span className="ml-1 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-semibold">{upcoming.length}</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcoming.map(e => <EventCard key={e.id} event={e} />)}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <CalendarDays size={18} className="text-gray-500" />
                  <h2 className="text-xl font-bold text-gray-400">Past Events</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                  {past.map(e => <EventCard key={e.id} event={e} />)}
                </div>
              </section>
            )}
            {events.length === 0 && <div className="text-center py-20 text-gray-500">No events available right now. Check back soon!</div>}
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePage} />
          </>
        )}
      </div>
    </main>
  )
}
