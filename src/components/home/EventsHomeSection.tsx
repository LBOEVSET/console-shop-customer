import Link from "next/link"
import { CalendarDays, MapPin, Ticket } from "lucide-react"

interface Event {
  id: string
  title: string
  slug: string
  description: string
  category: string
  date: string
  venue: string
  price: number
  stock: number
  isActive: boolean
  media: { url: string }[]
}

function EventHomeCard({ event }: { event: Event }) {
  const date = new Date(event.date)
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase()
  const day = date.getDate()
  const isFree = event.price === 0
  const soldOut = event.stock === 0

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden
        border border-white/10 hover:border-purple-500/50
        bg-white/[0.03] hover:bg-white/[0.06]
        shadow-md hover:shadow-purple-900/30
        transition-all duration-400 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-zinc-900 shrink-0">
        {event.media?.[0]?.url ? (
          <img
            src={event.media[0].url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-purple-900/40 to-zinc-900">
            🎮
          </div>
        )}

        {/* Top glow on hover */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        {/* Date badge */}
        <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-center min-w-[52px]">
          <p className="text-[9px] font-bold text-purple-400 tracking-widest">{month}</p>
          <p className="text-xl font-extrabold text-white leading-none">{day}</p>
        </div>

        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-purple-300 border border-purple-500/20">
            {event.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-purple-200 transition-colors">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1 mt-auto">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <CalendarDays size={11} className="text-purple-400 shrink-0" />
            {date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <MapPin size={11} className="text-cyan-400 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/8">
          <span className="text-sm font-bold">
            {isFree
              ? <span className="text-green-400">Free</span>
              : <span className="text-white">฿{event.price.toLocaleString()}</span>}
          </span>
          <span className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all duration-300
            ${soldOut
              ? "bg-white/5 text-gray-500"
              : "bg-purple-600/20 text-purple-300 border border-purple-500/30 group-hover:bg-purple-600 group-hover:text-white"}`}>
            {soldOut ? "Sold Out" : "Get Tickets →"}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function EventsHomeSection({ events }: { events: Event[] }) {
  if (!events.length) return null

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-[0.25em] text-purple-400 uppercase">Live &amp; Upcoming</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            🎟️ Gaming Events
          </h2>
        </div>

        <Link
          href="/events"
          className="text-sm font-semibold text-cyan-400
          hover:text-fuchsia-400
          hover:tracking-wide
          transition-all duration-300 shrink-0"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventHomeCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  )
}
