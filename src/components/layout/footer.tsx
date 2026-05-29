import Link from "next/link"

const LINKS = [
  {
    heading: "Shop",
    items: [
      { label: "Games",       href: "/products" },
      { label: "Merchandise", href: "/merchandise" },
      { label: "Events",      href: "/events" },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "My Orders",  href: "/orders" },
      { label: "My Tickets", href: "/support/tickets" },
      { label: "Profile",    href: "/profile" },
    ],
  },
  {
    heading: "Info",
    items: [
      { label: "News & Articles", href: "/articles" },
      { label: "Support",         href: "/support" },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#111020] mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1 space-y-3">
          <p className="text-lg font-bold text-white">
            Arcade<span className="text-purple-400">Zenter</span>
          </p>
          <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
            Your destination for games, events, and gaming gear.
          </p>
        </div>

        {/* Link columns */}
        {LINKS.map(col => (
          <div key={col.heading} className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{col.heading}</p>
            <ul className="space-y-2">
              {col.items.map(item => (
                <li key={item.href}>
                  <Link href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.05] px-8 py-4 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} ArcadeZenter. All rights reserved.
      </div>
    </footer>
  )
}
