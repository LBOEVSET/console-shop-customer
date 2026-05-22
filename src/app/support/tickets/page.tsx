"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"

export default function TicketListPage() {
  const { data } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await api.get("/support/my-tickets")
      return res.data.data
    }
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Tickets</h1>

      {data?.map((ticket: any) => (
        <div key={ticket.id} className="border p-4 rounded">
          <p>{ticket.title}</p>
          <p>Status: {ticket.status}</p>
        </div>
      ))}
    </div>
  )
}
