"use client"

import { useEffect, useRef, useState } from "react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/auth.store"
import { useRouter } from "next/navigation"
import {
  Camera, MapPin, Plus, Trash2, Edit3, Check, X,
  User, Mail, Phone, Calendar, ShieldCheck, Star,
  Package, ChevronRight, Home
} from "lucide-react"

// ─── Tier helpers ─────────────────────────────────────────────────────────────

interface SpendingTier {
  name: string; slug: string; color: string; badgeIcon: string; minSpend: number; maxSpend: number | null
}

interface SubscriptionPlan {
  name: string; slug: string; color: string; badgeIcon: string
}

function TierBadge({ tier }: { tier: SpendingTier }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border"
      style={{ color: tier.color, borderColor: tier.color + "44", background: tier.color + "18" }}
    >
      {tier.badgeIcon} {tier.name}
    </span>
  )
}

function SubBadge({ plan }: { plan: SubscriptionPlan }) {
  if (plan.slug === "normal") return null
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border"
      style={{ color: plan.color, borderColor: plan.color + "44", background: plan.color + "18" }}
    >
      {plan.badgeIcon} {plan.name}
    </span>
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/avif", "image/bmp"]
const ALLOWED_LABELS = "JPEG, PNG, WebP, GIF, AVIF, BMP"
const MAX_FILE_SIZE  = 10 * 1024 * 1024 // 10 MB

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
  id: string
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  province: string
  postalCode: string
  country: string
  isDefault: boolean
}

interface ProfileData {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  phone?: string
  birthday?: string
  profileImage?: string
  backgroundImage?: string
  createdAt: string
  vipExpiredAt?: string
  role: string
  status: number
  addresses: Address[]
  _count?: { orders: number; reviews: number }
  totalSpend?: number
  tier?: SpendingTier
  subscription?: { plan: SubscriptionPlan; endDate: string } | null
}

