"use client"

import { useEffect, useRef, useState } from "react"
import { connectSocket } from "@/lib/socket"
import { initGuest } from "@/lib/guest"
import { X, MessageCircle } from "lucide-react"

interface Message {
  message: string
  sender: "USER" | "ADMIN"
  createdAt?: string
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [connected, setConnected] = useState(false)

  const socketRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const accessToken =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null

  useEffect(() => {
    if (!open) return

    const initConnection = async () => {
      let token = accessToken
      let guestId = null

      if (!token) {
        await initGuest()
      }

      const socket = connectSocket({
        token,
        guestId
      })

      socketRef.current = socket

      socket.on("connect", () => {
        setConnected(true)
        socket.emit("create-session")
      })

      socket.on("disconnect", () => {
        setConnected(false)
      })

      socket.on("receive-message", (msg: Message) => {
        setMessages((prev) => [...prev, msg])
      })
    }

    initConnection()

    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!socketRef.current || !input.trim()) return

    socketRef.current.emit("send-message", { message: input })

    setMessages((prev) => [
      ...prev,
      { message: input, sender: "USER", createdAt: new Date().toISOString() }
    ])

    setInput("")
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl transition-all"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 w-96 h-[520px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800">

          <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white">
            <div className="flex flex-col">
              <h3 className="font-semibold">Live Support</h3>
              <span className="text-xs opacity-80">
                {connected ? "Online" : "Connecting..."}
              </span>
            </div>
            <button onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-50 dark:bg-zinc-950">
            {messages.length === 0 && (
              <div className="text-sm text-zinc-500 text-center mt-10">
                👋 Start chatting with our support team
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === "USER"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow ${
                    msg.sender === "USER"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-bl-none"
                  }`}
                >
                  <div>{msg.message}</div>
                  {msg.createdAt && (
                    <div className="text-[10px] opacity-60 mt-1 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:border-zinc-700"
              disabled={!connected}
            />
            <button
              onClick={sendMessage}
              disabled={!connected}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}
