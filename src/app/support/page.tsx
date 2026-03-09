"use client"

import { useForm } from "react-hook-form"
import api from "@/lib/api"
import { useRouter } from "next/navigation"

export default function SupportPage() {
  const { register, handleSubmit } = useForm()
  const router = useRouter()

  const onSubmit = async (data: any) => {
    await api.post("/support/create", data)
    router.push("/support/tickets")
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Create Support Ticket</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register("title")} placeholder="Title" className="w-full border p-2 rounded" />
        <textarea {...register("description")} placeholder="Description" className="w-full border p-2 rounded" />
        <button className="bg-primary text-white px-6 py-2 rounded w-full">
          Submit
        </button>
      </form>
    </div>
  )
}
