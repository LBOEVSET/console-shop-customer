"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Send, Ticket, Clock, User, ShieldCheck } from "lucide-react"

const STATUS_STYLES: Record<string, string> = {
  OPEN:        "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  IN_PROGRESS: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  RESOLVED:    "bg-green-500/20 text-green-300 border border-green-500/30",
  CLOSED:      "bg-gray-500/20 text-gray-400 border border-gray-500/30",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [reply, setReply] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => {
      const res = await api.get(`/support/my-tickets/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })

  const { mutate: sendReply, isPending } = useMutation({
    mutationFn: async (message: string) => {
      await api.post(`/support/${id}/reply`, { message })
    },
    onSuccess: () => {
      setReply("")
      queryClient.invalidateQueries({ queryKey: ["ticket", id] })
    },
  })

  // Scroll to bottom when messages load or update
  useEffect(() => {
    if (ticket?.messages?.length) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [ticket?.messages?.length])

  const isClosed = ticket?.status === "CLOSED" || ticket?.status === "RESOLVED"

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/support/tickets"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition"
      >
        <ArrowLeft size={15} />
        Back to My Tickets
      </Link>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-48 rounded-xl bg-white/5 animate-pulse" />
        </div>
      )}

      {!isLoading && ticket && (
        <>
          {/* Ticket Header */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[ticket.status] ?? STATUS_STYLES.OPEN}`}
                >
                  {ticket.status.replace("_", " ")}
                </span>
                <h1 className="text-lg font-bold text-white">{ticket.title}</h1>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock size={12} />
                {formatDate(ticket.createdAt)}
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{ticket.description}</p>
          </div>

          {/* Message Thread */}
          <div className="space-y-3">
            {ticket.messages?.length === 0 && (
              <div className="flex flex-col items-center py-12 text-gray-500">
                <Ticket size={32} className="mb-2 opacity-30" />
                <p className="text-sm">No messages yet. Our team will respond shortly.</p>
              </div>
            )}

            {ticket.messages?.map((msg: any) => {
              const isAdmin = msg.sender === "ADMIN"
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAdmin ? "flex-row" : "flex-row-reverse"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                      ${isAdmin
                        ? "bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300"
                        : "bg-cyan-500/20 border border-cyan-500/30 text-cyan-300"
                      }`}
                  >
                    {isAdmin ? <ShieldCheck size={14} /> : <User size={14} />}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[78%] ${isAdmin ? "items-start" : "items-end"} flex flex-col gap-1`}>
                    <span className="text-xs text-gray-500 px-1">
                      {isAdmin ? "Support Team" : "You"} · {formatDate(msg.createdAt)}
                    </span>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                        ${isAdmin
                          ? "bg-white/8 border border-white/10 text-gray-200 rounded-tl-sm"
                          : "bg-fuchsia-600/30 border border-fuchsia-500/30 text-white rounded-tr-sm"
                        }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Reply Box */}
          {isClosed ? (
            <div className="text-center text-sm text-gray-500 py-4 border border-white/10 rounded-xl">
              This ticket is {ticket.status.toLowerCase()} and no longer accepts replies.
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write your reply..."
                rows={3}
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 resize-none outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && reply.trim()) {
                    sendReply(reply.trim())
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Ctrl + Enter to send</span>
                <button
                  onClick={() => reply.trim() && sendReply(reply.trim())}
                  disabled={!reply.trim() || isPending}
                  className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600
                             hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
                             text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                >
                  <Send size={14} />
                  {isPending ? "Sending…" : "Send Reply"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
