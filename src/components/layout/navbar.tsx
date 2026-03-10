"use client"

import Link from "next/link"
import { User, LogOut, Heart, ShoppingCart } from "lucide-react"
import { useAuthStore } from "@/store/auth.store"
import { useCartStore } from "@/store/cart.store"
import { useState, useRef, useEffect } from "react"
import MegaMenu from "@/components/navbar/MegaMenu"

export default function Navbar() {
  const { user, logout, loading } = useAuthStore()
  const totalItems = useCartStore((state) => state.getTotalItems())

  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [results, setResults] = useState<any[]>([])

  const [langOpen, setLangOpen] = useState(false)

  const [showLowerNav, setShowLowerNav] = useState(true)
  const [hoveringTop, setHoveringTop] = useState(false)
  const lastScrollY = useRef(0)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const menus: {
    label: string
    items: { name: string; image: string }[]
  }[] = [
    {
      label: "PC",
      items: [
        { name: "Steam", image: "https://picsum.photos/400/300?1" },
        { name: "Epic Games", image: "https://picsum.photos/400/300?2" },
        { name: "Battle.net", image: "https://picsum.photos/400/300?3" },
      ],
    },
    {
      label: "PLAYSTATION",
      items: [
        { name: "PS5", image: "https://picsum.photos/400/300?4" },
        { name: "PS4", image: "https://picsum.photos/400/300?5" },
        { name: "PS Plus", image: "https://picsum.photos/400/300?6" },
      ],
    },
    {
      label: "XBOX",
      items: [
        { name: "Series X", image: "https://picsum.photos/400/300?7" },
        { name: "Game Pass", image: "https://picsum.photos/400/300?8" },
        { name: "Controllers", image: "https://picsum.photos/400/300?9" },
      ],
    },
    {
      label: "NINTENDO",
      items: [
        { name: "Switch", image: "https://picsum.photos/400/300?10" },
        { name: "Zelda", image: "https://picsum.photos/400/300?11" },
        { name: "Mario", image: "https://picsum.photos/400/300?12" },
      ],
    },
  ]

  // Close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEsc)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [])

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY

      // shrink background
      setScrolled(currentY > 40)

      // Always show when near top
      if (currentY < 80) {
        setShowLowerNav(true)
      }
      // Hide when scrolling down
      else if (currentY > lastScrollY.current) {
        setShowLowerNav(false)
      }
      // Show when scrolling up
      else {
        setShowLowerNav(true)
      }

      lastScrollY.current = currentY
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Search dropdown
  useEffect(() => {
    if (!search) {
      setResults([])
      return
    }

    const timeout = setTimeout(() => {
      setResults([
        { id: 1, title: "God of War Ragnarok" },
        { id: 2, title: "Spider-Man 2" },
        { id: 3, title: "Final Fantasy XVI" },
      ])
    }, 300)

    return () => clearTimeout(timeout)
  }, [search])

  if (loading) return null

  return (
    <header
      onMouseEnter={() => setHoveringTop(true)}
      onMouseLeave={() => setHoveringTop(false)}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
        ${scrolled
          ? "backdrop-blur-xl bg-black/80"
          : "bg-[#2d2a5a]"
        }`}
    >
      {/* Top Glow Line */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 w-full h-full 
            bg-[linear-gradient(to_right,rgba(0,255,255,0.05)_1px,transparent_1px),
                linear-gradient(to_bottom,rgba(0,255,255,0.05)_1px,transparent_1px)]
            bg-[size:40px_40px]
            animate-grid-move" />
      </div>

      {/* ================= TOP ROW ================= */}
      <div
        className="flex items-center justify-between px-8 py-4"
      >

        {/* Logo + Tagline */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-2xl font-extrabold text-white tracking-wider"
          >
            ArcadeZenter
          </Link>

          <span className="hidden lg:block text-sm text-gray-300">
            PAY LESS. GAME MORE.
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-10 hidden md:block">
          <div className="relative w-full">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title..."
              className="w-full rounded-full bg-white/90 pl-12 pr-5 py-2 text-black"
            />

            {results.length > 0 && (
              <div className="absolute top-full mt-3 w-full 
                              bg-black/95 border border-cyan-400/30
                              rounded-xl p-4 shadow-xl z-[999]">
                {results.map((item) => (
                  <div
                    key={item.id}
                    className="py-2 hover:text-cyan-300 cursor-pointer"
                  >
                    {item.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-6 text-white text-sm">

          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)}>ENG ▼</button>

            {langOpen && (
              <div className="absolute right-0 mt-3 w-28 
                              bg-black border border-cyan-400/40 
                              rounded-lg p-2 z-[999]">
                <div className="hover:text-cyan-300 cursor-pointer">ENG</div>
                <div className="hover:text-cyan-300 cursor-pointer">TH</div>
              </div>
            )}
          </div>

          <Heart className="hover:text-fuchsia-400 cursor-pointer transition" />

          {/* User */}
          {!user ? (
            <Link href="/login">
              <User className="hover:text-fuchsia-400 transition" />
            </Link>
          ) : (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setOpen((prev) => !prev)}>
                <img
                  src={
                    user.profileImage ||
                    `https://ui-avatars.com/api/?name=${user.email}`
                  }
                  className="w-9 h-9 rounded-full border border-cyan-400/50"
                />
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-48 z-50
                                backdrop-blur-xl bg-black/90
                                border border-cyan-400/40
                                rounded-xl shadow-lg overflow-hidden">
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 hover:bg-cyan-400/10"
                  >
                    Profile
                  </Link>

                  <Link
                    href="/orders"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 hover:bg-cyan-400/10"
                  >
                    Orders
                  </Link>

                  <Link
                    href="/support"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 hover:bg-cyan-400/10"
                  >
                    Support
                  </Link>

                  <button
                    onClick={() => {
                      logout()
                      setOpen(false)
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-fuchsia-500/20 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Cart */}
          <div className="relative">
            <Link href="/cart" id="cart-icon">
              <ShoppingCart className="hover:text-fuchsia-400 transition" />
            </Link>

            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-fuchsia-500 text-black text-xs font-bold px-2 py-0.5 rounded-full animate-bounce">
                {totalItems}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SECOND ROW */}
      <div
        className={`transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${showLowerNav || hoveringTop
            ? "max-h-[80px] opacity-100"
            : "max-h-0 opacity-0"
          }`}
      >
        <div className="flex items-center justify-between px-8 py-3 border-t border-white/10 text-white text-sm">
          
          <div className="flex items-center gap-8 font-medium relative">
            {menus.map((menu) => (
              <div
                key={menu.label}
                className="relative group"
                onMouseLeave={() => {
                  timeoutRef.current = setTimeout(() => {
                    setActiveMenu(null)
                  }, 150)
                }}

                onMouseEnter={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current)
                  setActiveMenu(menu.label)
                }}
              >
                <span className="nav-link cursor-pointer hover:text-cyan-300 transition">
                  {menu.label} ▼
                </span>

                {activeMenu === menu.label && (
                  <div className="absolute left-0 top-full pt-4">
                    <MegaMenu title={menu.label} items={menu.items} />
                  </div>
                )}
              </div>
            ))}

            <span className="nav-link cursor-pointer hover:text-cyan-300">
              GIFT CARDS
            </span>
          </div>

          <div className="flex items-center gap-8 font-semibold">
            <Link href="/products" className="nav-link hover:text-fuchsia-400">
              DEALS
            </Link>
            <Link href="/products" className="nav-link hover:text-fuchsia-400">
              LATEST GAMES
            </Link>
            <span className="nav-link hover:text-fuchsia-400 cursor-pointer">
              PRE-ORDER
            </span>
          </div>

        </div>
      </div>
    </header>
  )
}
