"use client"

import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"

export default function LoginPage() {
  const { register, handleSubmit } = useForm()
  const login = useAuthStore(s => s.login)
  const router = useRouter()

  const onSubmit = async (data: any) => {
    await login(data)
    router.push("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center">Login</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("identifier")}
            placeholder="Email or Username"
            className="w-full border p-3 rounded"
          />
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded"
          />

          <button className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700">
            Login
          </button>
        </form>

        <p className="text-center text-sm">
          Don't have an account?{" "}
          <a href="/register" className="text-indigo-600">
            Register
          </a>
        </p>
      </div>
    </div>
  )
}
