"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/auth.store"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user, fetchProfile } = useAuthStore()
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [addresses, setAddresses] = useState<any[]>([])
  const [newAddress, setNewAddress] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else {
      setFirstName(user.firstName || "")
      setLastName(user.lastName || "")
      setPhone(user.phone || "")
      loadAddresses()
    }
  }, [user])

  const loadAddresses = async () => {
    const res = await api.get("/profile")
    setAddresses(res.data.addresses || [])
  }

  const updateProfile = async () => {
    await api.patch("/profile", {
      firstName,
      lastName,
      phone
    })
    await fetchProfile()
  }

  const addAddress = async () => {
    await api.post("/profile/address", { address: newAddress })
    setNewAddress("")
    loadAddresses()
  }

  const deleteAddress = async (id: string) => {
    await api.delete(`/profile/address/${id}`)
    loadAddresses()
  }

  const uploadAvatar = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    await api.post("/profile/upload", formData)
    await fetchProfile()
  }

  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <h1 className="text-3xl font-bold">Profile</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <img
          src={
            user.profileImage ||
            `https://ui-avatars.com/api/?name=${user.email}`
          }
          className="w-20 h-20 rounded-full"
        />
        <input
          type="file"
          onChange={(e) =>
            e.target.files && uploadAvatar(e.target.files[0])
          }
        />
      </div>

      {/* Basic Info */}
      <div className="space-y-4 border p-4 rounded">
        <input 
          value={firstName} 
          onChange={e => setFirstName(e.target.value)} 
          className="w-full border p-2 rounded"
        />
        <input 
          value={lastName} 
          onChange={e => setLastName(e.target.value)} 
          className="w-full border p-2 rounded"
        />
        <input 
          value={phone} 
          onChange={e => setPhone(e.target.value)} 
          className="w-full border p-2 rounded"
        />
        <button
          onClick={updateProfile}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Update Profile
        </button>
      </div>

      {/* Addresses */}
      <div className="space-y-4 border p-4 rounded">
        <h2 className="font-semibold">Addresses</h2>

        {addresses.map((a) => (
          <div key={a.id} className="flex justify-between">
            <p>{a.address}</p>
            <button
              onClick={() => deleteAddress(a.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        ))}

        <div className="flex gap-2">
          <input
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="New Address"
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={addAddress}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