const EMPTY_ADDRESS: Omit<Address, "id" | "isDefault"> = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  province: "",
  postalCode: "",
  country: "Thailand",
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBadge({ icon, label, value, accentColor }: { icon: React.ReactNode; label: string; value: string | number; accentColor?: string }) {
  return (
    <div
      className="flex items-center gap-2 backdrop-blur-sm rounded-xl px-4 py-2"
      style={{
        background: accentColor ? `${accentColor}15` : "rgba(255,255,255,0.08)",
        border: `1px solid ${accentColor ? accentColor + "30" : "rgba(255,255,255,0.08)"}`,
      }}
    >
      <span style={{ color: accentColor ?? "#a5b4fc" }}>{icon}</span>
      <div>
        <p className="text-xs text-white/60 leading-none">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

function AddressCard({
  address,
  onDelete,
  onSetDefault,
}: {
  address: Address
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
}) {
  return (
    <div className={`relative rounded-xl border p-4 transition-all
      ${address.isDefault
        ? "border-indigo-500 bg-indigo-950/40"
        : "border-white/10 bg-white/5 hover:border-white/20"}`}>
      {address.isDefault && (
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white uppercase tracking-wide">
          Default
        </span>
      )}
      <div className="flex items-start gap-3">
        <Home size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm">{address.fullName}</p>
          <p className="text-xs text-gray-400">{address.phone}</p>
          <p className="text-sm text-gray-300 mt-1">
            {address.line1}{address.line2 ? `, ${address.line2}` : ""}
          </p>
          <p className="text-sm text-gray-300">{address.city}, {address.province} {address.postalCode}</p>
          <p className="text-sm text-gray-400">{address.country}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
        {!address.isDefault && (
          <button
            onClick={() => onSetDefault(address.id)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            Set as default
          </button>
        )}
        <button
          onClick={() => onDelete(address.id)}
          className="ml-auto flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition"
        >
          <Trash2 size={12} /> Remove
        </button>
      </div>
    </div>
  )
}

function AddressForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: Omit<Address, "id" | "isDefault">
  onSave: (data: Omit<Address, "id" | "isDefault">) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/30 p-5 space-y-4">
      <h4 className="font-semibold text-sm text-indigo-300 flex items-center gap-2">
        <MapPin size={14} /> New Address
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full Name" value={form.fullName} onChange={set("fullName")} placeholder="Jane Doe" />
        <Field label="Phone" value={form.phone} onChange={set("phone")} placeholder="+66 81 234 5678" />
        <div className="col-span-2">
          <Field label="Address Line 1" value={form.line1} onChange={set("line1")} placeholder="123 Main Street" />
        </div>
        <div className="col-span-2">
          <Field label="Address Line 2 (optional)" value={form.line2 ?? ""} onChange={set("line2")} placeholder="Apt, Suite, Unit…" />
        </div>
        <Field label="City" value={form.city} onChange={set("city")} placeholder="Bangkok" />
        <Field label="Province" value={form.province} onChange={set("province")} placeholder="Bangkok" />
        <Field label="Postal Code" value={form.postalCode} onChange={set("postalCode")} placeholder="10110" />
        <Field label="Country" value={form.country} onChange={set("country")} placeholder="Thailand" />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.fullName || !form.line1 || !form.city}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-40"
        >
          <Check size={14} /> Save Address
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm border border-white/15 hover:border-white/30 rounded-lg transition"
        >
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, type = "text", readOnly = false,
}: {
  label: string
  value: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  readOnly?: boolean
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-3 py-2.5 text-sm rounded-lg border bg-white/5 transition
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          ${readOnly
            ? "border-white/5 text-gray-500 cursor-default"
            : "border-white/15 text-white placeholder-gray-600 hover:border-white/25"}`}
      />
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, fetchProfile } = useAuthStore()
  const router = useRouter()

  const [profile,   setProfile]   = useState<ProfileData | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName,  setLastName]  = useState("")
  const [phone,     setPhone]     = useState("")
  const [birthday,  setBirthday]  = useState("")

  const [saving,           setSaving]           = useState(false)
  const [savedMsg,         setSavedMsg]         = useState(false)
  const [uploadingAvatar,  setUploadingAvatar]  = useState(false)
  const [uploadingBanner,  setUploadingBanner]  = useState(false)
  const [showAddressForm,  setShowAddressForm]  = useState(false)
  const [addingSaving,     setAddingSaving]     = useState(false)
  const [uploadError,      setUploadError]      = useState<string | null>(null)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  // ── Load profile ──────────────────────────────────────────────────────────
  useEffect(() => { fetchProfile() }, [])

  useEffect(() => {
    if (user === null && !useAuthStore.getState().loading) {
      router.push("/login")
      return
    }
    if (!user) return

    // Fetch full profile with addresses + counts
    api.get("/profile").then(res => {
      const data: ProfileData = res.data?.data ?? res.data
      setProfile(data)
      setFirstName(data.firstName ?? "")
      setLastName(data.lastName ?? "")
      setPhone(data.phone ?? "")
      setBirthday(data.birthday ? data.birthday.slice(0, 10) : "")
    })
  }, [user])

  // ── Image upload ───────────────────────────────────────────────────────────
  const uploadImage = async (file: File, field: "profileImage" | "backgroundImage") => {
    // Client-side validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError(
        `"${file.name}" is not a supported image format.\n` +
        `Supported formats: ${ALLOWED_LABELS}.`
      )
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`"${file.name}" is too large. Maximum size is 10 MB.`)
      return
    }

    const isAvatar = field === "profileImage"
    if (isAvatar) setUploadingAvatar(true)
    else setUploadingBanner(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await api.post("/profile/upload", formData)
      const url: string = res.data?.data?.url ?? res.data?.url

      await api.patch("/profile", { [field]: url })
      await fetchProfile()
      // Refresh local profile too
      const fresh = await api.get("/profile")
      setProfile(fresh.data?.data ?? fresh.data)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.data?.message ??
        "Upload failed. Please try again."
      setUploadError(msg)
    } finally {
      if (isAvatar) setUploadingAvatar(false)
      else setUploadingBanner(false)
    }
  }

  // ── Update info ────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    setSaving(true)
    try {
      await api.patch("/profile", { firstName, lastName, phone, birthday: birthday || undefined })
      await fetchProfile()
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  // ── Addresses ──────────────────────────────────────────────────────────────
  const addAddress = async (data: Omit<Address, "id" | "isDefault">) => {
    setAddingSaving(true)
    try {
      await api.post("/profile/address", data)
      setShowAddressForm(false)
      const fresh = await api.get("/profile")
      setProfile(fresh.data?.data ?? fresh.data)
    } finally {
      setAddingSaving(false)
    }
  }

  const deleteAddress = async (id: string) => {
    await api.delete(`/profile/address/${id}`)
    const fresh = await api.get("/profile")
    setProfile(fresh.data?.data ?? fresh.data)
  }

  const setDefaultAddress = async (id: string) => {
    await api.patch(`/profile/address/${id}`, { isDefault: true })
    const fresh = await api.get("/profile")
    setProfile(fresh.data?.data ?? fresh.data)
  }

  if (!user || !profile) return null

  const initials = `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() || "?"
  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—"
  const isVip = profile.vipExpiredAt && new Date(profile.vipExpiredAt) > new Date()
  const orderCount = profile._count?.orders ?? 0
  const tier = profile.tier
  const subscription = profile.subscription
  const birthdayLocked = !!profile.birthday
  const subColor = subscription && subscription.plan.slug !== "normal" ? subscription.plan.color : null
  // Subscription border takes priority over tier (it's the paid status)
  const avatarBorderColor = subColor ?? tier?.color ?? "#6366f1"
  const accentColor = subColor ?? tier?.color ?? "#6366f1"

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8">

      {/* ── Upload error modal ────────────────────────────────────────────────── */}
      {uploadError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#13121f] border border-red-500/30 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
                <X size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Upload Failed</h3>
                <p className="text-sm text-gray-400 mt-1 whitespace-pre-line">{uploadError}</p>
              </div>
            </div>
            <div className="pt-1">
              <p className="text-xs text-gray-500 mb-3">
                Supported formats: <span className="text-gray-300">{ALLOWED_LABELS}</span>
              </p>
              <button
                onClick={() => setUploadError(null)}
                className="w-full py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { e.target.files?.[0] && uploadImage(e.target.files[0], "profileImage"); e.target.value = "" }} />
      <input ref={bannerInputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { e.target.files?.[0] && uploadImage(e.target.files[0], "backgroundImage"); e.target.value = "" }} />

      {/* ── Hero card ───────────────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">

        {/* Banner */}
        <div
          className="relative h-48 cursor-pointer group"
          style={{
            background: profile.backgroundImage
              ? `url(${profile.backgroundImage}) center/cover no-repeat`
              : "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)"
          }}
          onClick={() => bannerInputRef.current?.click()}
        >
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-2 bg-black/70 text-white text-sm px-4 py-2 rounded-full">
              {uploadingBanner
                ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                : <Camera size={16} />}
              {uploadingBanner ? "Uploading…" : "Change Banner"}
            </div>
          </div>
        </div>

        {/* Avatar + info row — tinted by subscription */}
        <div
          className="px-6 pt-2 pb-6 relative"
          style={{
            background: "#0d0c1a",
            borderTop: subColor ? `2px solid ${subColor}60` : "2px solid transparent",
            boxShadow: subColor ? `inset 0 0 60px 0 ${subColor}10` : undefined,
          }}
        >
          {/* Subscription color wash */}
          {subColor && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(180deg, ${subColor}12 0%, transparent 60%)`,
              }}
            />
          )}
          <div className="relative flex flex-col sm:flex-row sm:items-end gap-4 pt-3">
            {/* Avatar — only the avatar overlaps the banner */}
            <div className="relative flex-shrink-0 w-28 h-28 -mt-[72px] self-start">
              <div
                className="relative cursor-pointer group w-28 h-28"
                onClick={() => avatarInputRef.current?.click()}
              >
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={initials}
                    className="w-28 h-28 rounded-full border-4 object-cover transition-all duration-300"
                    style={{
                      borderColor: avatarBorderColor,
                      boxShadow: `0 0 0 2px #0d0c1a, 0 0 16px 4px ${avatarBorderColor}55`,
                    }}
                  />
                ) : (
                  <div
                    className="w-28 h-28 rounded-full border-4 bg-indigo-700 flex items-center justify-center text-3xl font-bold text-white transition-all duration-300"
                    style={{
                      borderColor: avatarBorderColor,
                      boxShadow: `0 0 0 2px #0d0c1a, 0 0 16px 4px ${avatarBorderColor}55`,
                    }}
                  >
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center">
                  {uploadingAvatar
                    ? <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    : <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition" />}
                </div>
              </div>

              {/* Tier badge — bottom-right of avatar */}
              {tier && (
                <div
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center text-lg
                    border-2 border-[#0d0c1a] shadow-lg select-none"
                  style={{ background: tier.color + "33", borderColor: "#0d0c1a" }}
                  title={`${tier.name} tier`}
                >
                  <span className="drop-shadow">{tier.badgeIcon}</span>
                </div>
              )}

            </div>

            {/* Name + stats */}
            <div className="flex-1 sm:mb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">@{profile.username}</h1>
                {tier && <TierBadge tier={tier} />}
                {subscription && <SubBadge plan={subscription.plan} />}
                {isVip && (
                  <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    <Star size={10} /> VIP
                  </span>
                )}
                {profile.status === 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Banned</span>
                )}
              </div>
              <p className="text-sm text-gray-400">{profile.firstName} {profile.lastName} · {profile.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <StatBadge icon={<Package size={13} />} label="Orders" value={orderCount} accentColor={accentColor} />
                <StatBadge icon={<Calendar size={13} />} label="Member since" value={joinedDate} accentColor={accentColor} />
                <StatBadge icon={<span className="text-xs font-bold">$</span>} label="Total spent" value={`$${(profile.totalSpend ?? 0).toFixed(2)}`} accentColor={accentColor} />
                {subscription && subscription.plan.slug !== "normal" && (
                  <StatBadge
                    icon={<span>{subscription.plan.badgeIcon}</span>}
                    label="Sub expires"
                    value={new Date(subscription.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    accentColor={accentColor}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Personal Info */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
          <h2 className="font-bold flex items-center gap-2 text-base">
            <User size={16} className="text-indigo-400" /> Personal Info
          </h2>
          <div className="space-y-4">
            <Field label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" />
            <Field label="Last Name"  value={lastName}  onChange={e => setLastName(e.target.value)}  placeholder="Doe" />
            <Field label="Phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+66 81 234 5678" />
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                Birthday
                {birthdayLocked && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-700/60 text-gray-400">locked</span>
                )}
              </label>
              <input
                type="date"
                value={birthday}
                onChange={birthdayLocked ? undefined : e => setBirthday(e.target.value)}
                readOnly={birthdayLocked}
                className={`w-full px-3 py-2.5 text-sm rounded-lg border bg-white/5 transition
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  ${birthdayLocked
                    ? "border-white/5 text-gray-500 cursor-default"
                    : "border-white/15 text-white hover:border-white/25"}`}
              />
              {!birthdayLocked && (
                <p className="text-[11px] text-amber-400/70">⚠ Birthday can only be set once and cannot be changed.</p>
              )}
            </div>
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
          >
            {saving
              ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : savedMsg ? <><Check size={15} /> Saved!</> : "Update Profile"}
          </button>
        </div>

        {/* Account Details (read-only) */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
          <h2 className="font-bold flex items-center gap-2 text-base">
            <ShieldCheck size={16} className="text-indigo-400" /> Account Details
          </h2>
          <div className="space-y-4">
            <Field label="Email" value={profile.email} readOnly />
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                Username
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-700/60 text-gray-400">locked</span>
              </label>
              <div className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/5 bg-white/5 text-gray-500">
                @{profile.username}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Membership card ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        {/* Header gradient based on subscription */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: subscription && subscription.plan.slug !== "normal"
              ? `linear-gradient(135deg, ${subscription.plan.color}22, ${subscription.plan.color}08)`
              : "linear-gradient(135deg, #1e1b4b22, transparent)"
          }}
        >
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <Star size={16} className="text-indigo-400" /> Membership
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Your subscription plan and spending tier</p>
          </div>
          {subscription && subscription.plan.slug !== "normal" && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Renews</p>
              <p className="text-sm font-semibold" style={{ color: subscription.plan.color }}>
                {new Date(subscription.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 bg-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          {/* Subscription */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscription</p>
            {subscription ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl">{subscription.plan.badgeIcon}</span>
                <div>
                  <p className="font-bold text-lg" style={{ color: subscription.plan.color }}>{subscription.plan.name}</p>
                  <p className="text-xs text-gray-500">
                    {subscription.plan.slug === "normal" ? "Free plan" : `Active until ${new Date(subscription.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎮</span>
                <div>
                  <p className="font-bold text-lg text-gray-400">Normal</p>
                  <p className="text-xs text-gray-500">Free plan</p>
                </div>
              </div>
            )}
          </div>

          {/* Tier */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Spending Tier</p>
            {tier ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl">{tier.badgeIcon}</span>
                <div>
                  <p className="font-bold text-lg" style={{ color: tier.color }}>{tier.name}</p>
                  <p className="text-xs text-gray-500">
                    Total spent: <span className="text-white font-semibold">${(profile.totalSpend ?? 0).toFixed(2)}</span>
                    {tier.maxSpend != null && (
                      <> · Next tier at <span className="text-white font-semibold">${tier.maxSpend + 0.01}</span></>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-3xl">🥉</span>
                <div>
                  <p className="font-bold text-lg" style={{ color: "#cd7f32" }}>Bronze</p>
                  <p className="text-xs text-gray-500">Total spent: $0.00</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Addresses ────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2 text-base">
            <MapPin size={16} className="text-indigo-400" /> Saved Addresses
            {profile.addresses?.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300">
                {profile.addresses.length}
              </span>
            )}
          </h2>
          {!showAddressForm && (
            <button
              onClick={() => setShowAddressForm(true)}
              className="flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition"
            >
              <Plus size={15} /> Add New
            </button>
          )}
        </div>

        {showAddressForm && (
          <AddressForm
            initial={{ ...EMPTY_ADDRESS }}
            onSave={addAddress}
            onCancel={() => setShowAddressForm(false)}
            saving={addingSaving}
          />
        )}

        {profile.addresses?.length === 0 && !showAddressForm && (
          <div className="py-8 text-center text-gray-500 text-sm">
            <MapPin size={28} className="mx-auto mb-2 opacity-30" />
            No addresses saved yet
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profile.addresses?.map(addr => (
            <AddressCard
              key={addr.id}
              address={addr}
              onDelete={deleteAddress}
              onSetDefault={setDefaultAddress}
            />
          ))}
        </div>
      </div>

    </div>
  )
}
