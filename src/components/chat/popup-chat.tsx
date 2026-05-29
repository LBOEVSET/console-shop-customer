"use client"

import { useEffect, useRef, useState } from "react"
import { connectSocket } from "@/lib/socket"
import { useAuthStore } from "@/store/auth.store"
import { X, MessageCircle, Send, LogIn } from "lucide-react"
import api from "@/lib/api"
import Link from "next/link"

interface Message {
  message: string
  sender: "USER" | "ADMIN"
  createdAt?: string
}

export default function ChatWidget() {
  const { user, loading } = useAuthStore()

  const [open,      setOpen]      = useState(false)
  const [messages,  setMessages]  = useState<Message[]>([])
  const [input,     setInput]     = useState("")
  const [connected, setConnected] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error,     setError]     = useState<string | null>(null)

  const socketRef    = useRef<ReturnType<typeof connectSocket> | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Keep ref in sync so socket callbacks always have the current sessionId
  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])

  // Connect (or disconnect) when the widget is opened/closed
  useEffect(() => {
    if (!open || !user) return

    let cancelled = false

    const init = async () => {
      try {
        setError(null)

        // 1. Get a readable copy of the token for the WS handshake
        //    (the real token lives in an httpOnly cookie on the proxy origin)
        const { data: tokenData } = await api.get("/auth/ws-token")
        if (cancelled) return
        const wsToken: string = tokenData?.token ?? tokenData?.data?.token

        // 2. Create a chat session via REST
        const { data: sessionData } = await api.post("/chat/start")
        if (cancelled) return
        const sid: string = sessionData?.data?.id ?? sessionData?.id
        setSessionId(sid)
        sessionIdRef.current = sid

        // 3. Connect socket with the real JWT
        const socket = connectSocket({ token: wsToken })
        socketRef.current = socket

        socket.on("connect", () => {
          setConnected(true)
          // 4. Join the session room on the gateway
          socket.emit("join", { sessionId: sid })
        })

        socket.on("disconnect", () => setConnected(false))

        // 5. Gateway emits "newMessage" when anyone posts
        socket.on("newMessage", (msg: { message: string; sender: string; createdAt: string }) => {
          if (msg.sender !== user.id) {
            setMessages(prev => [...prev, {
              message: msg.message,
              sender: "ADMIN",
              createdAt: msg.createdAt,
            }])
          }
        })

        socket.on("closed", () => {
          setConnected(false)
          setMessages(prev => [
            ...prev,
            { message: "Support has closed this session.", sender: "ADMIN" },
          ])
        })

        socket.on("connect_error", (err: Error) => {
          setError(`Connection failed: ${err.message}`)
          setConnected(false)
        })

      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.message ?? "Could not start chat. Please try again.")
      }
    }

    init()

    return () => {
      cancelled = true
      socketRef.current?.disconnect()
      socketRef.current = null
      setConnected(false)
      setSessionId(null)
    }
  }, [open, user])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    const sid = sessionIdRef.current
    if (!socketRef.current || !input.trim() || !sid) return

    // Optimistically show own message immediately
    const text = input.trim()
    setMessages(prev => [
      ...prev,
      { message: text, sender: "USER", createdAt: new Date().toISOString() },
    ])
    setInput("")

    // 6. Gateway listens to "sendMessage" with { sessionId, message }
    socketRef.current.emit("sendMessage", { sessionId: sid, message: text })
  }

  if (loading) return null

  return (
    <>
      {/* Trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl transition-all z-50"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 w-[360px] h-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/10 bg-[#1a1730] z-50">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white flex-shrink-0">
            <div>
              <h3 className="font-semibold text-sm">Live Support</h3>
              <span className="text-xs opacity-75">
                {!user ? "Sign in to chat" : connected ? "Online" : "Connecting…"}
              </span>
            </div>
            <button onClick={() => setOpen(false)} className="hover:opacity-70 transition">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          {!user ? (
            /* Not logged in — prompt */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <MessageCircle size={40} className="text-indigo-400 opacity-50" />
              <p className="text-sm text-gray-300">Sign in to chat with our support team.</p>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition"
              >
                <LogIn size={14} /> Sign In
              </Link>
            </div>
          ) : error ? (
            /* Connection error */
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={() => { setError(null); setOpen(false); setTimeout(() => setOpen(true), 100) }}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline"
              >
                Try again
              </button>
            </div>
          ) : (
            /* Messages */
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#111020]">
              {messages.length === 0 && (
                <div className="text-xs text-gray-500 text-center mt-8">
                  {connected
                    ? "👋 Connected! How can we help you today?"
                    : "Connecting to support…"}
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}>
                  <div className={`px-3 py-2 rounded-2xl max-w-[78%] text-sm shadow
                    ${msg.sender === "USER"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white/10 text-gray-100 rounded-bl-none"}`}>
                    <p>{msg.message}</p>
                    {msg.createdAt && (
                      <p className="text-[10px] opacity-50 mt-1 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input */}
          {user && !error && (
            <div className="p-3 border-t border-white/10 bg-[#1a1730] flex gap-2 flex-shrink-0">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder={connected ? "Type a message…" : "Connecting…"}
                disabled={!connected}
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/8 border border-white/15
                  text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/60
                  transition disabled:opacity-40"
              />
              <button
                onClick={sendMessage}
                disabled={!connected || !input.trim()}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm
                  transition disabled:opacity-40 flex items-center gap-1"
              >
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
