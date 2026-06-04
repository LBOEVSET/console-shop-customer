"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import Link from "next/link"
import { useState } from "react"
import { Ticket, Plus, MessageSquare, ChevronRight } from "lucide-react"
import Pagination from "@/components/ui/Pagination"

const PAGE_SIZE = 10

const STATUS_STYLES: Record<string, string> = {
  OPEN:        "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  IN_PROGRESS: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  RESOLVED:    "bg-green-500/20 text-green-300 border border-green-500/30",
  CLOSED:      "bg-gray-500/20 text-gray-400 border border-gray-500/30",
}

export default function TicketListPage() {
  const [page, setPage] = useState(1)

  const { data: res, isLoading } = useQuery({
    queryKey: ["my-tickets", page],
    queryFn: async () => {
      const q = new URLSearchParams()
      q.set("page", String(page))
      q.set("limit", String(PAGE_SIZE))
      const r = await api.get(`/support/my-tickets?${q}`)
      return r.data.data ?? r.data
    },
    placeholderData: (prev: any) => prev,
  })

  const tickets: any[] = res?.data ?? []
  const totalPages: number = res?.totalPages ?? 1
  const total: number = res?.total ?? 0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tickets</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} ticket{total !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/support" className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:opacity-90 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
          <Plus size={15} /> New Ticket
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />)}</div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Ticket size={40} className="mb-3 opacity-30" />
          <p className="text-sm">No tickets yet</p>
          <Link href="/support" className="mt-3 text-fuchsia-400 hover:underline text-sm">Open your first ticket →</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {tickets.map((ticket: any) => (
              <Link key={ticket.id} href={`/support/tickets/${ticket.id}`}
                className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[ticket.status] ?? STATUS_STYLES.OPEN}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                      <h3 className="text-sm font-semibold text-white truncate">{ticket.title}</h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><MessageSquare size={11} />{ticket.messages?.length ?? 0} message{ticket.messages?.length !== 1 ? "s" : ""}</span>
                      <span>·</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-500 group-hover:text-fuchsia-400 transition flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
