"use client"

import Image from "next/image"
import { motion } from "framer-motion"

interface MenuItem {
  name: string
  image: string
  searchWord?: string
}

export default function MegaMenu({
  title,
  items,
  onItemClick,
}: {
  title: string
  items: MenuItem[]
  onItemClick?: (item: MenuItem) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-[720px] bg-black/95 backdrop-blur-xl border border-cyan-400/30 rounded-2xl shadow-2xl p-8 z-[999]"
    >
      <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-5">
        {title}
      </p>

      <div className="grid grid-cols-3 gap-6">
        {items.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => onItemClick?.(item)}
            className="group text-left"
          >
            <div className="relative h-32 w-full rounded-xl overflow-hidden border border-white/5">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-110 transition duration-500"
              />
              {/* dark overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-300" />
            </div>
            <p className="mt-3 text-sm text-gray-300 group-hover:text-cyan-300 transition font-medium">
              {item.name}
            </p>
          </button>
        ))}
      </div>
    </motion.div>
  )
}
