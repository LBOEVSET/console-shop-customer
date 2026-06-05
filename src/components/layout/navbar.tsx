"use client"

import Link from "next/link"
import {
  User, LogOut, ShoppingCart, Ticket,
  Search, X, ChevronDown, Menu,
} from "lucide-react"
import { useAuthStore } from "@/store/auth.store"
import { useCartStore } from "@/store/cart.store"
import { useCurrencyStore } from "@/store/currency.store"
import {
  useState, useRef, useEffect,
  useCallback, type ReactNode,
  Suspense,
} from "react"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Product, Platform, Category } from "@/types/product"

// ─── debounce ─────────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay = 350): T {
  const [d, setD] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return d
}

// ─── generic dropdown ─────────────────────────────────────────────────────────
function Dropdown({
  trigger, children,
  align = "left", minWidth = "min-w-[210px]",
}: {
  trigger: (open: boolean) => ReactNode
  children: ReactNode
  align?: "left" | "right"
  minWidth?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(o => !o)}>{trigger(open)}</div>
      {open && (
        <div className={`absolute top-full mt-2 z-[999] py-1.5 rounded-xl
          border border-white/10 bg-[#1a1730]/98 backdrop-blur-md
          shadow-2xl shadow-black/60 ${minWidth}
          ${align === "right" ? "right-0" : "left-0"}`}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── filter button ─────────────────────────────────────────────────────────────
function FilterBtn({ label, active, onClear, open }: {
  label: string; active?: boolean; onClear?: () => void; open: boolean
}) {
  return (
    <button type="button"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        border transition-all duration-150 whitespace-nowrap
        ${active
          ? "bg-purple-600/15 border-purple-500/50 text-purple-300"
          : "bg-white/5 border-white/15 text-gray-200 hover:border-white/30 hover:text-white"
        }`}>
      {label}
      {active && onClear ? (
        <span role="button" tabIndex={0}
          onClickCapture={e => { e.stopPropagation(); onClear() }}
          className="text-purple-400 hover:text-white transition">
          <X size={11} />
        </span>
      ) : (
        <ChevronDown size={12} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      )}
    </button>
  )
}

// ─── filter row (uses useSearchParams — must be in Suspense) ──────────────────
function NavFilterRow() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()           // ← the hook that needs Suspense

  const [platform,     setPlatform]     = useState(searchParams.get("platform") ?? "")
  const [categoryIds,  setCategoryIds]  = useState<string[]>(searchParams.getAll("categoryIds"))
  const [priceInputs,  setPriceInputs]  = useState({ min: searchParams.get("minPrice") ?? "", max: searchParams.get("maxPrice") ?? "" })
  const [appliedPrice, setAppliedPrice] = useState({ min: searchParams.get("minPrice") ?? "", max: searchParams.get("maxPrice") ?? "" })

  const { data: platforms } = useQuery<Platform[]>({
    queryKey: ["platforms"],
    queryFn: async () => {
      const res = await api.get("/products/platforms")
      return res.data.data ?? res.data
    },
    staleTime: 60 * 60 * 1000,
  })

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/products/categories")
      return res.data.data ?? res.data
    },
    staleTime: 60 * 60 * 1000,
  })

  // sync URL → state when navigating within /products
  useEffect(() => {
    if (pathname === "/products") {
      setPlatform(searchParams.get("platform") ?? "")
      setCategoryIds(searchParams.getAll("categoryIds"))
      const min = searchParams.get("minPrice") ?? ""
      const max = searchParams.get("maxPrice") ?? ""
      setPriceInputs({ min, max })
      setAppliedPrice({ min, max })
    }
  }, [pathname, searchParams])

  const navigate = useCallback((overrides: {
    platform?: string; categoryIds?: string[]
    minPrice?: string; maxPrice?: string
  } = {}) => {
    const plat = overrides.platform    ?? platform
    const cats = overrides.categoryIds ?? categoryIds
    const min  = overrides.minPrice    ?? appliedPrice.min
    const max  = overrides.maxPrice    ?? appliedPrice.max
    const q = new URLSearchParams()
    if (plat) q.set("platform", plat)
    cats.forEach(id => q.append("categoryIds", id))
    if (min)  q.set("minPrice", min)
    if (max)  q.set("maxPrice", max)
    const qs = q.toString()
    if (pathname === "/products") {
      router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false })
    } else {
      router.push(`/products${qs ? `?${qs}` : ""}`)
    }
  }, [pathname, router, platform, categoryIds, appliedPrice])

  function selectPlatform(name: string) {
    const next = name === platform ? "" : name
    setPlatform(next)
    navigate({ platform: next })
  }

  const toggleCategory = useCallback((id: string) => {
    setCategoryIds(prev => {
      const next = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
      navigate({ categoryIds: next })
      return next
    })
  }, [navigate])

  function applyPrice() {
    setAppliedPrice({ ...priceInputs })
    navigate({ minPrice: priceInputs.min, maxPrice: priceInputs.max })
  }

  function clearFilters() {
    setPlatform(""); setCategoryIds([])
    setPriceInputs({ min: "", max: "" }); setAppliedPrice({ min: "", max: "" })
    if (pathname === "/products") router.replace("/products", { scroll: false })
  }

  const hasFilters = !!platform || categoryIds.length > 0 || !!appliedPrice.min || !!appliedPrice.max
  const priceLabel =
    appliedPrice.min && appliedPrice.max ? `$${appliedPrice.min}–$${appliedPrice.max}`
    : appliedPrice.min ? `≥$${appliedPrice.min}`
    : appliedPrice.max ? `≤$${appliedPrice.max}`
    : "Price"

  return (
    <div className="flex items-center gap-2 px-8 py-2 border-t border-white/[0.07]">

      {/* Platform tabs */}
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => selectPlatform("")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition
            ${!platform
              ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
              : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"}`}>
          All
        </button>
        {platforms?.map(p => (
          <button key={p.id} type="button" onClick={() => selectPlatform(p.name)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition
              ${platform === p.name
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"}`}>
            {p.name}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-white/10 mx-1" />

      {/* Genre */}
      <Dropdown minWidth="min-w-[220px]"
        trigger={open => (
          <FilterBtn
            label={categoryIds.length ? `Genre (${categoryIds.length})` : "Genre"}
            active={categoryIds.length > 0}
            onClear={() => { setCategoryIds([]); navigate({ categoryIds: [] }) }}
            open={open}
          />
        )}>
        {categories?.map(c => {
          const checked = categoryIds.includes(c.id)
          return (
            <button key={c.id} type="button" onClick={() => toggleCategory(c.id)}
              className="w-full flex items-center gap-3 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition">
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition
                ${checked ? "bg-purple-500 border-purple-500" : "border-white/20"}`}>
                {checked && (
                  <svg width="8" height="7" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {c.name}
            </button>
          )
        })}
      </Dropdown>

      {/* Price */}
      <Dropdown minWidth="min-w-[210px]"
        trigger={open => (
          <FilterBtn
            label={priceLabel}
            active={!!(appliedPrice.min || appliedPrice.max)}
            onClear={() => {
              setPriceInputs({ min: "", max: "" }); setAppliedPrice({ min: "", max: "" })
              navigate({ minPrice: "", maxPrice: "" })
            }}
            open={open}
          />
        )}>
        <div className="px-4 py-3 space-y-2.5">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Price range</p>
          <div className="flex items-center gap-2">
            {(["min", "max"] as const).map(k => (
              <div key={k} className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                <input type="number" min={0} placeholder={k === "min" ? "Min" : "Max"}
                  value={priceInputs[k]}
                  onChange={e => setPriceInputs(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full pl-5 pr-2 py-1.5 rounded-lg text-xs bg-white/8 border border-white/15
                    text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition" />
              </div>
            ))}
          </div>
          <button type="button" onClick={applyPrice}
            className="w-full py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition">
            Apply
          </button>
        </div>
      </Dropdown>

      {/* Clear */}
      {hasFilters && (
        <>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button type="button" onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition">
            <X size={11} /> Clear
          </button>
        </>
      )}

      {/* Right links */}
      <div className="ml-auto flex items-center gap-5">
        <Link href="/articles" className="text-xs text-gray-300 hover:text-white transition font-medium">
          News
        </Link>
        <Link href="/events" className="text-xs text-gray-300 hover:text-white transition font-medium">
          Events
        </Link>
        <Link href="/merchandise" className="text-xs text-gray-300 hover:text-white transition font-medium">
          Merch
        </Link>
        <Link href="/products" className="text-xs text-purple-400 hover:text-purple-300 transition font-medium">
          Browse all →
        </Link>
      </div>
    </div>
  )
}

// ─── mobile filter row ────────────────────────────────────────────────────────
function MobileFilterRow() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const [platform,    setPlatform]    = useState(searchParams.get("platform") ?? "")
  const [categoryIds, setCategoryIds] = useState<string[]>(searchParams.getAll("categoryIds"))
  const [priceInputs, setPriceInputs] = useState({ min: searchParams.get("minPrice") ?? "", max: searchParams.get("maxPrice") ?? "" })
  const [appliedPrice, setAppliedPrice] = useState({ min: searchParams.get("minPrice") ?? "", max: searchParams.get("maxPrice") ?? "" })

  const { data: platforms } = useQuery<Platform[]>({
    queryKey: ["platforms"],
    queryFn: async () => { const res = await api.get("/products/platforms"); return res.data.data ?? res.data },
    staleTime: 60 * 60 * 1000,
  })

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => { const res = await api.get("/products/categories"); return res.data.data ?? res.data },
    staleTime: 60 * 60 * 1000,
  })

  useEffect(() => {
    if (pathname === "/products") {
      setPlatform(searchParams.get("platform") ?? "")
      setCategoryIds(searchParams.getAll("categoryIds"))
      const min = searchParams.get("minPrice") ?? ""; const max = searchParams.get("maxPrice") ?? ""
      setPriceInputs({ min, max }); setAppliedPrice({ min, max })
    }
  }, [pathname, searchParams])

  const navigate = useCallback((overrides: { platform?: string; categoryIds?: string[]; minPrice?: string; maxPrice?: string } = {}) => {
    const plat = overrides.platform    ?? platform
    const cats = overrides.categoryIds ?? categoryIds
    const min  = overrides.minPrice    ?? appliedPrice.min
    const max  = overrides.maxPrice    ?? appliedPrice.max
    const q = new URLSearchParams()
    if (plat) q.set("platform", plat)
    cats.forEach(id => q.append("categoryIds", id))
    if (min)  q.set("minPrice", min)
    if (max)  q.set("maxPrice", max)
    const qs = q.toString()
    if (pathname === "/products") {
      router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false })
    } else {
      router.push(`/products${qs ? `?${qs}` : ""}`)
    }
  }, [pathname, router, platform, categoryIds, appliedPrice])

  function selectPlatform(name: string) {
    const next = name === platform ? "" : name; setPlatform(next); navigate({ platform: next })
  }

  const priceLabel =
    appliedPrice.min && appliedPrice.max ? `$${appliedPrice.min}–$${appliedPrice.max}`
    : appliedPrice.min ? `≥$${appliedPrice.min}`
    : appliedPrice.max ? `≤$${appliedPrice.max}`
    : "Price"

  return (
    <div className="flex items-center">
      {/* Platform chips — scrollable */}
      <div className="overflow-x-auto flex-1">
        <div className="flex items-center gap-2 px-4 py-2 min-w-max">
          <button type="button" onClick={() => selectPlatform("")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap border
              ${!platform ? "bg-purple-600/20 border-purple-500/40 text-purple-300" : "border-white/15 text-gray-300 hover:text-white"}`}>
            All
          </button>
          {platforms?.map(p => (
            <button key={p.id} type="button" onClick={() => selectPlatform(p.name)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap border
                ${platform === p.name ? "bg-purple-600/20 border-purple-500/40 text-purple-300" : "border-white/15 text-gray-300 hover:text-white"}`}>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Genre + Price — fixed, outside scrollable area so dropdowns aren't clipped */}
      <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0 border-l border-white/[0.07]">
        <Dropdown minWidth="min-w-[200px]" align="right"
          trigger={open => (
            <FilterBtn
              label={categoryIds.length ? `Genre (${categoryIds.length})` : "Genre"}
              active={categoryIds.length > 0}
              onClear={() => { setCategoryIds([]); navigate({ categoryIds: [] }) }}
              open={open}
            />
          )}>
          <div className="max-h-64 overflow-y-auto">
            {categories?.map(c => {
              const checked = categoryIds.includes(c.id)
              return (
                <button key={c.id} type="button" onClick={() => {
                  setCategoryIds(prev => {
                    const next = prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id]
                    navigate({ categoryIds: next })
                    return next
                  })
                }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition">
                  <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition
                    ${checked ? "bg-purple-500 border-purple-500" : "border-white/20"}`}>
                    {checked && <svg width="8" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </span>
                  {c.name}
                </button>
              )
            })}
          </div>
        </Dropdown>

        <Dropdown minWidth="min-w-[200px]" align="right"
          trigger={open => (
            <FilterBtn
              label={priceLabel}
              active={!!(appliedPrice.min || appliedPrice.max)}
              onClear={() => { setPriceInputs({ min: "", max: "" }); setAppliedPrice({ min: "", max: "" }); navigate({ minPrice: "", maxPrice: "" }) }}
              open={open}
            />
          )}>
          <div className="px-4 py-3 space-y-2.5">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Price range</p>
            <div className="flex items-center gap-2">
              {(["min", "max"] as const).map(k => (
                <div key={k} className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                  <input type="number" min={0} placeholder={k === "min" ? "Min" : "Max"}
                    value={priceInputs[k]}
                    onChange={e => setPriceInputs(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full pl-5 pr-2 py-1.5 rounded-lg text-xs bg-white/8 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition" />
                </div>
              ))}
            </div>
            <button type="button" onClick={() => { setAppliedPrice({ ...priceInputs }); navigate({ minPrice: priceInputs.min, maxPrice: priceInputs.max }) }}
              className="w-full py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition">
              Apply
            </button>
          </div>
        </Dropdown>
      </div>
    </div>
  )
}

// ─── mobile menu ──────────────────────────────────────────────────────────────
function MobileMenu({
  open, onClose, user, logout, currency, setCurrency, currencies,
}: {
  open: boolean
  onClose: () => void
  user: any
  logout: () => void
  currency: string
  setCurrency: (region: string, currency: string) => void
  currencies: { region: string; currency: string }[]
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex">
      {/* overlay */}
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      {/* panel */}
      <div className="w-72 max-w-[85vw] bg-[#1a1730] h-full flex flex-col shadow-2xl animate-slide-in-right">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          {user ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || user.email)}&background=7c3aed&color=fff`}
                className="w-9 h-9 rounded-full border border-purple-500/40 flex-shrink-0"
                alt="avatar"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <span className="text-lg font-bold text-white">Menu</span>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-white transition flex-shrink-0 ml-2">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {/* Page links */}
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold px-2 mb-2">Browse</p>
          {[
            { href: "/products", label: "Browse All" },
            { href: "/articles", label: "News" },
            { href: "/events", label: "Events" },
            { href: "/merchandise", label: "Merch" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={onClose}
              className="block px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:text-white hover:bg-white/5 transition">
              {label}
            </Link>
          ))}

          <div className="border-t border-white/10 my-4" />

          {/* User links */}
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold px-2 mb-2">Account</p>
          {user ? (
            <>
              <Link href="/profile" onClick={onClose}
                className="block px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:text-white hover:bg-white/5 transition">
                Profile
              </Link>
              <Link href="/orders" onClick={onClose}
                className="block px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:text-white hover:bg-white/5 transition">
                Orders
              </Link>
              <Link href="/support/tickets" onClick={onClose}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:text-white hover:bg-white/5 transition">
                <Ticket size={13} className="opacity-60" /> My Tickets
              </Link>
            </>
          ) : (
            <Link href="/login" onClick={onClose}
              className="block px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:text-white hover:bg-white/5 transition">
              Sign In
            </Link>
          )}

          <div className="border-t border-white/10 my-4" />

          {/* Currency */}
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold px-2 mb-2">Currency</p>
          <div className="flex gap-2 px-2">
            {currencies.map(c => (
              <button key={c.currency} type="button"
                onClick={() => { setCurrency(c.region, c.currency); onClose() }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition border
                  ${currency === c.currency
                    ? "bg-purple-600/20 border-purple-500/40 text-purple-300"
                    : "border-white/15 text-gray-300 hover:text-white hover:bg-white/5"}`}>
                {c.currency}
              </button>
            ))}
          </div>
        </nav>

        {/* Logout */}
        {user && (
          <div className="px-4 py-4 border-t border-white/10">
            <button onClick={() => { logout(); onClose() }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-red-400 hover:bg-white/5 transition">
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.22s ease-out; }
      `}</style>
    </div>
  )
}

// ─── main navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const router = useRouter()
  const { user, logout, loading } = useAuthStore()
  const totalItems = useCartStore(s => s.getTotalItems())
  const { currency, setCurrency } = useCurrencyStore()

  const [scrolled,        setScrolled]        = useState(false)
  const [userMenuOpen,    setUserMenuOpen]    = useState(false)
  const [langOpen,        setLangOpen]        = useState(false)
  const [search,          setSearch]          = useState("")
  const [searchFocused,   setSearchFocused]   = useState(false)
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileSearch,    setMobileSearch]    = useState("")
  const debouncedSearch       = useDebounce(search)
  const debouncedMobileSearch = useDebounce(mobileSearch)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchRef   = useRef<HTMLDivElement>(null)

  const currencies = [
    { region: "US", currency: "USD" },
    { region: "TH", currency: "THB" },
  ]

  function submitMobileSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!mobileSearch.trim()) return
    router.push(`/products?searchWord=${encodeURIComponent(mobileSearch.trim())}`)
    setMobileSearch("")
    setMobileSearchOpen(false)
  }

  const { data: searchResults, isFetching: searchLoading } = useQuery<Product[]>({
    queryKey: ["search-dropdown", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim()) return []
      const res = await api.get(`/products?searchWord=${encodeURIComponent(debouncedSearch)}&limit=6`)
      return res.data.data ?? res.data ?? []
    },
    enabled: !!debouncedSearch.trim(),
    staleTime: 30_000,
  })

  const { data: mobileSearchResults, isFetching: mobileSearchLoading } = useQuery<Product[]>({
    queryKey: ["mobile-search-dropdown", debouncedMobileSearch],
    queryFn: async () => {
      if (!debouncedMobileSearch.trim()) return []
      const res = await api.get(`/products?searchWord=${encodeURIComponent(debouncedMobileSearch)}&limit=8`)
      return res.data.data ?? res.data ?? []
    },
    enabled: !!debouncedMobileSearch.trim() && mobileSearchOpen,
    staleTime: 30_000,
  })

  function goToResult(p: Product) {
    setSearch(""); setSearchFocused(false)
    router.push(`/products/${p.slug ?? p.id}`)
  }
  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!search.trim()) return
    router.push(`/products?searchWord=${encodeURIComponent(search.trim())}`)
    setSearch(""); setSearchFocused(false)
  }

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
      if (searchRef.current   && !searchRef.current.contains(e.target as Node))   setSearchFocused(false)
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setUserMenuOpen(false); setSearchFocused(false) }
    }
    document.addEventListener("mousedown", h)
    document.addEventListener("keydown", esc)
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", esc) }
  }, [])

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", h)
    return () => window.removeEventListener("scroll", h)
  }, [])

  if (loading) return null

  return (
    <>
      {/* Mobile Menu Drawer */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        logout={logout}
        currency={currency}
        setCurrency={setCurrency}
        currencies={currencies}
      />

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[150] bg-[#1a1730] flex flex-col">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <form onSubmit={submitMobileSearch} className="flex-1">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  autoFocus
                  value={mobileSearch}
                  onChange={e => setMobileSearch(e.target.value)}
                  placeholder="Search games…"
                  className="w-full bg-white/10 border border-white/15 rounded-lg
                    pl-9 pr-9 py-2 text-sm text-white placeholder-gray-400
                    focus:outline-none focus:border-purple-500/60 transition"
                />
                {mobileSearch && (
                  <button type="button" onClick={() => setMobileSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                    <X size={13} />
                  </button>
                )}
              </div>
            </form>
            <button onClick={() => { setMobileSearchOpen(false); setMobileSearch("") }}
              className="text-gray-300 hover:text-white text-sm transition flex-shrink-0">
              Cancel
            </button>
          </div>

          {/* Live suggestions */}
          <div className="flex-1 overflow-y-auto">
            {mobileSearchLoading && (
              <div className="px-4 py-4 text-sm text-gray-400 animate-pulse">Searching…</div>
            )}
            {!mobileSearchLoading && debouncedMobileSearch.trim() && mobileSearchResults?.length === 0 && (
              <div className="px-4 py-4 text-sm text-gray-400">
                No results for &ldquo;{debouncedMobileSearch}&rdquo;
              </div>
            )}
            {mobileSearchResults?.map(item => (
              <button key={item.id} type="button"
                onClick={() => {
                  router.push(`/products/${item.slug ?? item.id}`)
                  setMobileSearch("")
                  setMobileSearchOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left border-b border-white/[0.05]">
                {item.media?.[0]?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.media[0].url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm text-white leading-tight truncate">{item.title}</p>
                  {item.platform?.name && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.platform.name}</p>
                  )}
                </div>
              </button>
            ))}
            {/* Press enter hint */}
            {mobileSearch.trim() && !mobileSearchLoading && (
              <button type="button"
                onClick={() => {
                  router.push(`/products?searchWord=${encodeURIComponent(mobileSearch.trim())}`)
                  setMobileSearch("")
                  setMobileSearchOpen(false)
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-purple-400 hover:text-purple-300 hover:bg-white/5 transition">
                <Search size={13} />
                See all results for &ldquo;{mobileSearch}&rdquo;
              </button>
            )}
          </div>
        </div>
      )}

      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
        ${scrolled ? "backdrop-blur-xl bg-black/85" : "bg-[#1a1730]"}`}>

        {/* grid texture */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute inset-0
            bg-[linear-gradient(to_right,rgba(139,92,246,0.06)_1px,transparent_1px),
                linear-gradient(to_bottom,rgba(139,92,246,0.06)_1px,transparent_1px)]
            bg-[size:40px_40px]" />
        </div>

        {/* ── ROW 1 ── */}
        <div className="flex items-center gap-3 md:gap-5 px-4 md:px-8 py-3.5">

          <Link href="/" className="flex-shrink-0 text-xl font-bold text-white tracking-tight">
            Arcade<span className="text-purple-400">Zenter</span>
          </Link>

          {/* Desktop Search */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-2xl mx-4 relative">
            <form onSubmit={submitSearch}>
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Search games…"
                  className="w-full bg-white/10 border border-white/15 rounded-lg
                    pl-9 pr-9 py-2 text-sm text-white placeholder-gray-400
                    focus:outline-none focus:border-purple-500/60 transition"
                />
                {search && (
                  <button type="button" onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                    <X size={13} />
                  </button>
                )}
              </div>
            </form>

            {searchFocused && debouncedSearch.trim() && (
              <div className="absolute top-full mt-2 w-full rounded-xl border border-white/10
                bg-[#1a1730]/98 backdrop-blur-md shadow-2xl shadow-black/60 z-[999] overflow-hidden">
                {searchLoading ? (
                  <div className="px-4 py-3 text-xs text-gray-400 animate-pulse">Searching…</div>
                ) : searchResults?.length ? (
                  searchResults.map(item => (
                    <button key={item.id} type="button" onMouseDown={() => goToResult(item)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition text-left">
                      {item.media?.[0]?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.media[0].url} alt="" className="w-9 h-9 rounded-md object-cover flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm text-white leading-tight">{item.title}</p>
                        {item.platform?.name && <p className="text-xs text-gray-400 mt-0.5">{item.platform.name}</p>}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-xs text-gray-400">
                    No results for &ldquo;{debouncedSearch}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 md:gap-5 flex-shrink-0 ml-auto text-gray-200">

            {/* Currency — desktop only */}
            <div className="hidden md:block relative">
              <button onClick={() => setLangOpen(v => !v)}
                className="flex items-center gap-1 text-sm hover:text-white transition">
                {currency}<ChevronDown size={12} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-3 w-28 bg-[#1a1730] border border-white/15 rounded-xl p-1.5 z-[999] shadow-xl">
                  {currencies.map(c => (
                    <button key={c.currency} type="button"
                      onClick={() => { setCurrency(c.region, c.currency); setLangOpen(false) }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition
                        ${currency === c.currency ? "text-purple-300 bg-purple-500/10" : "text-gray-300 hover:text-white hover:bg-white/5"}`}>
                      {c.currency}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Divider — desktop only */}
            <div className="hidden md:block w-px h-4 bg-white/10" />

            {/* User avatar/login — desktop only */}
            <div className="hidden md:block">
              {!user ? (
                <Link href="/login" className="hover:text-white transition"><User size={19} /></Link>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(v => !v)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user.profileImage || `https://ui-avatars.com/api/?name=${user.email}`}
                      className="w-8 h-8 rounded-full border border-purple-500/40" alt="avatar" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-48 z-50 bg-[#1a1730] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                      <Link href="/profile"         onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 hover:text-white transition">Profile</Link>
                      <Link href="/orders"          onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 hover:text-white transition">Orders</Link>
                      <Link href="/support/tickets" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 hover:text-white transition">
                        <Ticket size={13} className="opacity-60" /> My Tickets
                      </Link>
                      <Link href="/support"         onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 hover:text-white transition">New Ticket</Link>
                      <div className="border-t border-white/10 mx-2 my-1" />
                      <button onClick={() => { logout(); setUserMenuOpen(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-red-400 flex items-center gap-2 transition">
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart — always visible */}
            <div className="relative">
              <Link href="/cart" id="cart-icon" className="hover:text-white transition">
                <ShoppingCart size={19} />
              </Link>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-purple-500 text-white text-[10px] font-semibold px-1.5 py-px rounded-full leading-tight">
                  {totalItems}
                </span>
              )}
            </div>

            {/* Mobile search icon */}
            <button className="md:hidden text-gray-200 hover:text-white transition"
              onClick={() => setMobileSearchOpen(true)}>
              <Search size={19} />
            </button>

            {/* Mobile user avatar / login icon */}
            <button className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
              {user ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || user.email)}&background=7c3aed&color=fff`}
                  className="w-7 h-7 rounded-full border border-purple-500/40"
                  alt="avatar"
                />
              ) : (
                <User size={19} className="text-gray-200 hover:text-white transition" />
              )}
            </button>

            {/* Hamburger — mobile only */}
            <button className="md:hidden text-gray-200 hover:text-white transition"
              onClick={() => setMobileMenuOpen(true)}>
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* ── ROW 2 desktop: wrapped in Suspense because NavFilterRow uses useSearchParams ── */}
        <div className="hidden md:block">
          <Suspense fallback={
            <div className="h-10 border-t border-white/[0.07] px-8 flex items-center gap-2">
              {["All","PC","PlayStation","Xbox","Nintendo"].map(l => (
                <div key={l} className="px-3 py-1.5 rounded-md text-xs text-gray-600">{l}</div>
              ))}
            </div>
          }>
            <NavFilterRow />
          </Suspense>
        </div>

        {/* ── ROW 2 mobile: horizontally scrollable filter chips ── */}
        <div className="md:hidden border-t border-white/[0.07]">
          <Suspense fallback={null}>
            <MobileFilterRow />
          </Suspense>
        </div>
      </header>
    </>
  )
}
