"use client"

import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { useState } from "react"

type RegisterForm = {
  email: string
  username: string
  firstName: string
  lastName: string
  phone: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const { register, handleSubmit, watch } = useForm<RegisterForm>()
  const registerUser = useAuthStore((s) => s.register)
  const router = useRouter()

  const [popup, setPopup] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      setPopup({
        type: "error",
        message: "Passwords do not match",
      })
      return
    }

    const result = await registerUser({
      email: data.email,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      password: data.password,
    })

    if (result.success) {
      setPopup({
        type: "success",
        message: result.message,
      })

      router.replace("/verify-otp")
    } else {
      setPopup({
        type: "error",
        message: result.message,
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black px-4">
      <div className="w-full max-w-2xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl p-10 space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Create Account
          </h1>
          <p className="text-zinc-400 text-sm">
            Join ArcadeZenter  and start shopping
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* Email */}
          <Input label="Email" register={register("email")} type="email" />

          {/* Username */}
          <Input label="Username" register={register("username")} />

          {/* First Name */}
          <Input label="First Name" register={register("firstName")} />

          {/* Last Name */}
          <Input label="Last Name" register={register("lastName")} />

          {/* Phone */}
          <Input label="Phone" register={register("phone")} />

          {/* Password */}
          <Input
            label="Password"
            register={register("password")}
            type="password"
          />

          {/* Confirm Password */}
          <div className="md:col-span-2">
            <Input
              label="Confirm Password"
              register={register("confirmPassword")}
              type="password"
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition font-semibold text-white shadow-lg"
            >
              Create Account
            </button>
          </div>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-indigo-500 hover:text-indigo-400 transition"
          >
            Login
          </a>
        </p>
      </div>

      {/* Popup */}
      {popup && (
        <div
          className={`fixed top-6 right-6 px-6 py-3 rounded-xl shadow-lg text-white transition ${
            popup.type === "success"
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {popup.message}
        </div>
      )}
    </div>
  )
}

/* Reusable Input Component */
function Input({
  label,
  register,
  type = "text",
}: {
  label: string
  register: any
  type?: string
}) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-zinc-400">{label}</label>
      <input
        {...register}
        type={type}
        className="bg-zinc-800 border border-zinc-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition rounded-xl px-4 py-3 text-white outline-none"
      />
    </div>
  )
}
