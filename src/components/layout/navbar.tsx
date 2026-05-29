"use client"

import Link from "next/link"
import {
  User, LogOut, ShoppingCart, Ticket,
  Search, X, ChevronDown,
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

  const [platformId,   setPlatformId]   = useState(searchParams.get("platformId") ?? "")
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
      setPlatformId(searchParams.get("platformId") ?? "")
      setCategoryIds(searchParams.getAll("categoryIds"))
      const min = searchParams.get("minPrice") ?? ""
      const max = searchParams.get("maxPrice") ?? ""
      setPriceInputs({ min, max })
      setAppliedPrice({ min, max })
    }
  }, [pathname, searchParams])

  const navigate = useCallback((overrides: {
    platformId?: string; categoryIds?: string[]
    minPrice?: string; maxPrice?: string
  } = {}) => {
    const pid  = overrides.platformId  ?? platformId
    const cats = overrides.categoryIds ?? categoryIds
    const min  = overrides.minPrice    ?? appliedPrice.min
    const max  = overrides.maxPrice    ?? appliedPrice.max
    const q = new URLSearchParams()
    if (pid)  q.set("platformId", pid)
    cats.forEach(id => q.append("categoryIds", id))
    if (min)  q.set("minPrice", min)
    if (max)  q.set("maxPrice", max)
    const qs = q.toString()
    if (pathname === "/products") {
      router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false })
    } else {
      router.push(`/products${qs ? `?${qs}` : ""}`)
    }
  }, [pathname, router, platformId, categoryIds, appliedPrice])

  function selectPlatform(id: string) {
    const next = id === platformId ? "" : id
    setPlatformId(next)
    navigate({ platformId: next })
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
    setPlatformId(""); setCategoryIds([])
    setPriceInputs({ min: "", max: "" }); setAppliedPrice({ min: "", max: "" })
    if (pathname === "/products") router.replace("/products", { scroll: false })
  }

  const hasFilters = !!platformId || categoryIds.length > 0 || !!appliedPrice.min || !!appliedPrice.max
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
            ${!platformId
              ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
              : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"}`}>
          All
        </button>
        {platforms?.map(p => (
          <button key={p.id} type="button" onClick={() => selectPlatform(p.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition
              ${platformId === p.id
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

// ─── main navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const router = useRouter()
  const { user, logout, loading } = useAuthStore()
  const totalItems = useCartStore(s => s.getTotalItems())
  const { currency, setCurrency } = useCurrencyStore()

  const [scrolled,      setScrolled]      = useState(false)
  const [userMenuOpen,  setUserMenuOpen]  = useState(false)
  const [langOpen,      setLangOpen]      = useState(false)
  const [search,        setSearch]        = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const debouncedSearch = useDebounce(search)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchRef   = useRef<HTMLDivElement>(null)

  const currencies = [
    { region: "US", currency: "USD" },
    { region: "TH", currency: "THB" },
  ]

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
      <div className="flex items-center gap-5 px-8 py-3.5">

        <Link href="/" className="flex-shrink-0 text-xl font-bold text-white tracking-tight">
          Arcade<span className="text-purple-400">Zenter</span>
        </Link>

        {/* Search */}
        <div ref={searchRef} className="flex-1 max-w-2xl mx-4 relative">
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
        <div className="flex items-center gap-5 flex-shrink-0 ml-auto text-gray-200">

          <div className="relative">
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

          <div className="w-px h-4 bg-white/10" />

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
        </div>
      </div>

      {/* ── ROW 2: wrapped in Suspense because NavFilterRow uses useSearchParams ── */}
      <Suspense fallback={
        <div className="h-10 border-t border-white/[0.07] px-8 flex items-center gap-2">
          {["All","PC","PlayStation","Xbox","Nintendo"].map(l => (
            <div key={l} className="px-3 py-1.5 rounded-md text-xs text-gray-600">{l}</div>
          ))}
        </div>
      }>
        <NavFilterRow />
      </Suspense>
    </header>
  )
}
